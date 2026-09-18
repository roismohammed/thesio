# Phase 1 — Data Model

**Feature**: 005-thesis-kanban-tasks | **Date**: 2026-08-07

All snake_case tables/columns. Ownership via `App\Scopes\OwnedByUserScope` (reused, lewat relasi `thesis.user_id`). Timestamps nullable where noted. Migrations live in `apps/api/database/migrations/`. Tidak ada perubahan kolom di `theses` — fitur ini hanya membaca `defense_deadline_at` (dari fitur 003).

## `tasks`

**Migration**: `2026_08_07_000001_create_tasks_table.php`

| Column | Type | Nullable | Notes |
|---|---|---|---|
| `id` | bigIncrements | no | PK |
| `thesis_id` | foreignId → `theses.id` | no | `cascadeOnDelete` |
| `title` | string(255) | no | |
| `description` | text | yes | |
| `status` | string(20) | no | `'todo'` \| `'doing'` \| `'done'`; default `'todo'` |
| `priority` | integer | no | sort order; **lower = more urgent**; default 999 |
| `position` | integer | no | urutan kartu dalam kolom (DnD reorder); default 999 |
| `due_at` | timestamp | yes | tenggat; null = tanpa tenggat |
| `due_at_mode` | string(10) | no | `'auto'` (dihitung sistem) \| `'manual'` (user atur); default `'auto'` |
| `origin` | string(10) | no | `'manual'` (user) \| `'suggestion'` (diterima dari saran AI); default `'manual'` |
| `chapter_id` | foreignId → `chapters.id` | yes | `nullOnDelete`; tautan opsional ke chapter |
| `supervision_note_id` | foreignId → `supervision_notes.id` | yes | `nullOnDelete`; tautan opsional ke notulen revisi (sumber saran) |
| `task_suggestion_id` | foreignId → `task_suggestions.id` | yes | `nullOnDelete`; jejak saran asal bila `origin='suggestion'` |
| `created_at` | timestamp | no | |
| `updated_at` | timestamp | no | |

**Indexes**: index on `thesis_id`; index on `(thesis_id, status, position)`; index on `(thesis_id, due_at)`.

**Model** (`Task.php`):
- `$fillable = ['thesis_id','title','description','status','priority','position','due_at','due_at_mode','origin','chapter_id','supervision_note_id','task_suggestion_id']`.
- `casts()`: `'priority' => 'integer'`, `'position' => 'integer'`, `'due_at' => 'datetime'`.
- `booted()`: `static::addGlobalScope(new OwnedByUserScope('thesis.user_id'))` — sama seperti `Chapter`/`SupervisionGuide`.
- Relations: `thesis(): BelongsTo`, `chapter(): BelongsTo` (optional), `supervisionNote(): BelongsTo` (optional), `taskSuggestion(): BelongsTo` (optional).
- Helper: `isDone(): bool`.

## `task_suggestions`

**Migration**: `2026_08_07_000002_create_task_suggestions_table.php`

| Column | Type | Nullable | Notes |
|---|---|---|---|
| `id` | bigIncrements | no | PK |
| `thesis_id` | foreignId → `theses.id` | no | `cascadeOnDelete` |
| `title` | string(255) | no | |
| `description` | text | yes | |
| `priority` | integer | no | dari LLM; lower = more urgent |
| `source_type` | string(20) | no | `'note_revision'` \| `'chapter_draft'` |
| `chapter_id` | foreignId → `chapters.id` | yes | `nullOnDelete`; sumber chapter |
| `supervision_note_id` | foreignId → `supervision_notes.id` | yes | `nullOnDelete`; sumber notulen |
| `signature` | string(64) | no | hash dedup (lihat D9); unique per thesis |
| `status` | string(20) | no | `'pending'` \| `'accepted'` \| `'rejected'`; default `'pending'` |
| `generated_at` | timestamp | no | saat LLM produce saran |
| `created_at` | timestamp | no | |
| `updated_at` | timestamp | no | |

**Indexes**: index on `thesis_id`; index on `(thesis_id, status)`; **unique** on `(thesis_id, signature)` — menegakkan dedup: satu signature per thesis (saran diterima/ditolak tetap uniq, tidak duplikat). Status `rejected` tetap di baris ini (tidak dihapus) supaya tidak muncul lagi (D9).

**Model** (`TaskSuggestion.php`):
- `$fillable = ['thesis_id','title','description','priority','source_type','chapter_id','supervision_note_id','signature','status','generated_at']`.
- `casts()`: `'priority' => 'integer'`, `'generated_at' => 'datetime'`.
- `booted()`: `static::addGlobalScope(new OwnedByUserScope('thesis.user_id'))`.
- Relations: `thesis(): BelongsTo`, `chapter(): BelongsTo` (optional), `supervisionNote(): BelongsTo` (optional), `task(): HasOne` (optional — task yang dibuat saat diterima, via `task_suggestion_id` di Task).
- Helper: `signatureFor(string $sourceType, ?int $sourceId, string $title): string` — static, normalized hash.

**Signature**: `sha1(strtolower(trim($sourceType)) . '|' . ($sourceId ?? 'null') . '|' . strtolower(trim($title)))`. Dihunkan di Action sebelum insert.

## Thesis (no column change)

**Model** (`Thesis.php`): tambah relation saja, tidak ubah kolom/migration:
- `tasks(): HasMany`
- `taskSuggestions(): HasMany`

## Relationships summary

```text
User 1──* Thesis 1──* Task *──0..1 Chapter
                       │           │
                       │           └──*──0..1 SupervisionNote (notulen revisi)
                       │
                       └──0..1 TaskSuggestion *──0..1 Chapter
                                │                  │
                                │                  └──*──0..1 SupervisionNote
                                └──0..1 Task (via task.task_suggestion_id)
```

