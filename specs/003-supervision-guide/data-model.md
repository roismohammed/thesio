# Phase 1 — Data Model

**Feature**: 003-supervision-guide | **Date**: 2026-08-06

All snake_case tables/columns. Ownership via `App\Scopes\OwnedByUserScope` (reused). Timestamps are nullable where noted. Migrations live in `apps/api/database/migrations/`.

## New columns on `theses`

**Migration**: `2026_08_06_000001_add_defense_deadline_and_guidance_tracking_to_theses_table.php`

| Column | Type | Nullable | Notes |
|---|---|---|---|
| `defense_deadline_at` | timestamp | yes | The sidang deadline. Null = not yet set. |
| `guidance_last_viewed_at` | timestamp | yes | Last time the student opened the guidance page; drives the unread indicator (D5). |

**Model changes** (`Thesis.php`): add both to `$fillable`; add to `casts()` `'defense_deadline_at' => 'datetime'`, `'guidance_last_viewed_at' => 'datetime'`; add relation `supervisionGuides(): HasMany`.

No data migration needed (additive, nullable columns).

## `supervision_guides`

**Migration**: `2026_08_06_000002_create_supervision_guides_table.php`

| Column | Type | Nullable | Notes |
|---|---|---|---|
| `id` | bigIncrements | no | PK |
| `thesis_id` | foreignId → `theses.id` | no | `cascadeOnDelete` |
| `origin` | string(20) | no | `'scheduled'` \| `'on_demand'` |
| `status` | string(20) | no | `'current'` \| `'archived'`; default `'current'` |
| `is_tailored` | boolean | no | default false; flipped true on any tailoring (D6) |
| `generated_at` | timestamp | no | when the LLM produced the agenda |
| `created_at` | timestamp | no | |
| `updated_at` | timestamp | no | |

**Indexes**: index on `(thesis_id, status)`; partial unique index enforcing **at most one `status='current'` per thesis** (enforced in the service via archive-then-create within a transaction; a unique partial index is a backstop where the DB supports it — on SQLite use a filtered unique index or rely on service-level invariant).

**Model** (`SupervisionGuide.php`):
- `$fillable = ['thesis_id','origin','status','is_tailored','generated_at']`.
- `casts()`: `'is_tailored' => 'boolean'`, `'generated_at' => 'datetime'`.
- `booted()`: `static::addGlobalScope(new OwnedByUserScope('thesis.user_id'))` — same pattern as `Chapter`.
- Relations: `thesis(): BelongsTo`, `points(): HasMany` (ordered by `priority` asc).
- Helper: `markTailored()` sets `is_tailored = true`.

**Uniqueness / invariant**: exactly one `current` guide per thesis. Maintained by `SupervisionGuideService`: on a successful new generation (scheduled or on-demand), archive the prior current guide (`status='archived'`) then create the new one as `current`, inside a transaction.

## `guidance_points`

**Migration**: `2026_08_06_000003_create_guidance_points_table.php`

| Column | Type | Nullable | Notes |
|---|---|---|---|
| `id` | bigIncrements | no | PK |
| `supervision_guide_id` | foreignId → `supervision_guides.id` | no | `cascadeOnDelete` |
| `origin` | string(20) | no | `'system'` \| `'student'` |
| `title` | string(255) | no | |
| `description` | text | yes | context/reason for the point |
| `status` | string(20) | no | `'pending'` \| `'prepared'`; default `'pending'` |
| `priority` | integer | no | sort order; **lower = more urgent**; default 999 |
| `chapter_id` | foreignId → `chapters.id` | yes | `nullOnDelete`; optional link to source chapter |
| `supervision_note_id` | foreignId → `supervision_notes.id` | yes | `nullOnDelete`; optional link to source notulen |
| `created_at` | timestamp | no | |
| `updated_at` | timestamp | no | |

**Indexes**: index on `supervision_guide_id`; index on `(supervision_guide_id, priority)`.

