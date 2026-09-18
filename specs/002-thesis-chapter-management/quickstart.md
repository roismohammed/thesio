# Quickstart: Thesis Chapter Management

**Branch**: `002-thesis-chapter-management` | **Date**: 2026-08-04

A runnable validation guide proving the feature works end-to-end. Implementation
details live in `tasks.md`; shapes and rules live in `data-model.md` and
`contracts/api.md`.

## Prerequisites

- `apps/api`: `composer install`, `.env` copied from `.env.example`, `php artisan
  key:generate`. DB = SQLite (default). New deps added by this feature:
  `smalot/pdfparser`, `phpoffice/phpword`, `league/html-to-markdown`,
  `openai-php/laravel`. **System binary `pandoc`** recommended on PATH for
  best conversion quality (pure-PHP fallback otherwise).
- `apps/web`: `bun install`. New deps: `@tanstack/react-table`,
  `react-hook-form`, `zod`, `@hookform/resolvers`.
- LLM env (paraphrase): `LLM_BASE_URL`, `LLM_API_KEY`, `LLM_MODEL` set in
  `apps/api/.env`. Without them, paraphrase gracefully returns "coba lagi" and
  the rest of the feature still works.
- Run migrations: `php artisan migrate` (creates `theses`, `chapters`,
  `chapter_versions`, `chapter_references`, `supervision_notes`, `paraphrases`).
- Start backend: user runs `composer run dev` (serves + queue:listen + pail +
  vite). The queue worker is required because Markdown conversion is a queued
  job. Start frontend: user runs `bun run dev` in `apps/web`.
- Storage: `php artisan storage:link` is **not** required — chapter and
  reference files live on the `private` disk and stream through authenticated
  controller routes.

## Validation scenarios

These exercise the four user stories against the running stack. Each is
manually driven through the SPA at `http://localhost:<vite-port>` while logged
in as a student.

### S1 — Upload a chapter and see converted Markdown (US1)
1. Log in; navigate to `/thesis`; create a thesis "Skripsi Saya".
2. Add a chapter "Bab I — Pendahuluan" (status shows `draft`).
3. Upload a small **text-based** PDF or `.docx` for the chapter. Expect the
   chapter detail to show the converted Markdown once the queued job finishes
   (reload if needed). Confirm the original file is downloadable.
4. Upload a newer version of the same chapter. Expect a new version in the
   history, the viewer now showing the new Markdown, and the previous version
   still listed and downloadable. Revert to the previous version and confirm
   the viewer switches back while history is preserved.
5. Upload an **image-only/scanned** PDF. Expect a friendly "konten tidak dapat
   dikonversi" message, the original file still stored and downloadable, and
   the option to re-upload. (FR-022, edge case.)
6. Upload an oversized (>10 MB) or wrong-format file. Expect a friendly
   rejection with the limit + accepted formats. (FR-005, edge case.)
7. Reload the browser. Confirm the chapter, its current Markdown, and version
   history persist.

### S2 — Per-chapter references (US2)
1. Open a chapter; add a link reference (`title` + `https://...` URL). It
   appears under that chapter only and opens the URL.
2. Add a malformed/non-http(s) URL. Expect a friendly validation rejection.
   (FR-009, edge case.)
3. Upload a journal/article file reference. It appears and downloads later.
4. Edit the link's title/URL; delete the file reference. Confirm the list
   updates and the other reference remains.
5. Open a second chapter. Confirm it shows only its own references, never the
   first chapter's. (FR-007.)

### S3 — Per-chapter supervision note / notulen (US3)
1. Open a chapter with no document yet. Create a notulen. Expect it saved and
   visible on reopen (spec edge case: note allowed before any draft).
2. Update the notulen; reopen the chapter and confirm the latest content shows.
3. Open a different chapter; confirm its notulen does not appear on the first.
   (FR-010, FR-011, FR-016.)
4. Follow a notulen's points and re-upload a corrected chapter doc (S1);
   confirm the notulen remains accessible for that chapter.

### S4 — Paraphrase chapter text (US4)
1. Open a chapter with converted Markdown; select a paragraph; request a
   paraphrase. Expect a preview alongside the original. (FR-023.)
2. Accept the preview. Confirm the chapter's Markdown now shows the
   paraphrased text in place of the selection and a new version is
   snapshot (pre-edit text recoverable via history). (FR-024, edge case.)
3. Repeat, but discard the preview. Confirm the chapter text is unchanged.
4. With LLM misconfigured/unavailable, request a paraphrase. Expect a friendly
   "coba lagi" message and the chapter text untouched. (FR-026.)
5. Select >5000 chars or an empty selection. Expect a friendly rejection
   without altering the text. (FR-025.)

### S5 — Isolation & audit (cross-cutting)
1. Log in as student A, create a thesis/chapter, then log in as student B and
   attempt to reach A's thesis/chapter/versions/references/notulen by id.
   Expect every attempt to 404. (FR-013, SC-005.)
2. Inspect the `activity_log` table (or any admin log view) after the above
   scenarios. Expect narrative Indonesian entries for each create/update/delete
   and each paraphrase accept/discard/fail, naming the actor and what changed.
   (FR-014, FR-027, SC-006.)

## Objective checks before handoff
- `php -l` on every new PHP file; `php artisan test` (no new tests added unless
  the user asks — see project CLAUDE.md).
- `vendor/bin/pint` on touched PHP.
- `npx tsc --noEmit --incremental` (or `npx tsc -b`) in `apps/web`.
- Diff inspection for the new `components/forms`, `components/datatable`, and
  the `features/thesis` pages against the constitution (size limits, breadcrumb,
  placement, English identifiers).