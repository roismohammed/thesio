# Quickstart — Supervision Note Rich Text & Date

Runnable validation scenarios that prove the feature works end-to-end. This is a validation guide,
not an implementation reference — implementation details live in `tasks.md`.

## Prerequisites

- `apps/api`: dependencies installed, `.env` configured, `php artisan key:generate` run, migrations
  applied (`php artisan migrate`).
- `apps/web`: dependencies installed (`bun install`, including the new tiptap deps).
- A student user with a thesis that has at least one chapter.

## Backend checks

Run from `apps/api`.

1. **Syntax** every modified PHP file:
   `php -l app/Models/SupervisionNote.php` and likewise for the Request, Controller, Service,
   Action, and the new migration. All must print "No syntax errors detected".
2. **Migrate** the new column:
   `php artisan migrate` — adds `supervision_notes.session_date`.
3. **Endpoint behavior** (via `php artisan tinker` or an HTTP client as the student):

   | Scenario | Request | Expected |
   |---|---|---|
   | Create note | `PUT /api/thesis/{t}/chapters/{c}/notulen` body `{"session_date":"2026-08-05","content":"<p>Perjelas rumusan masalah.</p>"}` | 200, response `data.session_date === "2026-08-05"`, `data.content` preserved |
   | Update note | same PUT with changed `content` | 200, `data.updated_at` advances |
   | Future date rejected | `session_date` = tomorrow | 422 with session_date error |
   | Empty rich text rejected | `content` = `"<p></p>"` | 422 with content error |
   | Whitespace-only rejected | `content` = `"<ul><li>  </li></ul>"` | 422 with content error |
   | Show note | `GET /api/thesis/{t}/chapters/{c}/notulen` | 200, `data` carries `session_date` + HTML `content` |
   | Show empty | `GET …/notulen` on a chapter with no note | 200, `data: null` |
   | History list | `GET /api/thesis/{t}/notulen` | 200, one row per chapter with `has_note`, `session_date`, `content_excerpt` |
   | Delete | `DELETE /api/thesis/{t}/chapters/{c}/notulen` | 204; subsequent show returns `data: null` |
   | Delete missing | `DELETE` on a chapter with no note | 404 |

4. **Legacy readability (FR-009)**: before migrating content, leave an existing plain-text row as-is.
   After the change, `GET …/notulen` returns the plain text in `content`; the frontend viewer
   renders it as a plain paragraph — no data loss.
5. **Activity log (FR-010)**: after create/update/delete, inspect the `activity_log` table (or
   `activity('thesis')` log) and confirm a narrative Indonesian entry mentioning the chapter title
   and (for upsert) the session date.

See `contracts/api.md` for exact request/response shapes and `data-model.md` for validation rules.

## Frontend checks

Run from `apps/web`.

1. **Type check**: `npx tsc --noEmit --incremental` passes (no new type errors).
2. **Lint**: `bun run lint` passes (if run).

## Manual end-to-end (user runs `bun run dev` from `apps/web` and `composer run dev` from `apps/api`)

1. **Record (US1)**: open a chapter → Notulen tab → empty state → pick a bimbingan date via the
   calendar popover → write notes with a heading, a bullet list, bold, and italic → "Simpan
   Notulen". Toast: "Notulen berhasil disimpan." The note is stored with both date and formatted
   content.
2. **View (US2)**: reopen the tab → the date and fully formatted notes render (headings/lists/
   emphasis intact) within 2 s (SC-002). A chapter with no note shows the friendly empty state.
3. **Update (US3)**: click "Edit" → change the date and notes → save → the read-only view reflects
   the update.
4. **Delete (US3)**: click "Hapus Notulen" → AlertDialog asks for confirmation → confirm → empty
   state returns. Cancelling the dialog keeps the note.
5. **Future date guard**: try selecting a future date in the popover — it is disabled; if a future
   date is forced, backend returns 422 and a toast shows the error.
6. **Empty content guard**: clear the editor and save → client zod blocks submit (or backend 422
   toast).
7. **Legacy note**: a chapter whose note was plain text still shows that text as a readable
   paragraph.
8. **Riwayat Notulen (history)**: from the thesis detail page, open "Riwayat Notulen" → datatable
   lists every chapter with its bimbingan date, an excerpt, and last-updated time; chapters without
   a note show `—`/empty. Search by chapter title filters the rows. Clicking a chapter row opens
   that chapter's Notulen tab. Breadcrumb shows `Skripsi → {thesis title} → Riwayat Notulen`.

## Out of scope

- No automated tests are written (project policy) unless the user explicitly requests them.
- Mobile-dedicated layouts are out of scope (target is the existing web SPA).