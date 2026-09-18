# Data Model: Thesis Chapter Management

**Branch**: `002-thesis-chapter-management` | **Date**: 2026-08-04

Identifier language: English (constitution). UI labels are Indonesian but do
not affect the schema. See `research.md` D7 for the `Notulen` →
`SupervisionNote` mapping.

## Entities

### Thesis
A student's thesis project. One active thesis per student in v1 (spec
assumption). Owns all chapters.

- **Table**: `theses`
- **Fields**:
  - `id` (bigint, pk)
  - `user_id` (bigint, fk → users, index) — owner/student
  - `title` (string)
  - `status` (string, enum: `in_progress`, `submitted`, `completed`; default `in_progress`)
  - `timestamps`
- **Relations**: `belongsTo(User)`, `hasMany(Chapter)`
- **Validation**: `title` required, max 255; `status` in enum.
- **State transitions**: `in_progress → submitted → completed` (student-driven;
  no supervisor actor). Revert allowed back to `in_progress`.
- **Ownership**: global scope filters by `user_id = Auth::id()`; policy on every
  mutation.

### Chapter
A single chapter under a thesis. Holds its own versions, references, and
supervision note. Re-upload creates a new `ChapterVersion` and moves the
`current_version_id` pointer.

- **Table**: `chapters`
- **Fields**:
  - `id` (bigint, pk)
  - `thesis_id` (bigint, fk → theses, index)
  - `title` (string)
  - `position` (unsigned integer, nullable — order within thesis)
  - `status` (string, enum: `draft`, `submitted`, `reviewed`; default `draft`)
  - `current_version_id` (bigint, fk → chapter_versions, nullable) —
    denormalized pointer to the active version
  - `timestamps`
- **Relations**: `belongsTo(Thesis)`, `hasMany(ChapterVersion)`,
  `hasMany(Reference)`, `hasOne(SupervisionNote)`, `hasMany(Paraphrase)`.
- **Validation**: `title` required, max 255; `position` nullable int ≥ 1;
  `status` in enum.
- **State transitions**: `draft → submitted → reviewed`; revert to `draft`
  allowed (student-managed).
- **Delete cascade**: removing a chapter deletes its versions, references,
  supervision note, and paraphrases (spec edge case — no orphans). DB-level
  `ON DELETE CASCADE` + explicit Action ordering.

### ChapterVersion
One saved revision of a chapter's document. Each upload creates a new version.
The converted Markdown is stored on the version, so Markdown always corresponds
to the version that produced it (FR-021). Accepting a paraphrase snapshots a
new Markdown-only version (research D10).

- **Table**: `chapter_versions`
- **Fields**:
  - `id` (bigint, pk)
  - `chapter_id` (bigint, fk → chapters, index)
  - `version_number` (unsigned integer) — monotonic per chapter, starts at 1
  - `source` (string, enum: `upload`, `paraphrase`; default `upload`) —
    distinguishes real uploads from paraphrase-snapshot versions
  - `original_file_path` (string, nullable) — disk path on `private` disk;
    nullable because paraphrase-snapshot versions have no original file
  - `original_file_name` (string, nullable) — original upload filename
  - `mime` (string, nullable)
  - `size` (unsigned integer, nullable) — bytes
  - `markdown_content` (longText, nullable) — converted Markdown
  - `conversion_status` (string, enum: `pending`, `succeeded`, `failed`;
    default `pending`)
  - `conversion_message` (string, nullable) — friendly failure reason
  - `uploaded_by` (bigint, fk → users) — the student
  - `timestamps`
- **Relations**: `belongsTo(Chapter)`, `belongsTo(User, 'uploaded_by')`.
- **Validation**: on upload, `file` required, mime in
  `application/pdf`, `application/msword`,
  `application/vnd.openxmlformats-officedocument.wordprocessingml.document`,
  max 10 MB (config).
- **Lifecycle**: upload → row created with `conversion_status=pending` →
  `ConvertChapterToMarkdownJob` fills `markdown_content` and sets `succeeded`,
  or sets `failed` + `conversion_message` (original file retained either way).
  Re-upload increments `version_number` and updates the chapter's
  `current_version_id`. Revert sets `current_version_id` to an earlier version
  without deleting later ones.