- `Thesis` 1→N `Task`; `Thesis` 1→N `TaskSuggestion`.
- `Task` N→0..1 `Chapter`, N→0..1 `SupervisionNote`, N→0..1 `TaskSuggestion`.
- `TaskSuggestion` N→0..1 `Chapter`, N→0..1 `SupervisionNote`, 0..1→1 `Task` (via `task.task_suggestion_id`).

## Validation rules (Form Requests)

- **StoreTaskRequest**: `title` required string max 255; `description` nullable string; `priority` nullable integer ≥ 0; `chapter_id` nullable|exists:chapters,id (must belong to thesis); `supervision_note_id` nullable|exists:supervision_notes,id (must belong to thesis). `status` forced `'todo'`, `position` default 999, `origin` forced `'manual'`, `due_at_mode` forced `'auto'` (deadline computed by service if defense deadline set, else null). Authorization: `update` thesis.
- **UpdateTaskRequest**: `title` nullable string max 255; `description` nullable; `priority` nullable integer ≥ 0; `due_at` nullable|date|after:today (saat user atur manual); `chapter_id`/`supervision_note_id` nullable; `status` nullable in `['todo','doing','done']`. Saat `due_at` diubah user, flip `due_at_mode='manual'`. Authorization: `update` thesis.
- **MoveTaskRequest** (DnD drop): `status` required in `['todo','doing','done']`; `position` required integer ≥ 0. Authorization: `update` thesis.
- **GenerateTaskSuggestionsRequest**: no body (optional `force` boolean untuk re-generate). Authorization: `view` thesis.
- **AcceptTaskSuggestionRequest**: no body. Authorization: `update` thesis.

## State transitions

**Task.status**:
- `todo` → `doing` → `done` (mahasiswa pindah kartus via DnD atau popover).
- Revert allowed: `done` → `doing`/`todo`, `doing` → `todo` (mahasiswa-managed, no supervisor actor).

**Task.due_at_mode**:
- `auto` → `manual` (saat user set/edit `due_at` eksplisit). Tidak reset otomatis (D6).

**TaskSuggestion.status**:
- `pending` → `accepted` (mahasiswa terima → `AcceptTaskSuggestionAction` buat Task dgn `origin='suggestion'`, `task_suggestion_id` diisi).
- `pending` → `rejected` (mahasiswa tolak → status `rejected`, tetap di DB untuk dedup, tidak muncul di daftar aktif).

## Deadline computation (`TaskService::computeDeadlines`)

Rumus (D2): untuk N tugas belum selesai (`status != 'done'`, `due_at_mode = 'auto'`) sort by `priority` asc:
- `slot = (defense_deadline_at - now) / (N + 1)`
- tugas ke-`i` (0-indexed) → `due_at = defense_deadline_at - (N - i) * slot`
- Garansi: priority lebih kecil → due_at lebih dekat ke deadline (SC-004).

Dipanggil oleh:
- `CreateTaskAction` setelah insert (untuk tugas `auto` baru).
- `AcceptTaskSuggestionAction` setelah insert task dari saran.
- `TaskController::update` setelah `UpdateThesisAction` (saat `defense_deadline_at` berubah) — controller orchestration (D7).
- Bila `defense_deadline_at IS NULL`: skip, `due_at` tetap null (D8).

## Urgency helper (`TaskService::urgency(Task)` or pure function)

```php
function urgency(?Carbon $dueAt, Carbon $now, int $soonDays = 7): string
{
    if ($dueAt === null) return 'none';
    if ($dueAt->lt($now)) return 'late';
    if ($dueAt->lt($now->copy()->addDays($soonDays))) return 'soon';
    return 'safe';
}
```

`soonDays` dari `config('thesis.task_urgent_within_days', 7)` (D3).

## Activity log targets (narrative, `activity('thesis')`)

- Create task (manual): `performedOn($thesis)` → "Membuat tugas '{title}' untuk skripsi '{thesis.title}'."
- Create task (from suggestion): "Menerima saran tugas '{title}' menjadi tugas skripsi '{thesis.title}' — tenggat {due_at}."
- Update task (edit): "Memperbarui tugas '{title}' pada skripsi '{thesis.title}'."
- Move task (status change): "Memindahkan tugas '{title}' ke kolom {status} pada skripsi '{thesis.title}'."
- Set manual deadline: "Mengatur tenggat tugas '{title}' manual ke {due_at} pada skripsi '{thesis.title}'."
- Delete task: "Menghapus tugas '{title}' dari papan skripsi '{thesis.title}'."
- Generate suggestions: "Membuat saran tugas skripsi untuk '{thesis.title}' — {n} saran dari notulen revisi dan bab belum lengkap."
- Reject suggestion: "Menolak saran tugas '{title}' pada skripsi '{thesis.title}'."
- Recalc deadlines (defense deadline changed): "Menghitung ulang tenggat {n} tugas skripsi '{thesis.title}' karena deadline sidang diperbarui."

## Size / constraint compliance

- Semua PHP class baru ≤ 300 baris, method ≤ 100 baris. `TaskService` paling berat (compute + recalc + urgency); ekstrak `DeadlineCalculator` value object/helper bila `computeDeadlines` mendekati limit method — prefer private method dulu.
- React component file ≤ 300 baris; ekstrak partials per constitution V. `index.tsx` (board page) ringan — komposisi `TaskBoard` + `BoardToolbar` + `SuggestionPanel`. Logic di `use-kanban-tasks.ts`.
- ponytail: signature dedup unique index — bila LLM berubah pola title, signature lama tetap blok; add signature reset command bila perlu re-suggest dari nol.