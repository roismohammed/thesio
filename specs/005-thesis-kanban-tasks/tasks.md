# Tasks: Thesis Kanban Task Board

**Input**: Design documents from `/specs/005-thesis-kanban-tasks/`

**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/api.md, contracts/llm.md, quickstart.md, `.specify/memory/constitution.md`

**Tests**: None. Per project CLAUDE.md there are no automated tests in this project; validation is via `php -l`, `npx tsc --noEmit -p tsconfig.app.json`, `vendor/bin/pint`, and the manual `quickstart.md` scenarios. Do NOT generate PHPUnit/Pest/vitest tasks.

**Organization**: Tasks grouped by user story so each story can be implemented and validated independently. Backend follows `Controller -> Service -> Action` (constitution I-II); every mutation logs a narrative `activity('thesis')` entry (constitution III); frontend is feature-based with page-specific partials under `pages/kanban-tasks/partials/` (constitution V). PHP class <=300 lines, method <=100 lines; React component file <=300 lines. Reuse `@/components/forms/*` and `@/components/datatable/*` (per user input); popover `@/components/ui/popover.tsx` and `Kbd` `@/components/ui/kbd.tsx` for shortcuts; DnD via `@dnd-kit/core` + `@dnd-kit/sortable` (research.md D1 — sole new dependency).

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[Story]**: Which user story this task belongs to (US1, US2, US3, US4, US5)
- Include exact file paths in descriptions

## Path Conventions

- Backend: `apps/api/app/...`, `apps/api/database/migrations/`, `apps/api/routes/`, `apps/api/config/`
- Frontend: `apps/web/src/...`
- PHP class files PascalCase; migrations/routes/config snake_case; JS/TS kebab-case; SQL snake_case.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Config, env, and i18n scaffolding for the kanban-tasks feature. No runtime code yet.

- [X] T001 [P] Install DnD dependency in `apps/web` — `bun add @dnd-kit/core @dnd-kit/sortable` (per research.md D1; sole new FE dependency). Run yourself.
- [X] T002 [P] Add `task_urgent_within_days` config to `apps/api/config/thesis.php` (create file if absent, or append to existing thesis config) — key `'task_urgent_within_days' => 7` (per research.md D3; tunable urgency threshold).
- [X] T003 [P] Add kanban-tasks i18n keys to `apps/web/src/i18n/locales/en/thesis.json` and `apps/web/src/i18n/locales/id/thesis.json` — covers all five stories' UI text (nav label "Tugas Skripsi", breadcrumb, page title, column headers "Belum Dimulai"/"Sedang Dikerjakan"/"Selesai", empty state, "Minta Saran"/"Buat Tugas" buttons, urgency labels "aman"/"mendekati"/"terlambat"/"tanpa tenggat", popover actions, shortcut hints, suggestion panel labels, accept/reject buttons, failure messages). Identifiers stay English; values semi-formal friendly Indonesian in the `id` locale.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Schema, models, policies, and shared deadline-computation logic that ALL user stories depend on.

**CRITICAL**: No user story work can begin until this phase is complete.

