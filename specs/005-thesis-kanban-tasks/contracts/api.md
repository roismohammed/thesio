# API Contract — Thesis Kanban Tasks

**Feature**: 005-thesis-kanban-tasks | **Base**: `/api` (loaded via `routes/thesis.php`, `web`+`auth` middleware) | **Auth**: session/`auth`; ownership per `OwnedByUserScope` (`thesis.user_id`) + policies.

All responses wrap the resource in `{ "data": ... }` (matching existing thesis endpoints). Errors return `{ "message": "..." }` with stated status. UI text in messages is semi-formal friendly Indonesian. Identifiers English.

## Tasks

Routes nested under thesis (ownership resolved via route binding + global scope).

### `GET /api/thesis/{thesis}/tasks`
List all tasks for the thesis, grouped/sorted for the board.
```json
{
  "data": [
    {
      "id": 41, "thesis_id": 3, "title": "Revisi BAB 1",
      "description": "Perbaiki paragraf 3 sesuai notulen",
      "status": "todo", "priority": 1, "position": 0,
      "due_at": "2026-09-10T00:00:00Z", "due_at_mode": "auto",
      "origin": "manual",
      "chapter_id": 7, "supervision_note_id": 4,
      "task_suggestion_id": null,
      "urgency": "soon",
      "created_at": "...", "updated_at": "..."
    }
  ]
}
```
- `urgency` derived server-side: `'late' | 'soon' | 'safe' | 'none'` (D3).
- Sorted by `status, position` (board-ready).
Auth: `view` on `Thesis`.

### `POST /api/thesis/{thesis}/tasks`
Create a manual task.
```json
{
  "title": "Kumpulkan 10 referensi BAB 2",
  "description": "Cari jurnal 2020+",
  "priority": 5,
  "chapter_id": 8,
  "supervision_note_id": null
}
```
- `title` required max 255; `description` nullable; `priority` nullable int ≥ 0 (default 999); `chapter_id`/`supervision_note_id` nullable, must belong to thesis.
- Server forces `status='todo'`, `origin='manual'`, `due_at_mode='auto'`, `position=999`; `due_at` computed by `TaskService::computeDeadlines` if `defense_deadline_at` set, else null.
Response: `201` with the new task. Activity log: "Membuat tugas ...".
Auth: `update` on `Thesis`.

### `PATCH /api/thesis/{thesis}/tasks/{task}`
Edit a task (title/description/priority/due_at/links/status).
```json
{ "title": "Kumpulkan 12 referensi BAB 2", "due_at": "2026-09-15" }
```
- Any field nullable/optional. `status` ∈ `['todo','doing','done']`.
- When `due_at` is present, server flips `due_at_mode='manual'` (FR-010/FR-012). When `due_at` absent, mode unchanged.
Response: `200` with updated task. Activity log: "Memperbarui tugas ...".
Auth: `update` on `Thesis`.

### `PATCH /api/thesis/{thesis}/tasks/{task}/move`
Move a task between columns (DnD drop) — status + position.
```json
{ "status": "doing", "position": 0 }
```
- `status` required ∈ `['todo','doing','done']`; `position` required int ≥ 0.
- Does NOT touch `due_at`/`due_at_mode` (move ≠ deadline edit).
- Server may re-normalize positions of siblings in target column.
Response: `200` with the moved task. Activity log: "Memindahkan tugas ... ke kolom {status}.".
Auth: `update` on `Thesis`.

### `DELETE /api/thesis/{thesis}/tasks/{task}`
Delete a task.
Response: `204`. Activity log: "Menghapus tugas ...".
Auth: `update` on `Thesis`.

## Task suggestions

### `POST /api/thesis/{thesis}/task-suggestions`
Generate AI suggestions on demand.
```json
{ "force": false }
```
- `force` optional boolean (default false). When false, returns existing `pending` suggestions if any (idempotent); when true, re-runs the LLM (rejected signatures still deduped — D9).
Response: `201` with array of suggestions:
```json
{
  "data": [
    {
      "id": 91, "thesis_id": 3,
      "title": "Revisi paragraf 3 BAB 1 sesuai notulen",
      "description": "Dosen menandai paragraf 3 perlu ditunjukkan sumbernya",
      "priority": 1,
      "source_type": "note_revision",
      "chapter_id": 7, "supervision_note_id": 4,
      "status": "pending",
      "due_at_suggestion": "2026-09-08T00:00:00Z",
      "generated_at": "..."
    }
  ]
}
```
- `due_at_suggestion` computed server-side via D2 (not from LLM), shown to help the student decide; the actual `due_at` is set on accept.
- 422 on guard failure: `{ "message": "Buat minimal satu bab sebelum meminta saran tugas." }` or `"Belum ada chapter belum lengkap atau notulen revisi untuk disarankan."`.
- 422 on LLM failure: `{ "message": "Gagal membuat saran tugas. Silakan coba lagi." }`.
Auth: `view` on `Thesis`.

### `GET /api/thesis/{thesis}/task-suggestions`
List active (pending) suggestions, sorted by priority.
Response: same shape as `POST` data array (only `status='pending'`).
Auth: `view` on `Thesis`.

### `POST /api/thesis/{thesis}/task-suggestions/{suggestion}/accept`
Accept a suggestion → becomes a Task.
- No body. Server creates Task with `origin='suggestion'`, `task_suggestion_id` set, `due_at_mode='auto'`, `due_at` computed via D2; marks suggestion `status='accepted'`. Transactional.
Response: `201` with the new task. Activity log: "Menerima saran tugas '{title}' menjadi tugas skripsi ...".
Auth: `update` on `Thesis`.

### `POST /api/thesis/{thesis}/task-suggestions/{suggestion}/reject`
Reject a suggestion.
- No body. Server marks `status='rejected'`; the row stays (dedup via signature — D9). Suggestion hidden from active list.
Response: `204`. Activity log: "Menolak saran tugas '{title}' ...".
Auth: `update` on `Thesis`.

## Defense deadline (existing endpoint, side effect)

### `PATCH /api/thesis/{thesis}` (existing, from 003)
When `defense_deadline_at` is updated, `TaskController::update` (or the existing thesis update flow) additionally calls `TaskService::recalcDeadlines($thesis)` which recomputes `due_at` for all `status != 'done'` && `due_at_mode = 'auto'` tasks via D2. Tasks with `due_at_mode='manual'` and tasks `status='done'` are untouched (FR-010).
Activity log: "Menghitung ulang tenggat {n} tugas skripsi ... karena deadline sidang diperbarui."