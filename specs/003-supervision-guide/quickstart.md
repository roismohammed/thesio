# Quickstart — Validation Guide

**Feature**: 003-supervision-guide | **Date**: 2026-08-06

Manual end-to-end validation scenarios that prove the feature works. This is a **validation/run guide**, not implementation — code lives in `tasks.md` and the implementation phase. Per project policy there are no automated tests; verify via the steps below.

## Prerequisites

- `apps/api` running (`composer run dev` from `apps/api` — run this yourself; the agent does not start dev servers).
- `apps/web` running (`bun run dev` from `apps/web` — run this yourself).
- A logged-in student with an **active thesis** that has **≥1 chapter** (created via the existing `002` flows).
- `.env` (apps/api) configured for **OpenRouter**:
  ```
  LLM_BASE_URL=https://openrouter.ai/api/v1
  LLM_API_KEY=<your openrouter key>
  LLM_MODEL=<e.g. openrouter/auto>
  ```
- Migrations applied: `php artisan migrate` (run yourself). Adds `defense_deadline_at` + `guidance_last_viewed_at` to `theses`, and creates `supervision_guides` + `guidance_points`.

## Scenario 1 — Set defense deadline (thesis extension)

1. Open the thesis, edit it, set **deadline sidang** to a future date (e.g. +30 days), save.
2. **Expected**: deadline shown on the thesis; activity log entry "Menetapkan deadline sidang skripsi '...' pada ...".
3. `GET /api/thesis/{thesis}` returns `defense_deadline_at`.

## Scenario 2 — On-demand generation (happy path)

1. Ensure the thesis has ≥1 chapter and ≥1 notulen (record one via the chapter notulen tab if none).
2. Open **Skripsi › Bimbingan › Panduan** (`/thesis/{thesisId}/guidance`).
3. Empty state shows (no current guide yet). Click **"Buat agenda sekarang"** (on-demand).
4. **Expected**: within ~30s, the agenda appears with several discussion points, each linked to a chapter (and/or notulen), ordered by `priority`; a **sisa waktu menuju sidang** badge shows remaining days; an unread indicator appears.
5. Activity log: "Membuat agenda bimbingan atas permintaan untuk skripsi '...' — N poin diskusi."

## Scenario 3 — Tailoring (US2)

1. On the agenda, **remove** one point, **mark** one as "siap dibawa", and **add** a custom point ("Tanyakan contoh penelitian sejenis").
2. Reload the page.
3. **Expected**: all edits persist; custom point is visually distinct from system points; `is_tailored` becomes true (the guide now shows a "sedang disesuaikan" hint).
4. Activity log entries for add / mark / delete (narrative Indonesian).

## Scenario 4 — Scheduled generation runs (US1 + guards)

1. Run the scheduler command manually (bypassing the weekly cron):
   ```
   php artisan guidance:generate-scheduled
   ```
2. **Case A — current guide NOT tailored**: a new current guide is generated; the previous one is archived (visible in history). Activity log: "Membuat agenda bimbingan otomatis ...".
3. **Case B — current guide IS tailored** (from Scenario 3): generation is **skipped** for that thesis; activity log shows a "dilewati karena sedang disesuaikan" note; the tailored current guide stays. The page shows "Ada panduan terbaru yang bisa kamu terapkan" with a Regenerate action.
4. **Case C — thesis has no chapters**: skipped, no guide created.

## Scenario 5 — Deadline-aware prioritisation (Q2: reorder only)

1. Set the defense deadline **very close** (e.g. +3 days).
2. Trigger an on-demand generation.
3. **Expected**: urgent points (open notulen revisions, draft chapters) appear first; **all points remain fully visible** (none collapsed or hidden). Reorder-only.

## Scenario 6 — Unread indicator clears on open (Q3)

1. After a scheduled run produces a new current guide (Scenario 4 Case A), the guidance nav entry shows an unread indicator.
2. Open the guidance page.
3. **Expected**: indicator clears (`guidance_last_viewed_at` updated); on reload, no unread indicator.

## Scenario 7 — Edge cases

1. **No notulen, has chapters + deadline**: generate on demand → agenda derived from chapters/statuses/deadline, with a note that no prior notulen exist.
2. **No defense deadline set**: generate → agenda produced without deadline-aware ordering; a nudge to set the deadline is shown.
3. **Deadline passed**: `php artisan guidance:generate-scheduled` → no new guide; student sees "deadline sidang telah terlewati".
4. **LLM failure**: temporarily set an invalid `LLM_API_KEY`, generate on demand → friendly "Gagal membuat agenda bimbingan. Silakan coba lagi." within the timeout; previous current guide (if any) intact; failure activity log entry.
5. **All chapters final + no open notulen**: generate → agenda with zero points and a "tidak ada poin mendesak" message (valid, not an error).

## Scenario 8 — History (US3)

1. After ≥2 generations (scheduled/on-demand), open history on the guidance page.
2. **Expected**: each past agenda listed with generation date, origin (scheduled/on-demand), point counts; opening one shows its points' point-in-time statuses and links.

## Ownership check

1. As student A, note the URL `/api/thesis/{A}/supervision-guides/current`.
2. As student B (different account), `GET` that URL.
3. **Expected**: `403`/not found — cross-student access is impossible (`OwnedByUserScope` + policy). Same for point PATCH/DELETE.

## Objective checks (run yourself, no dev servers started by the agent)

- PHP syntax: `php -l` on each new PHP file in `apps/api/app/{Models,Actions,Services,Http,Console,Policies}`.
- TS type check: `npx tsc --noEmit --incremental` from `apps/web`.
- PHP format: `vendor/bin/pint` from `apps/api`.
- (Do **not** run `php artisan test` unless explicitly requested — project has no test suite.)
- Start servers yourself: `composer run dev` (apps/api), `bun run dev` (apps/web).