- [X] T004 [P] Create migration `apps/api/database/migrations/2026_08_07_000001_create_tasks_table.php` — `id`, `thesis_id` foreignId cascadeOnDelete, `title` string(255), `description` text nullable, `status` string(20) default `'todo'`, `priority` integer default 999, `position` integer default 999, `due_at` timestamp nullable, `due_at_mode` string(10) default `'auto'`, `origin` string(10) default `'manual'`, `chapter_id` foreignId nullOnDelete, `supervision_note_id` foreignId nullOnDelete, `task_suggestion_id` foreignId nullOnDelete, timestamps; indexes on `thesis_id`, `(thesis_id, status, position)`, `(thesis_id, due_at)` (per data-model.md).
- [X] T005 [P] Create migration `apps/api/database/migrations/2026_08_07_000002_create_task_suggestions_table.php` — `id`, `thesis_id` foreignId cascadeOnDelete, `title` string(255), `description` text nullable, `priority` integer, `source_type` string(20), `chapter_id` foreignId nullOnDelete, `supervision_note_id` foreignId nullOnDelete, `signature` string(64), `status` string(20) default `'pending'`, `generated_at` timestamp, timestamps; indexes on `thesis_id`, `(thesis_id, status)`; **unique** on `(thesis_id, signature)` (dedup per D9).
- [X] T006 [P] Create `apps/api/app/Models/Task.php` — `$fillable` per data-model.md; casts `'priority' => 'integer'`, `'position' => 'integer'`, `'due_at' => 'datetime'`; `booted()` adds `OwnedByUserScope('thesis.user_id')` (same pattern as `Chapter`/`SupervisionGuide`); relations `thesis(): BelongsTo`, `chapter(): BelongsTo` (optional), `supervisionNote(): BelongsTo` (optional), `taskSuggestion(): BelongsTo` (optional); helper `isDone(): bool`.
- [X] T007 [P] Create `apps/api/app/Models/TaskSuggestion.php` — `$fillable` per data-model.md; casts `'priority' => 'integer'`, `'generated_at' => 'datetime'`; `booted()` adds `OwnedByUserScope('thesis.user_id')`; relations `thesis(): BelongsTo`, `chapter(): BelongsTo` (optional), `supervisionNote(): BelongsTo` (optional), `task(): HasOne` (optional, via `task.task_suggestion_id`); static helper `signatureFor(string $sourceType, ?int $sourceId, string $title): string` — `sha1(strtolower(trim($sourceType)) . '|' . ($sourceId ?? 'null') . '|' . strtolower(trim($title)))` (D9).
- [X] T008 [P] Extend `apps/api/app/Models/Thesis.php` — add `tasks(): HasMany` and `taskSuggestions(): HasMany` relations (no column/migration change; reads existing `defense_deadline_at` from 003).
- [X] T009 [P] Create `apps/api/app/Policies/TaskPolicy.php` — `view`/`update`/`delete` resolving `$user->is($task->thesis->user)`.
- [X] T010 [P] Create `apps/api/app/Policies/TaskSuggestionPolicy.php` — `view`/`update` resolving `$user->is($suggestion->thesis->user)`.
- [X] T011 Create `apps/api/app/Services/Thesis/TaskService.php` — shared logic (no HTTP): (a) `computeDeadlines(Thesis $thesis): void` — proportional formula D2: for N tasks `status != 'done'` && `due_at_mode = 'auto'` sorted by `priority` asc, `slot = (defense_deadline_at - now) / (N + 1)`, task i → `due_at = defense_deadline_at - (N - i) * slot`; skip when `defense_deadline_at` null (D8); (b) `recalcDeadlines(Thesis $thesis): int` — recompute + persist, returns count affected, logs narrative "Menghitung ulang tenggat {n} tugas skripsi '{title}' karena deadline sidang diperbarui."; (c) `urgency(?Carbon $dueAt, Carbon $now): string` — pure helper returning `'late'|'soon'|'safe'|'none'` with `soonDays` from `config('thesis.task_urgent_within_days', 7)` (D3); (d) `assignInitialDeadline(Task $task): void` — compute single task deadline on create/accept. Injects no domain Service. Keeps within method/class size limits (extract private helper if compute exceeds 100 lines — unlikely).

**Checkpoint**: Migrations apply cleanly (`php artisan migrate`), models + scopes resolve ownership, `TaskService::computeDeadlines` + `urgency` ready for use by stories. User story implementation can now begin.

---

## Phase 3: User Story 2 - Mahasiswa Membuat dan Mengelola Tugas Secara Manual (Priority: P1) MVP

**Goal**: A student can create, edit, and delete manual tasks on the kanban board; tasks appear in columns with urgency indicators. This story is MVP alongside US1 (board view) because manual task creation is core to a kanban.

**Independent Test**: Create a task "Revisi BAB 1" via the form dialog; verify it appears in the "Belum Dimulai" column with urgency indicator; edit its title; delete it via the popover. Activity logs record each mutation.

### Implementation for User Story 2

