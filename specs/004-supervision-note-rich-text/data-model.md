# Data Model — Supervision Note Rich Text & Date

## Entity: SupervisionNote (evolved, 1:1 with Chapter)

The `supervision_notes` table already exists (`2026_08_04_000004_create_supervision_notes_table`).
This feature adds one column and changes the semantics of `content` from plain text to tiptap HTML.

### Schema

| Column | Type | Nullable | Notes |
|---|---|---|---|
| `id` | bigint, primary | no | existing |
| `chapter_id` | bigint, unique | no | existing — 1:1 with `chapters.id` |
| `session_date` | date | yes | **NEW** — null on legacy rows; required on new upsert. The real-world bimbingan date; must not be in the future. |
| `content` | longText | no | existing — now stores tiptap HTML (`editor.getHTML()`). Legacy plain-text rows are preserved as-is. |
| `created_at` | timestamp | no | existing |
| `updated_at` | timestamp | no | existing |

### Migration

New migration `2026_08_06_000003_add_session_date_to_supervision_notes_table.php`:

- `$table->date('session_date')->nullable()->after('chapter_id');`
- No data backfill — legacy notes keep `session_date = null` and remain readable (FR-009).
- `down()`: drop the `session_date` column.

### Eloquent

`App\Models\SupervisionNote`:
- Add `session_date` to `$fillable` (alongside `chapter_id`, `content`).
- Add to `casts()`: `'session_date' => 'date'` (serialized as ISO date string in JSON).

### Relationships (unchanged)

- `Chapter::supervisionNote(): HasOne` → `SupervisionNote`.
- `SupervisionNote::chapter(): BelongsTo` → `Chapter`.
- `Chapter::booted()` registers `OwnedByUserScope('thesis.user_id')` — enforces student ownership
  for all queries (FR-011).

### Validation rules (`UpsertSupervisionNoteRequest`)

```text
session_date : required | date | before_or_equal:today
content      : required | string | <custom: strip HTML tags, reject when trim() empty>
```

- `before_or_equal:today` enforces FR-004 (no future session dates).
- The `content` custom closure (see research R7):
  `if (trim(strip_tags((string) $value)) === '') { $fail('Catatan notulen tidak boleh kosong.'); }`
- `authorize(): bool` stays `true`; actual authorization is enforced in the Controller via
  `$this->authorize('view'/'update', $chapter)` (consistent with the rest of the Thesis controllers).

### State transitions

No state machine — the note is either present (created/updated) or absent (deleted). The
create-or-update semantics are handled by `SupervisionNote::updateOrCreate(['chapter_id' => …],
[…])` in `UpsertSupervisionNoteAction`, preserving the 1:1 invariant.

## Entity: Chapter (unchanged shape)

`Chapter` gains no new fields. Its `supervision_note` relation now carries `session_date` + HTML
`content`. The chapter show endpoint already returns `supervision_note: null` when absent; that
contract is preserved, with the evolved note shape.