**Model** (`GuidancePoint.php`):
- `$fillable = ['supervision_guide_id','origin','title','description','status','priority','chapter_id','supervision_note_id']`.
- `casts()`: `'priority' => 'integer'`.
- **No global ownership scope** — points are always accessed through their parent `SupervisionGuide` (route nesting `{guide}/points/{point}`), and the guide is ownership-scoped. A `GuidancePointPolicy` re-checks `$point->supervisionGuide->thesis->user` for direct authorization.
- Relations: `supervisionGuide(): BelongsTo`, `chapter(): BelongsTo` (optional), `supervisionNote(): BelongsTo` (optional — note: the `SupervisionNote` model from `002` is the "notulen" entity).

## Relationships summary

```text
User 1──* Thesis 1──* SupervisionGuide 1──* GuidancePoint *──1 Chapter
                           │                       │
                           │                       └──*──1 SupervisionNote (notulen)
                           └── (Thesis: defense_deadline_at, guidance_last_viewed_at)
```

- `Thesis` 1→N `SupervisionGuide`; at most one `current` per thesis.
- `SupervisionGuide` 1→N `GuidancePoint`.
- `GuidancePoint` N→0..1 `Chapter`, N→0..1 `SupervisionNote` (both optional, set only for system-generated points derived from those sources; student-added points are null on both unless the student chooses a chapter).

## Validation rules (Form Requests)

- **GenerateSupervisionGuideRequest**: no body (on-demand generation). Authorization: `view` thesis.
- **StoreGuidancePointRequest** (add custom point): `title` required string max 255; `description` nullable string; `chapter_id` nullable|exists:chapters,id (must belong to the thesis); `supervision_note_id` nullable|exists:supervision_notes,id. `origin` forced to `'student'`, `status` forced to `'pending'`, `priority` default 999.
- **UpdateGuidancePointRequest** (tailor): `status` nullable in `['pending','prepared']`; `title` nullable string max 255 (student may edit their own point); `description` nullable string. System points are not title-editable by the student (only status + delete); enforced in the Action/policy.
- **Defense deadline** (via extended `ThesisUpdateRequest`): `defense_deadline_at` nullable|date|after:today (when present).

## State transitions

**SupervisionGuide.status**:
- `current` → `archived` (when a newer generation succeeds; set by service, never by the student).

**SupervisionGuide.is_tailored**:
- `false` → `true` (any add/update/delete of a point flips it; never reset to false — a tailored guide stays tailored).

**GuidancePoint.status**:
- `pending` → `prepared` (student marks prepared); `prepared` → `pending` (student unmarks). Student-added points start `pending`.

## Activity log targets (narrative, `activity('thesis')`)

- Generate (scheduled): `performedOn($thesis)` → "Membuat agenda bimbingan otomatis untuk skripsi '{title}' — {n} poin diskusi, deadline sidang {deadline}." (or a "dilewati karena sedang disesuaikan" note when skipped)
- Generate (on-demand): "Membuat agenda bimbingan atas permintaan untuk skripsi '{title}' — {n} poin diskusi."
- Generate (failed): "Gagal membuat agenda bimbingan untuk skripsi '{title}'. Agenda sebelumnya tetap digunakan."
- Add point: `performedOn($guide)` → "Menambahkan poin bimbingan '{title}' pada agenda skripsi '{thesis}'."
- Update point (mark prepared): "Menandai poin bimbingan '{title}' sebagai siap dibawa ke dosen."
- Delete point: "Menghapus poin bimbingan '{title}' dari agenda."
- Set defense deadline (via thesis update): "Menetapkan deadline sidang skripsi '{title}' pada {date}."

## Size / constraint compliance

- All new PHP classes stay ≤ 300 lines, methods ≤ 100 lines. `CreateSupervisionGuideAction` (prompt-context assembly + LLM call + persist) is the heaviest; prompt assembly is delegated to `GuidanceLlmClient` (infra Service) to keep the Action under the method limit.
- React `GuidancePage` ≤ 300 lines; sub-sections extracted into `partials/` per constitution V.