- [X] T012 [P] [US2] Create `apps/api/app/Http/Requests/Thesis/StoreTaskRequest.php` — `title` required string max 255; `description` nullable string; `priority` nullable integer >= 0 (default 999); `chapter_id` nullable|exists:chapters,id (must belong to thesis via scope); `supervision_note_id` nullable|exists:supervision_notes,id; `authorize()` delegates to `update` thesis policy.
- [X] T013 [P] [US2] Create `apps/api/app/Http/Requests/Thesis/UpdateTaskRequest.php` — `title` nullable string max 255; `description` nullable; `priority` nullable integer >= 0; `due_at` nullable|date|after:today; `chapter_id`/`supervision_note_id` nullable; `status` nullable in `['todo','doing','done']`; `authorize()` delegates to `update` policy.
- [X] T014 [P] [US2] Create `apps/api/app/Http/Resources/Thesis/TaskResource.php` — renders `id`, `thesis_id`, `title`, `description`, `status`, `priority`, `position`, `due_at` (iso8601 nullable), `due_at_mode`, `origin`, `chapter_id`, `supervision_note_id`, `task_suggestion_id`, `urgency` (computed server-side via `TaskService::urgency`), `created_at`, `updated_at`.
- [X] T015 [US2] Create `apps/api/app/Actions/Thesis/CreateTaskAction.php` — one use case: persist task with forced `status='todo'`, `origin='manual'`, `due_at_mode='auto'`, `position=999`; then call `TaskService::assignInitialDeadline` (computes `due_at` if defense deadline set, else null). Log narrative "Membuat tugas '{title}' untuk skripsi '{thesis.title}'." via `activity('thesis')`. DB write via Eloquent.
- [X] T016 [US2] Create `apps/api/app/Actions/Thesis/UpdateTaskAction.php` — one use case: persist validated fields; when `due_at` is present in input, flip `due_at_mode='manual'` (FR-010/FR-012); when `due_at` explicitly set to null in input, leave `due_at_mode` unchanged. Log narrative "Memperbarui tugas '{title}' pada skripsi '{thesis.title}'." (or a manual-deadline-specific message when `due_at` changed: "Mengatur tenggat tugas '{title}' manual ke {due_at} ...").
- [X] T017 [US2] Create `apps/api/app/Actions/Thesis/DeleteTaskAction.php` — one use case: delete task; log narrative "Menghapus tugas '{title}' dari papan skripsi '{thesis.title}'.".
- [X] T018 [US2] Create `apps/api/app/Services/Thesis/TaskCrudService.php` (or extend `TaskService`) — thin orchestration delegating to the three Actions above; injected into the controller. Keeps controller free of Action wiring.
- [X] T019 [US2] Create `apps/api/app/Http/Controllers/Thesis/TaskController.php` — `index(Thesis)`: authorize `view`, list tasks sorted by `status, position`, return `TaskResource` collection. `store(StoreTaskRequest, Thesis)`: authorize `update`, delegate to `TaskCrudService`, return `201`. `update(UpdateTaskRequest, Thesis, Task)`: authorize `update`, delegate, return `200`. `destroy(Thesis, Task)`: authorize `update`, delegate, return `204`. Controller parses HTTP + authorizes + delegates only.
- [X] T020 [US2] Add task routes to `apps/api/routes/thesis.php` — `GET thesis/{thesis}/tasks`, `POST thesis/{thesis}/tasks`, `PATCH thesis/{thesis}/tasks/{task}`, `DELETE thesis/{thesis}/tasks/{task}` inside the existing `['web','auth']` api-prefixed group.
- [X] T021 [P] [US2] Add `Task`, `TaskStatus`, `Urgency`, `DueAtMode`, `TaskOrigin` types to `apps/web/src/features/thesis/types.ts` — fields matching `TaskResource` (incl. `urgency: 'late'|'soon'|'safe'|'none'`).
- [X] T022 [P] [US2] Create `apps/web/src/features/thesis/api/kanban-tasks.ts` — `listTasks(thesisId)`, `createTask(thesisId, body)`, `updateTask(thesisId, taskId, body)`, `deleteTask(thesisId, taskId)` using the existing `@/lib/api` helper (mirrors `api/supervision-guide.ts` patterns).
- [X] T023 [US2] Create `apps/web/src/features/thesis/hooks/use-kanban-tasks.ts` — `useKanbanTasks(thesisId)`: load tasks, `createTask`/`updateTask`/`deleteTask` handlers, `loading`/`error` state. Move handler added in US1 (DnD). Mirrors `use-supervision-guide.ts` shape.
- [X] T024 [US2] Add route `/thesis/:thesisId/tasks` to `apps/web/src/App.tsx` — under the authenticated `AuthGuard` group, rendering `KanbanTasksPage` (lazy import, mirrors the `guidance` route).
- [X] T025 [P] [US2] Create `apps/web/src/features/thesis/pages/kanban-tasks/partials/task-form.tsx` — create/edit form using `@/components/forms/*` (`Form`, `TextField`, `TextareaField`, `SelectField` for chapter link; `ComboboxField` for notulen link optional). Fields: title, description, due_at (optional, flips manual mode), chapter_id, supervision_note_id. react-hook-form + zod schema. <=300 lines.
- [X] T026 [P] [US2] Create `apps/web/src/features/thesis/pages/kanban-tasks/partials/task-form-dialog.tsx` — modal wrapper around `task-form.tsx` using `@/components/ui/dialog` (form <=5 fields, modal allowed per constitution V). Trigger from toolbar "Buat Tugas" and popover "Edit".
- [X] T027 [P] [US2] Create `apps/web/src/features/thesis/pages/kanban-tasks/partials/task-card.tsx` — card displaying title, description snippet, due_at (formatted), urgency indicator (color/label from `urgency`), "..." button triggering popover (edit/move/delete/set manual deadline). <=300 lines.
- [X] T028 [US2] Create `apps/web/src/features/thesis/pages/kanban-tasks/partials/board-empty-state.tsx` — friendly empty state inviting the student to create a task or request suggestions.
- [X] T029 [US2] Create `apps/web/src/features/thesis/pages/kanban-tasks/index.tsx` — `KanbanTasksPage` (<=300 lines): breadcrumb `Skripsi › Tugas Skripsi` (last item plain text, parent links to `/thesis/:thesisId`); composes `board-toolbar`, `task-board` (3 columns), `board-empty-state`, `task-form-dialog`. Fetches via `useKanbanTasks`. i18n keys from T003. (Task board DnD wired in US1.)

