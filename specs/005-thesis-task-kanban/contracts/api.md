# API Contract: Thesis Development Task Kanban

**Feature**: 005-thesis-task-kanban | **Date**: 2026-08-07

REST endpoints added to `routes/thesis.php`, nested under the existing
`thesis/{thesis}` group (`web` + `auth` middleware, `api/` prefix). Ownership is
enforced by `Thesis`'s `OwnedByUserScope` + `TaskPolicy` (research.md D7). All
mutating requests require the `thesis` `update` policy; reads require `view`.

All responses use the project's existing envelope: `{ "data": ... }` for single,
`{ "data": [...] }` for collections. Errors return `{ "message": string }` with
the appropriate HTTP status. Validation errors return 422 with Laravel's standard
`{ "message": ..., "errors": { field: [messages] } }` shape.

---

## Endpoints

### 1. List board tasks — `GET /api/thesis/{thesis}/tasks`

Returns all tasks for the thesis, grouped for board rendering.

**Authorization**: `view` thesis.

**Response 200**:
```json
{
  "data": [
    { "id": 1, "thesis_id": 7, "title": "...", "description": null,
      "stage": "todo", "priority": null, "due_date": "2026-08-20",
      "chapter_id": 3, "supervision_note_id": 11, "position": 0,
      "created_at": "...", "updated_at": "..." }
  ],
  "defense_deadline_at": "2026-09-30",
  "defense_remaining_days": 54
}
```
- `defense_deadline_at` / `defense_remaining_days` are pulled from the thesis for
  the progress overview (research.md: reuse spec 003's deadline, read-only).
- Derived flags (`is_overdue`, `is_due_soon`, `is_high_priority`) are **not** sent
  — computed client-side (research.md D5).

### 2. Create a task — `POST /api/thesis/{thesis}/tasks`

Creates a task manually OR accepts an LLM suggestion (same endpoint; accepting a
suggestion is just creating a task with the suggestion's fields).

**Authorization**: `update` thesis.

**Body** (`StoreTaskRequest`):
```json
{ "title": "Revisi paragraf landasan teori Bab II",
  "description": "Sesuai catatan dosen di bimbingan 05/08",
  "stage": "todo",
  "priority": 2,
  "due_date": "2026-08-20",
  "chapter_id": 3,
  "supervision_note_id": 11 }
```
- `title` required (max 255). `stage` optional, defaults `todo`. `priority`
  optional integer ≥ 1. `due_date` optional date. `chapter_id` /
  `supervision_note_id` optional, must exist and belong to this thesis.
- `position` is **not** accepted from the body; auto-assigned to append in the
  target stage (research.md D1 / data-model.md).

**Response 201**: `{ "data": TaskResource }`.

### 3. Update a task — `PATCH /api/thesis/{thesis}/tasks/{task}`

Updates editable fields (title, description, stage, priority, due_date, links).
Stage change via this endpoint is allowed (treats it as a move to the bottom of
the new stage); for explicit positioned moves use endpoint 5.

**Authorization**: `update` thesis (via `TaskPolicy`).

**Body** (`UpdateTaskRequest`): same fields as store, all optional except `title`
remains required when present. Validation rules identical to store.

**Response 200**: `{ "data": TaskResource }`.

### 4. Delete a task — `DELETE /api/thesis/{thesis}/tasks/{task}`

**Authorization**: `delete` thesis (via `TaskPolicy`).

**Response 204**: empty body. (Client confirms before calling — spec FR-004.)

### 5. Move a task — `PATCH /api/thesis/{thesis}/tasks/{task}/move`

Moves a task to a stage at a given position (drag-and-drop target), recomputing
neighbor positions in one transaction.

**Authorization**: `update` thesis.

**Body** (`MoveTaskRequest`):
```json
{ "stage": "in_progress", "position": 1 }
```
- `stage` required, one of the four enum values.
- `position` optional integer ≥ 0; when omitted, appends to the end of the
  target stage.

**Response 200**: `{ "data": TaskResource }` (with updated `stage` + `position`).

### 6. Suggest tasks from a notulen — `POST /api/thesis/{thesis}/tasks/suggestions`

Student-initiated LLM suggestion flow (spec FR-011, US5). Returns ephemeral
suggestion DTOs; nothing is persisted. Accepting a suggestion uses endpoint 2.

**Authorization**: `view` thesis.

**Body** (`SuggestTasksRequest`):
```json
{ "supervision_note_id": 11 }
```
- `supervision_note_id` required, must exist and belong to a chapter of this
  thesis. (A thesis-scoped existence rule prevents addressing another student's
  notulen.)

**Response 200**:
```json
{ "data": [
    { "title": "...", "description": "...", "chapter_id": 3,
      "supervision_note_id": 11, "priority": 1, "duplicates_task_id": null },
    { "title": "...", "description": "...", "chapter_id": null,
      "supervision_note_id": 11, "priority": 2, "duplicates_task_id": 42 }
  ] }
```
- `duplicates_task_id` is set to the id of an existing open task on the board whose
  title closely matches the suggestion (dedup hint). `null` when no likely
  duplicate.
- Empty array `[]` is a valid success (nothing actionable in the notulen — spec
  edge case).

**Response 422** (LLM failure): `{ "message": "Gagal membuat saran tugas. Silakan coba lagi." }`.
The notulen and existing board are unaffected.

---

## Resource shapes

### `TaskResource`
```json
{ "id": 1, "thesis_id": 7, "title": "...", "description": null,
  "stage": "todo", "priority": null, "due_date": "2026-08-20",
  "chapter_id": 3, "supervision_note_id": 11, "position": 0,
  "created_at": "...", "updated_at": "..." }
```

### `TaskSuggestionResource` (ephemeral)
```json
{ "title": "...", "description": "...", "chapter_id": 3,
  "supervision_note_id": 11, "priority": 1, "duplicates_task_id": null }
```

---

## Routing notes

All six endpoints are appended to the existing `thesis/{thesis}` group in
`routes/thesis.php`. The `{task}` route parameter resolves via implicit model
binding; because `Task` is always looked up under a `{thesis}` that already passed
the `OwnedByUserScope`, a student cannot address another student's task. The
`TaskPolicy` is registered (Laravel auto-discovers policies in `app/Policies`) so
`$this->authorize('update', $thesis)` in the controller and `authorize()` in Form
Requests enforce ownership on writes.

No changes to `bootstrap/app.php`, no new middleware, no scheduled command, and
no new config file. The LLM client reuses `config('openai.*')` (base URL, key,
model, timeout) already in place for the supervision guidance feature.