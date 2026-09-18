# API Contract — Supervision Guidance

**Feature**: 003-supervision-guide | **Base**: `/api` (loaded via `routes/thesis.php`, `web`+`auth` middleware) | **Auth**: session/`auth`; ownership per `OwnedByUserScope` + policies.

All responses wrap the resource in `{ "data": ... }` (matching the existing thesis endpoints). Errors return `{ "message": "..." }` with the stated status. UI text in messages is semi-formal friendly Indonesian.

## Thesis extension (defense deadline)

The defense deadline is set through the existing thesis update endpoint (extended to accept the new field).

### `PATCH /api/thesis/{thesis}`
Body (additive, existing fields unchanged):
```json
{ "defense_deadline_at": "2026-09-30" }
```
- `defense_deadline_at`: nullable, date, `after:today`.
Response: existing `Thesis` resource (now includes `defense_deadline_at`, `guidance_last_viewed_at`).
Auth: `update` on `Thesis`.

---

## Supervision guides

### `GET /api/thesis/{thesis}/supervision-guides/current`
Returns the **current** guide with its points (ordered by `priority` asc) plus the derived unread flag and deadline-remaining context.
```json
{
  "data": {
    "id": 12,
    "thesis_id": 3,
    "origin": "scheduled",
    "status": "current",
    "is_tailored": false,
    "generated_at": "2026-08-10T08:00:00.000000Z",
    "defense_deadline_at": "2026-09-30T00:00:00.000000Z",
    "defense_remaining_days": 51,
    "is_unread": true,
    "points": [
      {
        "id": 101, "origin": "system", "title": "Tinjau ulang Bab II",
        "description": "Notulen bimbingan 2026-08-02 menandai revisi kerangka teori.",
        "status": "pending", "priority": 1,
        "chapter_id": 7, "supervision_note_id": 4
      }
    ]
  }
}
```
- `is_unread`: `true` when `generated_at > thesis.guidance_last_viewed_at`.
- If no current guide exists: `200` with `"data": null` (the UI shows the empty state).
- If the thesis has no chapters: `200` with `"data": null` and a `message` guiding the student to create a chapter first (the page renders that empty state; no 4xx — "no guide yet" is a valid state, not an error).
Auth: `view` on `Thesis`. Side effect: sets `thesis.guidance_last_viewed_at = now` (clears the unread flag — FR-019).

### `POST /api/thesis/{thesis}/supervision-guides`
On-demand generation. No body. Returns the freshly generated current guide (same shape as `current`).
- Success: `201` with the new guide.
- LLM/parse failure: `422` `{ "message": "Gagal membuat agenda bimbingan. Silakan coba lagi." }`; the previous current guide is left intact.
- No chapters: `422` `{ "message": "Buat dan unggah minimal satu bab sebelum membuat agenda bimbingan." }`.
Auth: `view` on `Thesis` (generation is a read-privilege action that produces the student's own data).

### `GET /api/thesis/{thesis}/supervision-guides`
History list (archived + current), newest first.
```json
{
  "data": [
    {
      "id": 12, "origin": "scheduled", "status": "current",
      "is_tailored": false, "generated_at": "...",
      "points_count": 6, "prepared_count": 2
    }
  ]
}
```
Auth: `view` on `Thesis`.

### `GET /api/thesis/{thesis}/supervision-guides/{guide}`
Show a past (or current) guide with its points' point-in-time statuses.
Response: same shape as `current` (without the side effect of clearing unread).
Auth: `view` on `Thesis` (and the guide belongs to the thesis — enforced by scope + policy).

---

## Guidance points (tailoring)

Points are always nested under a guide; route binding resolves the point through the scoped guide.

### `POST /api/thesis/{thesis}/supervision-guides/{guide}/points`
Add a custom (student) point.
```json
{ "title": "Tanyakan contoh penelitian sejenis", "description": "untuk Bab III", "chapter_id": 7 }
```
- `title` required max 255; `description` nullable; `chapter_id`/`supervision_note_id` nullable, must belong to the thesis.
- Forces `origin='student'`, `status='pending'`, `priority=999`.
- Flips `guide.is_tailored = true`.
Response: `201` with the new point. Auth: `update` on `Thesis` (tailoring is a write).

### `PATCH /api/thesis/{thesis}/supervision-guides/{guide}/points/{point}`
Tailor a point.
```json
{ "status": "prepared" }
```
- `status` ∈ `['pending','prepared']`; `title`/`description` editable only when `point.origin='student'`.
- Flips `guide.is_tailored = true`.
Response: `200` with the updated point. Auth: `update` on `Thesis`.

### `DELETE /api/thesis/{thesis}/supervision-guides/{guide}/points/{point}`
Remove a point (system or student).
- Flips `guide.is_tailored = true`.
Response: `204`. Auth: `update` on `Thesis`.

---

## Scheduled generation (internal, not an HTTP endpoint)

`php artisan guidance:generate-scheduled` — loops eligible theses (≥1 chapter, `defense_deadline_at` in the future, current guide not `is_tailored`), calls `SupervisionGuideService->generateScheduled($thesis)` per thesis. Scheduled via Laravel `Schedule::command(...)->cron(config('openai.guidance.schedule'))` in `routes/console.php` (or `bootstrap/app.php` `withSchedule`). Failures per thesis are logged and skipped; the batch continues.