**Checkpoint**: Student can create, list, edit, and delete manual tasks via the board + popover; tasks show urgency. Activity logs record each mutation. Verify via quickstart Scenarios 2, 5, 7 (popover).

---

## Phase 4: User Story 1 - Mahasiswa Melihat Papan Kanban Tugas Skripsi (Priority: P1) MVP

**Goal**: The 3-column board displays all tasks grouped by status, with drag-and-drop to move cards between columns. Builds on US2's task data + card components.

**Independent Test**: With tasks created (US2), open the board; drag a card from "Belum Dimulai" to "Selesai"; verify status updates and card relocates. Keyboard DnD (space to pick, arrows to move) works.

### Implementation for User Story 1

- [X] T030 [P] [US1] Create `apps/api/app/Http/Requests/Thesis/MoveTaskRequest.php` — `status` required in `['todo','doing','done']`; `position` required integer >= 0; `authorize()` delegates to `update` policy.
- [X] T031 [US1] Create `apps/api/app/Actions/Thesis/MoveTaskAction.php` — one use case: update `status` + `position`; re-normalize sibling positions in the target column (assign sequential ints). Does NOT touch `due_at`/`due_at_mode`. Log narrative "Memindahkan tugas '{title}' ke kolom {status} pada skripsi '{thesis.title}'.".
- [X] T032 [US1] Extend `apps/api/app/Http/Controllers/Thesis/TaskController.php` — add `move(MoveTaskRequest, Thesis, Task)`: authorize `update`, delegate to `MoveTaskAction` via `TaskCrudService`, return `200` with updated task.
- [X] T033 [US1] Add move route to `apps/api/routes/thesis.php` — `PATCH thesis/{thesis}/tasks/{task}/move` inside the existing group.
- [X] T034 [P] [US1] Extend `apps/web/src/features/thesis/api/kanban-tasks.ts` — add `moveTask(thesisId, taskId, body: { status, position })`.
- [X] T035 [US1] Extend `apps/web/src/features/thesis/hooks/use-kanban-tasks.ts` — add `moveTask` handler calling the API and optimistically updating local board state; re-fetch on drop settle.
- [X] T036 [P] [US1] Create `apps/web/src/features/thesis/pages/kanban-tasks/partials/kanban-column.tsx` — column shell (header + count + droppable area) using `@dnd-kit` `useDroppable`; renders `task-card` list (sortable within column via `useSortable`). <=300 lines.
- [X] T037 [P] [US1] Create `apps/web/src/features/thesis/pages/kanban-tasks/partials/task-board.tsx` — `DndContext` + 3 `SortableContext` (one per status column) + `DragOverlay` for the dragged card; `onDragEnd` calls `moveTask` (cross-column) or reorders within column. Keyboard sensor enabled (accessible DnD). <=300 lines.
- [X] T038 [US1] Create `apps/web/src/features/thesis/pages/kanban-tasks/partials/board-toolbar.tsx` — "Buat Tugas" button (opens `task-form-dialog`), "Minta Saran" button (wired in US3), filter/sort control (optional v1), shortcut hint row. Sticky header.
- [X] T039 [US1] Wire `task-board.tsx` + `board-toolbar.tsx` into `index.tsx` (from T029) — DnD context wraps the board; toolbar triggers form + suggestion actions.

**Checkpoint**: Student sees the 3-column board with cards, drags cards between columns, status persists. Keyboard DnD accessible. Verify via quickstart Scenarios 1, 6.

---

## Phase 5: User Story 3 - Sistem Menyarankan Tugas dengan Tenggat Dihitung Sistematis (Priority: P2)

**Goal**: The AI suggests tasks derived from notulen revisions + incomplete chapters, with deadlines computed systematically from the defense deadline. Student accepts (becomes a task) or rejects (hidden, deduped).

**Independent Test**: With a thesis having a draft chapter, notulen revisions, and a set defense deadline, click "Minta Saran"; verify suggestions appear sorted by priority with deadlines before the defense deadline; accept one (becomes a task in "Belum Dimulai"); reject one (disappears, does not reappear on re-request). Verify source_type `note_revision` prioritized over `chapter_draft`.

