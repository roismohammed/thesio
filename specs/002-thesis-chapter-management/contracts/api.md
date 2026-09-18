# API Contract: Thesis Chapter Management

**Branch**: `002-thesis-chapter-management` | **Date**: 2026-08-04

Stateful Sanctum cookie auth (existing `api.ts` client). New routes live in
`routes/thesis.php`, loaded via the `then` callback in `bootstrap/app.php`,
wrapped in `web` + `auth` middleware, under the `api` prefix — mirroring the
existing `auth.php`/`admin.php` pattern. Every response is JSON; errors use
the existing `{ message }` shape consumed by `api.ts`.

All endpoints are scoped to the authenticated student's own thesis/chapter.
A foreign `id` resolves to 404 (global scope + policy), satisfying FR-013/SC-005.

Envelopes follow the existing convention: collections return
`{ data: [...], meta: { current_page, last_page, total } }`; single resources
return `{ data: {...} }`; successful mutations with no body return `204`.

## Resource shapes

```
Thesis        { id, title, status, created_at, updated_at,
                chapters_count?, chapters?: Chapter[] }
Chapter       { id, thesis_id, title, position, status,
                current_version?: ChapterVersion, versions_count?,
                created_at, updated_at }
ChapterVersion { id, chapter_id, version_number, source,
                 original_file_name?, mime?, size?, conversion_status,
                 conversion_message?, markdown_content?, uploaded_by,
                 created_at }
Reference     { id, chapter_id, type, title, url?, file_name?, mime?, size?,
                created_at, updated_at }
SupervisionNote { id, chapter_id, content, created_at, updated_at }
Paraphrase    { id, chapter_id, original_selection, paraphrased_text?,
                outcome, created_at }
```

`markdown_content` is omitted from list/history payloads and only included on
the single-version detail endpoint to keep responses small.

## Endpoints

### Thesis
- `GET /api/thesis` — list the student's theses (v1: typically one).
- `POST /api/thesis` — create. Body: `{ title }`. → `201 { data: Thesis }`.
- `GET /api/thesis/{thesis}` — show, with chapters.
- `PATCH /api/thesis/{thesis}` — update. Body: `{ title?, status? }`.
- `DELETE /api/thesis/{thesis}` — delete (cascades chapters + children).

### Chapter
- `GET /api/thesis/{thesis}/chapters` — list chapters of a thesis.
- `POST /api/thesis/{thesis}/chapters` — create. Body: `{ title, position? }`.
  → `201 { data: Chapter }`.
- `GET /api/thesis/{thesis}/chapters/{chapter}` — show one chapter with its
  current version (incl. `markdown_content`), references, supervision note,
  and a versions summary (FR-012 — one view).
- `PATCH /api/thesis/{thesis}/chapters/{chapter}` — update
  `{ title?, position?, status? }`.
- `DELETE /api/thesis/{thesis}/chapters/{chapter}` — delete chapter + all
  children (no orphans).

### Chapter version (upload + history)
- `POST /api/thesis/{thesis}/chapters/{chapter}/versions` — **multipart** upload
  of a PDF/Word file. Creates a new version (`source=upload`), points the
  chapter's `current_version_id` at it, dispatches
  `ConvertChapterToMarkdownJob`. → `201 { data: ChapterVersion }` with
  `conversion_status=pending`.
- `GET /api/thesis/{thesis}/chapters/{chapter}/versions` — version history
  (no `markdown_content`).
- `GET /api/thesis/{thesis}/chapters/{chapter}/versions/{version}` — single
  version **with** `markdown_content`.
- `GET /api/thesis/{thesis}/chapters/{chapter}/versions/{version}/download` —
  streams the original stored file (private disk, authorized).
- `POST /api/thesis/{thesis}/chapters/{chapter}/versions/{version}/revert` —
  sets the chapter's `current_version_id` to this earlier version. Other
  versions remain. → `200 { data: Chapter }`.

### Reference
- `GET /api/thesis/{thesis}/chapters/{chapter}/references` — list the
  chapter's references.
- `POST /api/thesis/{thesis}/chapters/{chapter}/references` — create.
  - Link: JSON `{ type:"link", title, url }`.
  - File: **multipart** `{ type:"file", title, file }`.
  → `201 { data: Reference }`. Invalid `url` → `422 { message }` (FR-009).
- `PATCH /api/thesis/{thesis}/chapters/{chapter}/references/{reference}` —
  update `{ title?, url? }` (link) or `{ title? }` (file).
- `DELETE /api/thesis/{thesis}/chapters/{chapter}/references/{reference}` —
  delete; file references remove the stored file. → `204`.
- `GET /api/thesis/{thesis}/chapters/{chapter}/references/{reference}/download`
  — streams a file-type reference's stored file (authorized).

### Supervision note (spec "Notulen")
- `GET /api/thesis/{thesis}/chapters/{chapter}/notulen` — show the chapter's
  note; `404` if none yet (frontend treats 404 as "empty, ready to create").
- `PUT /api/thesis/{thesis}/chapters/{chapter}/notulen` — create-or-update
  upsert. Body: `{ content }`. → `200 { data: SupervisionNote }`.
- `DELETE /api/thesis/{thesis}/chapters/{chapter}/notulen` — delete. → `204`.

### Paraphrase
- `POST /api/thesis/{thesis}/chapters/{chapter}/paraphrase` — request a
  paraphrase preview. Body: `{ selection }` (1..5000 chars). Returns the LLM
  result **without** mutating the chapter:
  `{ data: { paraphrased_text, paraphrase_id } }`. Records a `Paraphrase` row
  with `outcome=discarded` initially (FR-023, FR-025, FR-026).
- `POST /api/thesis/{thesis}/chapters/{chapter}/paraphrase/{paraphrase}/apply`
  — accept the preview. Replaces the selection in the current version's
  Markdown, snapshots a new `ChapterVersion` (`source=paraphrase`) for
  recoverability, marks the `Paraphrase` `outcome=applied`. →
  `200 { data: ChapterVersion }` (the new current version).

## Status codes
- `200` success (default), `201` created, `204` no content, `404` not found /
  not owned, `422` validation error (friendly `{ message }`), `500` server
  error. Paraphrase LLM failures return `422` with a friendly "coba lagi"
  message and never alter the chapter text (FR-026).

## Activity log
Every create/update/delete (thesis, chapter, version, reference, note) and
every paraphrase accept/discard/fail records a narrative `activity('thesis')`
entry — causer = `request()->user()`, subject = the affected model.