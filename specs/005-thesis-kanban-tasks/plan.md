# Implementation Plan: Thesis Kanban Task Board

**Branch**: `005-thesis-kanban-tasks` | **Date**: 2026-08-07 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/005-thesis-kanban-tasks/spec.md`

## Summary

Sebuah papan kanban tugas skripsi per thesis. Mahasiswa membuat dan mengelola
tugas sendiri (manual) dan/atau meminta saran AI yang menurunkan tugas dari
**notulen revisi dosen per chapter** (`SupervisionNote`) dan **chapter yang
belum lengkap** (status `draft`), beracuan pada **tenggat sidang**
(`defense_deadline_at` di `Thesis`, dari fitur 003). Tenggat setiap tugas
dihitung mundur dari tenggat sidang secara sistematis (proporsional terhadap
urutan prioritas) dan dihitung ulang otomatis saat tenggat sidang berubah —
kecuali tugas yang sudah selesai atau tenggatnya sudah diubah manual. Kartu
dipindahkan antar kolom (belum dimulai / sedang dikerjakan / selesai) via
drag-and-drop. Indikator urgensi (aman / mendekati / terlambat / tanpa tenggat)
disetujui per kartu.

Backend mengikuti layering `Controller → Service → Action` yang sudah ada
(mirip `003-supervision-guide`): `TaskController`, `TaskSuggestionController`,
`TaskService`, `TaskSuggestionService`, infra LLM `TaskSuggestionLlmClient`,
dan Actions CRUD per use case. `OwnedByUserScope` dipakai ulang lewat relasi
`thesis.user_id`; policy per model; `spatie/laravel-activitylog` untuk audit
naratif. Frontend adalah halaman baru `apps/web/src/features/thesis/pages/kanban-tasks/`
dengan komponen partials di `partials/`, hook `use-kanban-tasks`, API client
`features/thesis/api/kanban-tasks.ts`, memakai DnD library, popover, dan
shortcut keyboard. Form pakai komponen `@/components/forms/*` yang sudah ada;
daftar saran + tugas memakai pola `@/components/datatable/*` bila relevan.

## Technical Context

**Language/Version**: PHP 8.3 (apps/api, Laravel 13) + TypeScript (apps/web, React 19 + Vite 8)

**Primary Dependencies**:
- Backend: `openai-php/laravel` ^0.20.0 (OpenAI-compatible client → OpenRouter via `LLM_BASE_URL`, sudah terpasang dari 003), `spatie/laravel-activitylog` ^5.0, `spatie/laravel-permission` ^8.3. Tanpa dependency baru.
- Frontend: React 19 (React Compiler on), Tailwind v4, shadcn "base-nova" on `@base-ui/react`, `react-router-dom`, `@/lib/api` fetch helper, komponen `@/components/forms/*` dan `@/components/datatable/*` yang sudah ada. DnD: `@dnd-kit/core` + `@dnd-kit/sortable` (perlu dipasang — satu-satunya dependency baru; native HTML5 DnD tidak cukup untuk cross-column sortable kanban yang accessible).

**Storage**: SQLite (default; `:memory:` + array drivers saat test). Tabel baru `tasks`, `task_suggestions`; tidak ada perubahan kolom di `theses` (fitur ini hanya membaca `defense_deadline_at`).

**Testing**: Tidak ada test otomatis di project ini (per CLAUDE.md project). Verifikasi via `php -l`, `npx tsc --noEmit -p tsconfig.app.json`, dan skenario manual di `quickstart.md`.

**Target Platform**: Web — Laravel API (`apps/api`) + React SPA (`apps/web`), app independen, JSON via prefix `api/`, `auth` + ownership enforced.

**Project Type**: Web application (SPA frontend + API backend, no Inertia).

**Performance Goals**: Papan dimuat < 5 detik (SC-001); buat tugas < 30 detik (SC-002); saran AI kembali < 10 detik (SC-003) — LLM round-trip. Hitung ulang tenggat sinkron, trivial (beberapa tugas).

**Constraints**: Single DB action via Eloquent ORM; PHP class ≤ 300 baris, method ≤ 100 baris; React component file ≤ 300 baris; narrative activity log di tiap mutasi; no raw SQL untuk single CRUD; no emoji di code/output; no auto-run dev/build server.

**Scale/Scope**: Tool mahasiswa; satu thesis aktif per mahasiswa; belasan–puluhan tugas per thesis. Single-tenant-per-user ownership.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|---|---|---|
| I. Layered HTTP (Controller → Service → Action) | Pass | `TaskController` & `TaskSuggestionController` hanya parse HTTP + authorize + delegate; `TaskService` & `TaskSuggestionService` orkestrasi (hitung tenggat, hitung ulang saat deadline berubah, pengarsipan saran); Actions eksekusi satu unit DB (`CreateTaskAction`, `UpdateTaskAction`, `DeleteTaskAction`, `MoveTaskAction`, `CreateTaskSuggestionAction`, `AcceptTaskSuggestionAction`, `RejectTaskSuggestionAction`). LLM call = external API → infra Service `TaskSuggestionLlmClient` (bukan Action), konsisten dgn `GuidanceLlmClient` di 003. |
| II. Action single responsibility & DB execution | Pass | Tiap Action = satu use case; DB write via Eloquent. `AcceptTaskSuggestionAction` membuat Task + menandai suggestion diterima dalam satu transaksi. Tidak ada Action inject domain Service. `MoveTaskAction` hanya update `status` + `position`. |
| III. Narrative activity logging | Pass | Tiap create/update/delete/move task + accept/reject suggestion log via `activity('thesis')` dgn deskripsi naratif Indonesia (mis. "Membuat tugas 'Revisi BAB 1' untuk skripsi '...' — tenggat 2026-09-20."). |
| IV. Productivity-app design language | Pass | Papan kanban dense 3 kolom, kartu dgn urgency indicator, popover aksi cepat, shortcut keyboard, dark-mode parity. |
| V. Frontend design craft | Pass | Breadcrumb (Skripsi › Tugas Skripsi); feature-based placement: page-specific partials di `pages/kanban-tasks/partials/`, shared thesis types di `features/thesis/types.ts`, API client di `features/thesis/api/kanban-tasks.ts`, hook di `features/thesis/hooks/use-kanban-tasks.ts`. Form pakai `@/components/forms/*`. UI text semi-formal friendly Indonesian; identifier English. |

Tidak ada pelanggaran. Tidak perlu complexity tracking.

## Project Structure

### Documentation (this feature)

```text
specs/005-thesis-kanban-tasks/
├── plan.md              # File ini
├── research.md          # Phase 0 — research/decisions
├── data-model.md        # Phase 1 — entities, migrations, relations
├── quickstart.md        # Phase 1 — manual validation guide
├── contracts/           # Phase 1 — API + LLM contracts
│   ├── api.md
│   └── llm.md
└── tasks.md             # Phase 2 (/speckit-tasks — NOT created here)
```

### Source Code (repository root)

```text
apps/api/
├── app/
│   ├── Models/
│   │   ├── Thesis.php                  # +tasks(), +taskSuggestions() relations (no column change)
│   │   ├── Task.php                    # NEW
│   │   └── TaskSuggestion.php          # NEW
│   ├── Scopes/OwnedByUserScope.php     # reused (thesis.user_id) for Task & TaskSuggestion
│   ├── Actions/Thesis/
│   │   ├── CreateTaskAction.php        # NEW
│   │   ├── UpdateTaskAction.php        # NEW
│   │   ├── MoveTaskAction.php          # NEW — status + position change (DnD drop)
│   │   ├── DeleteTaskAction.php        # NEW
│   │   ├── CreateTaskSuggestionAction.php    # NEW — calls LLM, persists suggestions
│   │   ├── AcceptTaskSuggestionAction.php   # NEW — suggestion → Task, mark accepted
│   │   └── RejectTaskSuggestionAction.php   # NEW — mark rejected (hidden from active list)
│   ├── Services/Thesis/
│   │   ├── TaskService.php             # NEW — orchestration + deadline recalc
│   │   ├── TaskSuggestionService.php    # NEW — suggestion orchestration
│   │   └── TaskSuggestionLlmClient.php  # NEW — OpenRouter LLM call (infra)
│   ├── Http/
│   │   ├── Controllers/Thesis/
│   │   │   ├── TaskController.php            # NEW
│   │   │   └── TaskSuggestionController.php   # NEW
│   │   ├── Requests/Thesis/
│   │   │   ├── StoreTaskRequest.php          # NEW
│   │   │   ├── UpdateTaskRequest.php         # NEW
│   │   │   ├── MoveTaskRequest.php           # NEW
│   │   │   └── GenerateTaskSuggestionsRequest.php  # NEW (optional params)
│   │   └── Resources/Thesis/
│   │       ├── TaskResource.php             # NEW
│   │       └── TaskSuggestionResource.php   # NEW
│   └── Policies/
│       ├── TaskPolicy.php                   # NEW
│       └── TaskSuggestionPolicy.php          # NEW
├── database/migrations/
│   ├── 2026_08_07_000001_create_tasks_table.php            # NEW
│   └── 2026_08_07_000002_create_task_suggestions_table.php # NEW
└── routes/thesis.php             # +task & suggestion routes (same file, same group)

apps/web/
├── src/features/thesis/
│   ├── api/kanban-tasks.ts         # NEW — API client
│   ├── hooks/use-kanban-tasks.ts   # NEW — state + handlers
│   ├── pages/kanban-tasks/
│   │   ├── index.tsx               # NEW — board page (breadcrumb + DnD context)
│   │   └── partials/
│   │       ├── kanban-column.tsx       # NEW — column shell + droppable
│   │       ├── task-card.tsx           # NEW — card + urgency indicator + popover actions
│   │       ├── task-board.tsx          # NEW — 3-column DnD layout
│   │       ├── task-form.tsx           # NEW — create/edit form (uses @/components/forms/*)
│   │       ├── task-form-dialog.tsx    # NEW — modal wrapper for form (≤5 fields)
│   │       ├── suggestion-panel.tsx    # NEW — AI suggestion list + accept/reject
│   │       ├── suggestion-card.tsx    # NEW — single suggestion + computed deadline
│   │       ├── board-toolbar.tsx       # NEW — filter/sort + "Minta Saran" button
│   │       └── board-empty-state.tsx   # NEW
│   └── types.ts                    # +Task, TaskSuggestion, TaskStatus, Urgency types
├── src/components/ui/popover.tsx   # exists — used for card quick actions
├── src/components/ui/kbd.tsx       # exists — used for shortcut hints
└── src/App.tsx                     # +route for kanban-tasks page
```

**Structure Decision**: Web application layout (Option 2 adapted) —
`apps/api` (Laravel) + `apps/web` (React SPA), independen, sama seperti fitur
sebelumnya. Backend mengikuti pola `003-supervision-guide` persis
(Controller → Service → Action, OwnedByUserScope via `thesis.user_id`,
policies, narrative activitylog, infra LLM client). Frontend mengikuti
feature-based architecture: page baru di `features/thesis/pages/kanban-tasks/`,
partials di subfolder `partials/`, hook `use-*`, api client terpisah, types di
`features/thesis/types.ts`. Form memakai ulang `@/components/forms/*` (Field,
TextField, TextareaField, SelectField via react-hook-form). Daftar saran
memakai pola `@/components/datatable/*` bila perlu tabular, atau list sederhana
bila lebih kecil. Popover (`@/components/ui/popover.tsx`) untuk aksi cepat per
kartu; `Kbd` (`@/components/ui/kbd.tsx`) untuk hint shortcut.

## Complexity Tracking

> Tidak ada pelanggaran constitution. Tidak perlu diisi.