### Implementation for User Story 3

- [X] T040 [P] [US3] Create `apps/api/app/Services/Thesis/TaskSuggestionLlmClient.php` — infra Service (external API, per constitution I). Assembles context JSON: `thesis_title`, `defense_deadline_at`, `defense_remaining_days`, `deadline_set`, `chapters` (only `status` in `['draft','submitted']` — "belum lengkap"), `notulen` (id/chapter_id/content truncated ~2000 chars), `existing_tasks` (title/status to avoid duplicates). Calls `OpenAI::chat()->create([...])` with `response_format => ['type' => 'json_object']` and the fixed Indonesian system prompt from `contracts/llm.md`; `model` from `config('openai.llm_model')`. Parses `choices[0].message->content` as JSON, validates `{suggestions:[...]}` schema, drops unknown `chapter_id`/`supervision_note_id` to null, normalises priority by re-sorting asc → stable 1..N. Returns validated suggestions array; throws on HTTP/timeout/parse/schema failure. Empty suggestions is valid success. (Mirrors `GuidanceLlmClient` from 003.)
- [X] T041 [P] [US3] Create `apps/api/app/Http/Requests/Thesis/GenerateTaskSuggestionsRequest.php` — optional `force` boolean (default false); `authorize()` delegates to `view` policy.
- [X] T042 [P] [US3] Create `apps/api/app/Http/Resources/Thesis/TaskSuggestionResource.php` — renders `id`, `thesis_id`, `title`, `description`, `priority`, `source_type`, `chapter_id`, `supervision_note_id`, `status`, `due_at_suggestion` (computed server-side via `TaskService` proportional formula, shown to help decide), `generated_at`.
- [X] T043 [US3] Create `apps/api/app/Actions/Thesis/CreateTaskSuggestionAction.php` — one use case: call `TaskSuggestionLlmClient`; for each returned suggestion, compute `signature` via `TaskSuggestion::signatureFor`; skip suggestions whose signature already exists for this thesis (any status — D9 dedup); persist remaining as `status='pending'`, `generated_at=now`. On LLM failure throw without persisting (no partial). Log narrative "Membuat saran tugas skripsi untuk '{thesis.title}' — {n} saran dari notulen revisi dan bab belum lengkap." or a failure note.
- [X] T044 [US3] Create `apps/api/app/Services/Thesis/TaskSuggestionService.php` — `generate(Thesis, bool $force)`: guard no-eligible-source (no draft chapters AND no notulen) -> throw 422 "Belum ada chapter belum lengkap atau notulen revisi untuk disarankan."; when `!force` and pending suggestions exist, return existing (idempotent); otherwise call `CreateTaskSuggestionAction`. `listPending(Thesis)`: return `status='pending'` sorted by `priority`. `accept(TaskSuggestion)`: delegate to `AcceptTaskSuggestionAction`. `reject(TaskSuggestion)`: delegate to `RejectTaskSuggestionAction`.
- [X] T045 [US3] Create `apps/api/app/Actions/Thesis/AcceptTaskSuggestionAction.php` — one use case: within a DB transaction, create a `Task` (`origin='suggestion'`, `task_suggestion_id` set, `status='todo'`, `due_at_mode='auto'`, `position=999`), call `TaskService::assignInitialDeadline` to compute `due_at`, then mark the suggestion `status='accepted'`. Log narrative "Menerima saran tugas '{title}' menjadi tugas skripsi '{thesis.title}' — tenggat {due_at}.".
- [X] T046 [US3] Create `apps/api/app/Actions/Thesis/RejectTaskSuggestionAction.php` — one use case: mark suggestion `status='rejected'` (row stays for dedup — D9). Log narrative "Menolak saran tugas '{title}' pada skripsi '{thesis.title}'.".
- [X] T047 [US3] Create `apps/api/app/Http/Controllers/Thesis/TaskSuggestionController.php` — `generate(GenerateTaskSuggestionsRequest, Thesis)`: authorize `view`, delegate to `TaskSuggestionService::generate`; on guard failure return `422 {message}`; on LLM failure return `422 {message: "Gagal membuat saran tugas. Silakan coba lagi."}`; on success return `201` with `TaskSuggestionResource` collection. `index(Thesis)`: authorize `view`, return pending suggestions. `accept(Thesis, TaskSuggestion)`: authorize `update`, delegate, return `201` with new Task. `reject(Thesis, TaskSuggestion)`: authorize `update`, delegate, return `204`. Controller parses HTTP + authorizes + delegates only.
- [X] T048 [US3] Add suggestion routes to `apps/api/routes/thesis.php` — `POST thesis/{thesis}/task-suggestions`, `GET thesis/{thesis}/task-suggestions`, `POST thesis/{thesis}/task-suggestions/{suggestion}/accept`, `POST thesis/{thesis}/task-suggestions/{suggestion}/reject` inside the existing group.
- [X] T049 [P] [US3] Add `TaskSuggestion` interface + `TaskSuggestionStatus` type to `apps/web/src/features/thesis/types.ts` — fields matching `TaskSuggestionResource` (incl. `due_at_suggestion`, `source_type`).
- [X] T050 [P] [US3] Extend `apps/web/src/features/thesis/api/kanban-tasks.ts` — add `generateSuggestions(thesisId, force?)`, `listSuggestions(thesisId)`, `acceptSuggestion(thesisId, suggestionId)`, `rejectSuggestion(thesisId, suggestionId)`.
- [X] T051 [US3] Create `apps/web/src/features/thesis/hooks/use-task-suggestions.ts` — `useTaskSuggestions(thesisId)`: load pending suggestions, `generate(force?)` (with loading state), `accept(suggestionId)`, `reject(suggestionId)`; `loading`/`generating`/`error` state.
- [X] T052 [P] [US3] Create `apps/web/src/features/thesis/pages/kanban-tasks/partials/suggestion-card.tsx` — single suggestion: title, description, source_type badge, `due_at_suggestion` (formatted), priority; "Terima" + "Tolak" buttons. <=300 lines.
- [X] T053 [US3] Create `apps/web/src/features/thesis/pages/kanban-tasks/partials/suggestion-panel.tsx` — list of `suggestion-card`s sorted by priority, empty state when none, loading skeleton during generation. Composes via `useTaskSuggestions`. <=300 lines.
- [X] T054 [US3] Wire "Minta Saran" button in `board-toolbar.tsx` (from T038) to `useTaskSuggestions::generate`; render `suggestion-panel` (collapsible or side panel) above/beside the board.

