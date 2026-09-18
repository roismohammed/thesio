# API Contracts — Supervision Note Rich Text & Date

All endpoints are under the student-scoped thesis route group (`routes/thesis.php`), authenticated,
and authorize via the existing chapter/thesis policies. JSON envelope is `{ "data": … }` (or
`null`/`204`).

## 1. List a thesis's supervision notes (history) — NEW

`GET /api/thesis/{thesis}/notulen`

- **Auth**: `view` thesis (`$this->authorize('view', $thesis)`).
- **Purpose**: Aggregates every chapter of the thesis with its supervision note (or none) for the
  Riwayat Notulen datatable. One row per chapter.
- **Response 200**:

```json
{
  "data": [
    {
      "chapter_id": 12,
      "chapter_title": "Bab I — Pendahuluan",
      "chapter_position": 1,
      "session_date": "2026-08-05",
      "content_excerpt": "Dosen menyarankan memperjelas rumusan masalah pada paragraf kedua…",
      "has_note": true,
      "updated_at": "2026-08-05T14:21:00+00:00"
    },
    {
      "chapter_id": 13,
      "chapter_title": "Bab II — Tinjauan Pustaka",
      "chapter_position": 2,
      "session_date": null,
      "content_excerpt": null,
      "has_note": false,
      "updated_at": null
    }
  ]
}
```

- `content_excerpt` = HTML-stripped, truncated to ~120 characters, `null` when `has_note` is false.
- Ordering: by `chapter_position` ascending.

## 2. Show a chapter's note (existing, evolved)

`GET /api/thesis/{thesis}/chapters/{chapter}/notulen`

- **Auth**: `view` chapter.
- **Response 200**: `{ "data": SupervisionNote | null }`. `data` is `null` when no note exists yet
  (valid initial state). `SupervisionNote` shape now includes `session_date`:

```json
{
  "data": {
    "id": 7,
    "chapter_id": 12,
    "session_date": "2026-08-05",
    "content": "<h2>Catatan dosen</h2><p>Perjelas <strong>rumusan masalah</strong>.</p><ul><li>…</li></ul>",
    "created_at": "2026-08-05T14:20:00+00:00",
    "updated_at": "2026-08-05T14:21:00+00:00"
  }
}
```

## 3. Create-or-update a chapter's note (existing, evolved)

`PUT /api/thesis/{thesis}/chapters/{chapter}/notulen`

- **Auth**: `update` chapter.
- **Request body** (`UpsertSupervisionNoteRequest`):

```json
{ "session_date": "2026-08-05", "content": "<p>Catatan…</p>" }
```

- **Validation**: `session_date` required|date|before_or_equal:today; `content` required|string +
  non-empty after HTML strip (see `data-model.md`).
- **Response 200**: `{ "data": SupervisionNote }` (same shape as show, includes `session_date`).
- **Response 422**: validation errors (future date, empty/whitespace-only content).
- Semantics: create-or-update (`updateOrCreate` on `chapter_id`), preserving the 1:1 invariant.

## 4. Delete a chapter's note (existing, unchanged)

`DELETE /api/thesis/{thesis}/chapters/{chapter}/notulen`

- **Auth**: `update` chapter.
- **Response 204** on success; **404** when no note exists.
- Delete confirmation is enforced in the UI (AlertDialog) per FR-007; the endpoint itself is
  idempotent only in the 404 case.

## Activity log narratives (FR-010)

Logged via `activity('thesis')->performedOn($chapter)->causedBy(request()->user())`:

- **Upsert (create)**: `"Menambahkan notulen bimbingan pada bab '{chapter.title}' — tanggal bimbingan {session_date}."`
- **Upsert (update)**: `"Memperbarui notulen bimbingan pada bab '{chapter.title}' — tanggal bimbingan {session_date}."`
- **Delete**: `"Menghapus notulen bimbingan pada bab '{chapter.title}'."` (existing narrative kept)

## Frontend type contract (`features/thesis/types.ts`)

```ts
export interface SupervisionNote {
  id: number
  chapter_id: number
  session_date: string | null   // ISO yyyy-MM-dd
  content: string               // tiptap HTML
  created_at: string
  updated_at: string
}

export interface SupervisionNoteListItem {
  chapter_id: number
  chapter_title: string
  chapter_position: number | null
  session_date: string | null
  content_excerpt: string | null
  has_note: boolean
  updated_at: string | null
}
```

## Frontend API client (`features/thesis/api/thesis.ts`)

- `upsertNote(thesisId, chapterId, body: { session_date: string; content: string }): Promise<NoteData>`
  — PUT body now carries both fields (was just `content`).
- `listNotes(thesisId): Promise<{ data: SupervisionNoteListItem[] }>` — **NEW**, GET
  `/api/thesis/{thesisId}/notulen`.
- `showNote` and `deleteNote` unchanged in signature (return shape gains `session_date`).