### Reference
A source attached to one chapter only — either a link or an uploaded file
(FR-006, FR-007). Never shared across chapters.

- **Table**: `chapter_references` (avoiding the SQL reserved word `references`)
- **Fields**:
  - `id` (bigint, pk)
  - `chapter_id` (bigint, fk → chapters, index)
  - `type` (string, enum: `link`, `file`)
  - `title` (string)
  - `url` (string, nullable) — for `type=link`
  - `file_path` (string, nullable) — disk path on `private` disk, for `type=file`
  - `file_name` (string, nullable) — original filename
  - `mime` (string, nullable)
  - `size` (unsigned integer, nullable)
  - `timestamps`
- **Relations**: `belongsTo(Chapter)`.
- **Validation**:
  - `link`: `title` required (max 255), `url` required and must be a valid
    `http`/`https` URL (FR-009); reject non-http(s) schemes with a friendly
    message.
  - `file`: `title` required, `file` required, mime in the document allow-list
    + optionally common journal formats (PDF), max 10 MB (FR-005, edge case).
- **Delete**: file references delete the stored file on delete.

### SupervisionNote (spec entity "Notulen")
A supervision note attached to one chapter, written by the student to record
the dosen's revision guidance (FR-010, FR-011, FR-016). One per chapter
(1-to-1).

- **Table**: `supervision_notes`
- **Fields**:
  - `id` (bigint, pk)
  - `chapter_id` (bigint, fk → chapters, unique)
  - `content` (longText)
  - `timestamps`
- **Relations**: `belongsTo(Chapter)` (chapter `hasOne`).
- **Validation**: `content` required (min 1). Allowed even when the chapter
  has no document yet (spec edge case).
- **Upsert**: `PUT /api/.../notulen` creates-or-updates the single row per
  chapter.

### Paraphrase
A single LLM paraphrase request against a selection of the chapter's Markdown
(FR-023 → FR-027). Recorded for audit regardless of outcome.

- **Table**: `paraphrases`
- **Fields**:
  - `id` (bigint, pk)
  - `chapter_id` (bigint, fk → chapters, index)
  - `user_id` (bigint, fk → users) — requester
  - `original_selection` (text) — the selected text sent to the LLM
  - `paraphrased_text` (text, nullable) — LLM result, null on failure
  - `outcome` (string, enum: `applied`, `discarded`, `failed`)
  - `timestamps`
- **Relations**: `belongsTo(Chapter)`, `belongsTo(User)`.
- **Validation**: `original_selection` required, length 1..5000 chars
  (FR-025). `paraphrased_text` set when LLM succeeds. On `applied`, the
  current chapter version's Markdown is updated and a new `ChapterVersion`
  with `source=paraphrase` is snapshot for recoverability (research D10).

## Relationships summary

```
User 1───1..* Thesis 1───1..* Chapter 1───1..* ChapterVersion
                                  1───1..* Reference
                                  1───0..1 SupervisionNote
                                  1───1..* Paraphrase
Chapter.currentVersion ──> ChapterVersion (denormalized pointer)
```

## Indexes & constraints

- `theses.user_id` index; `chapters.thesis_id` + `chapters.current_version_id`;
  `chapter_versions.chapter_id`; `chapter_references.chapter_id`;
  `supervision_notes.chapter_id` unique; `paraphrases.chapter_id`.
- Cascade deletes: `chapters` → `chapter_versions`, `chapter_references`,
  `supervision_notes`, `paraphrases` (ON DELETE CASCADE). `theses` → `chapters`.
- Foreign keys on `users` use `restrictOnDelete` (never cascade-delete a user
  into losing theses).

## Migrations (new, snake_case)

1. `2026_08_04_000000_create_theses_table.php`
2. `2026_08_04_000001_create_chapters_table.php`
3. `2026_08_04_000002_create_chapter_versions_table.php`
4. `2026_08_04_000003_create_chapter_references_table.php`
5. `2026_08_04_000004_create_supervision_notes_table.php`
6. `2026_08_04_000005_create_paraphrases_table.php`

Order matters: `chapters.current_version_id` references `chapter_versions`,
so `chapter_versions` is created before `chapters`, or the foreign key is
added in a later migration. Implementation will create `chapter_versions`
first, then `chapters`, then the rest.