**Checkpoint**: Student requests suggestions, sees AI-derived tasks with computed deadlines, accepts/rejects; rejected suggestions do not reappear. Verify via quickstart Scenario 3.

---

## Phase 6: User Story 4 - Sistem Menghitung Ulang Tenggat Saat Tenggat Sidang Berubah (Priority: P2)

**Goal**: When the defense deadline is updated, all not-done auto-deadline tasks get recomputed deadlines; manual-deadline and done tasks are untouched.

**Independent Test**: With several auto-deadline tasks and one manual-deadline task, update the defense deadline closer (e.g. +30 to +15 days); verify auto not-done tasks get earlier deadlines preserving priority order (SC-004), manual task untouched, done tasks untouched. Activity log records the recalc.

### Implementation for User Story 4

- [X] T055 [US4] Extend `apps/api/app/Http/Controllers/Thesis/ThesisController.php` `update()` — after `UpdateThesisAction` persists (existing), when `defense_deadline_at` was present in the request, call `TaskService::recalcDeadlines($thesis)` (controller orchestration per research.md D7 — controller may call multiple services; Action stays single-responsibility and does NOT inject a Service per constitution II). Existing thesis update flow otherwise unchanged.
- [X] T056 [P] [US4] Extend `apps/web/src/features/thesis/api/thesis.ts` (or the existing thesis update API helper) — no change needed if the existing `updateThesis` already sends `defense_deadline_at`; otherwise add it. (Fit 003 already wired `defense_deadline_at` to the thesis update — verify, do not duplicate.)
- [X] T057 [US4] Extend `apps/web/src/features/thesis/hooks/use-kanban-tasks.ts` — after a successful thesis deadline update (detected via the thesis detail page or a shared event), re-fetch tasks so the board reflects recomputed `due_at` + `urgency`. (If the board and thesis settings are separate pages, a manual refresh or route re-entry suffices for v1; wire an optimistic refetch where feasible.)

**Checkpoint**: Updating the defense deadline recomputes auto task deadlines on the board; manual/done tasks preserved. Verify via quickstart Scenario 4.

---

## Phase 7: User Story 5 - Mahasiswa Melihat Indikator Urgensi dan Tugas Terlambat (Priority: P3)

**Goal**: Board cards show urgency indicators (safe / soon / late / none) computed server-side; student identifies late/soon tasks from the board alone (SC-005).

**Independent Test**: Create tasks with past, near (+3d), far (+20d), and null due_at; verify each card shows the correct urgency label/color without opening detail. Reorder/filter the board by urgency.

### Implementation for User Story 5

- [X] T058 [P] [US5] Extend `apps/web/src/features/thesis/pages/kanban-tasks/partials/task-card.tsx` — render urgency badge from `task.urgency` (already returned by API): color + label (late = red "terlambat", soon = amber "mendekati", safe = green "aman", none = muted "tanpa tenggat"). Use design-system tokens (constitution IV), dark-mode parity.
- [X] T059 [P] [US5] Extend `apps/web/src/features/thesis/pages/kanban-tasks/partials/board-toolbar.tsx` — add urgency filter (show all / late only / soon only) and sort toggle (by priority / by due_at). Pure client-side filter over loaded tasks.
- [X] T060 [US5] Apply `make-interfaces-feel-better` polish to `task-card.tsx`, `kanban-column.tsx`, `task-board.tsx`, `board-toolbar.tsx`, `suggestion-card.tsx` — shadows, borders, optical alignment, tabular numbers for due_at, hover states, staggered entrances per the skill (constitution IV). Verify dark-mode parity.

**Checkpoint**: Urgency indicators visible at a glance; filter/sort works; polish applied. Verify via quickstart Scenarios 5, 7.

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Shortcuts, popover refinements, and final validation affecting all stories.

- [X] T061 [P] Create `apps/web/src/features/thesis/hooks/use-kanban-shortcuts.ts` — global keydown handler: `n` opens `task-form-dialog`, `/` focuses toolbar filter, `s` triggers "Minta Saran", `?` opens shortcut-help popover. Ignore when focus is in an input/textarea. Uses `Kbd` component for hint rendering.
- [X] T062 [P] Create `apps/web/src/features/thesis/pages/kanban-tasks/partials/shortcut-help-popover.tsx` — popover listing all shortcuts with `Kbd` hints (triggered by `?`). Uses `@/components/ui/popover.tsx` + `@/components/ui/kbd.tsx`.
- [X] T063 [P] Extend `apps/web/src/features/thesis/pages/kanban-tasks/partials/task-card.tsx` — popover quick actions (Edit / Hapus / Pindah ke kolom / Atur tenggat manual) via `@/components/ui/popover.tsx`, triggered by "..." button. Each action wired to the appropriate handler.
- [X] T064 Run `php -l` on every new PHP file in `apps/api/app/{Models,Actions,Services,Http/Requests,Http/Resources,Http/Controllers,Policies}` + both migrations.
- [X] T065 Run `npx tsc --noEmit -p tsconfig.app.json` from `apps/web` — fix any type errors in new/extended files.
- [X] T066 Run the full `quickstart.md` validation — Scenarios 1–8 + ownership check. (User runs dev servers themselves; agent does not start them.)
- [X] T067 [P] Verify breadcrumb hierarchy in `index.tsx` reflects root -> active correctly; last item plain text, parents link to correct routes (constitution V).
- [X] T068 [P] Verify all user-facing text uses semi-formal friendly Indonesian via i18n keys (T003); identifiers stay English (constitution V).

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately.
- **Foundational (Phase 2)**: Depends on Setup; BLOCKS all user stories.
- **User Stories (Phase 3+)**: All depend on Foundational completion.
  - US2 (Phase 3, P1) first — task data + board shell + manual CRUD (MVP).
  - US1 (Phase 4, P1) depends on US2 components (task-card, board shell) — adds DnD + move.
  - US3 (Phase 5, P2) depends on US2 (task types/api) + Foundational (TaskService deadline computation) — adds suggestions.
  - US4 (Phase 6, P2) depends on US2/US1 (tasks exist) + Foundational (TaskService::recalcDeadlines) — adds recalc-on-deadline-change.
  - US5 (Phase 7, P3) depends on US1/US2 (cards visible) — adds urgency polish.
- **Polish (Phase 8)**: Depends on all desired stories complete.

### User Story Dependencies

- **US2 (P1)**: Can start after Foundational. No dependencies on other stories. MVP.
- **US1 (P1)**: Depends on US2 (task-card, board shell, task types/api). Builds DnD on top.
- **US3 (P2)**: Depends on US2 (Task types/api) + Foundational `TaskService` deadline computation. Independent of US1's DnD.
- **US4 (P2)**: Depends on US2/US1 (tasks exist on board) + Foundational `TaskService::recalcDeadlines`. Independent of US3.
- **US5 (P3)**: Depends on US1/US2 (cards rendered). Pure polish.

### Within Each User Story

- Models before services/actions.
- Actions before controllers.
- Controllers before routes.
- Backend before frontend (frontend consumes the API).
- Core implementation before polish.

### Parallel Opportunities

- Phase 1: T001, T002, T003 all [P] — different files.
- Phase 2: T004–T011 mostly [P] — migrations, models, policies are separate files; T011 (TaskService) depends on models conceptually but is a separate file (can be written in parallel, integrated after).
- US2: T012–T014, T021–T022, T025–T027 [P] (requests, resource, types, api, form, dialog, card — different files).
- US1: T030, T034, T036, T037 [P] (request, api extension, column, board — different files).
- US3: T040–T042, T049–T050, T052 [P] (LLM client, request, resource, types, api, card — different files).
- US5: T058–T059, T067–T068 [P] — card/toolbar extension, breadcrumb/i18n checks.
- Polish: T061–T063, T067–T068 [P] — shortcut hook, help popover, card popover, checks.

---

## Parallel Example: User Story 2

```bash
# Backend (parallel — different files):
Task: "Create StoreTaskRequest in apps/api/app/Http/Requests/Thesis/StoreTaskRequest.php"
Task: "Create UpdateTaskRequest in apps/api/app/Http/Requests/Thesis/UpdateTaskRequest.php"
Task: "Create TaskResource in apps/api/app/Http/Resources/Thesis/TaskResource.php"

# Frontend (parallel — different files):
Task: "Add Task types to apps/web/src/features/thesis/types.ts"
Task: "Create api client in apps/web/src/features/thesis/api/kanban-tasks.ts"
Task: "Create task-form.tsx partial"
Task: "Create task-form-dialog.tsx partial"
Task: "Create task-card.tsx partial"

# Then sequential (depend on the above):
Task: "Create CreateTaskAction, UpdateTaskAction, DeleteTaskAction"
Task: "Create TaskController + routes"
Task: "Create use-kanban-tasks hook + KanbanTasksPage"
```

---

## Parallel Example: User Story 3

```bash
# Parallel (different files):
Task: "Create TaskSuggestionLlmClient in apps/api/app/Services/Thesis/TaskSuggestionLlmClient.php"
Task: "Create GenerateTaskSuggestionsRequest in apps/api/app/Http/Requests/Thesis/GenerateTaskSuggestionsRequest.php"
Task: "Create TaskSuggestionResource in apps/api/app/Http/Resources/Thesis/TaskSuggestionResource.php"
Task: "Add TaskSuggestion types to apps/web/src/features/thesis/types.ts"
Task: "Extend api/kanban-tasks.ts with suggestion methods"

# Then sequential:
Task: "Create CreateTaskSuggestionAction, AcceptTaskSuggestionAction, RejectTaskSuggestionAction"
Task: "Create TaskSuggestionService + TaskSuggestionController + routes"
Task: "Create use-task-suggestions hook + suggestion-card + suggestion-panel"
```

---

## Implementation Strategy

### MVP First (US2 + US1)

1. Complete Phase 1: Setup (DnD dep, config, i18n).
2. Complete Phase 2: Foundational (migrations, models, policies, TaskService) — BLOCKS all.
3. Complete Phase 3: US2 — manual task CRUD + board shell + cards (no DnD yet).
4. Complete Phase 4: US1 — DnD move between columns.
5. **STOP and VALIDATE**: Student can create tasks, see them on the board, drag between columns. (MVP — delivers independent value as a manual kanban.)
6. Deploy/demo if ready.

### Incremental Delivery

1. Setup + Foundational -> foundation ready.
2. + US2 -> manual task CRUD on board (MVP baseline).
3. + US1 -> DnD board (MVP complete).
4. + US3 -> AI suggestions with computed deadlines.
5. + US4 -> deadline recalc on defense deadline change.
6. + US5 -> urgency indicators + polish.
7. Polish phase -> shortcuts, popovers, validation.
8. Each story adds value without breaking previous ones.

### Parallel Team Strategy

With multiple developers after Foundational:
- Developer A: US2 (backend) -> US1 (DnD).
- Developer B: US3 (LLM client + suggestions).
- US4/US5 integrated after their dependencies land.

---

## Notes

- [P] tasks = different files, no dependencies on incomplete tasks.
- [Story] label maps task to specific user story for traceability.
- Each user story is independently completable and testable (except US1 builds on US2's components — intentional, both P1).
- No automated tests — verify via `php -l`, `npx tsc --noEmit -p tsconfig.app.json`, and `quickstart.md` scenarios.
- Commit after each task or logical group.
- Stop at any checkpoint to validate a story independently.
- Avoid: vague tasks, same-file conflicts, cross-story dependencies that break independence.
- Constitution compliance: Controller -> Service -> Action (I-II), narrative activitylog (III), productivity polish + dark mode (IV), feature-based FE placement + breadcrumb + i18n (V). PHP class <=300 lines, method <=100 lines, React component <=300 lines.
- Delegate per project CLAUDE.md: backend authoring -> ammar; frontend authoring -> sierly; push -> haikal (only when user asks). Main thread orchestrates.