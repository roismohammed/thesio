# Research — Supervision Note Rich Text & Date

Phase 0 research for feature `004-supervision-note-rich-text`. All NEEDS CLARIFICATION items
resolved through codebase exploration and user clarification.

## R1. Rich text content storage format

**Decision**: Store tiptap `editor.getHTML()` output in the existing `supervision_notes.content`
`longText` column.

**Rationale**: HTML renders directly in a prose container or `EditorContent` (editable=false) with
no extra serializer. The column is already `longText`, so no type change is needed. Existing
plain-text notes render harmlessly as plain paragraphs inside the same prose container — satisfying
FR-009 (zero data loss) with no migration of content.

**Alternatives considered**:
- tiptap JSON (`getJSON()`): more structured and robust for future editor migrations, but requires a
  `generateHTML` serializer to render, and legacy plain-text rows would need manual wrapping into
  tiptap paragraph nodes. Rejected as over-engineering for the current 1:1 use case.

## R2. Rich text editor library & extensions

**Decision**: Use tiptap v3 (`@tiptap/react` + `@tiptap/starter-kit` + `@tiptap/pm`) with
`StarterKit`, which bundles Document, Paragraph, Text, Heading, Bold, Italic, BulletList,
OrderedList, and ListItem.

**Rationale**: The user explicitly specified tiptap (spec FR-002). StarterKit covers exactly the
required formatting (headings, bullet/numbered lists, bold, italic) with no extra extensions.
tiptap v3 supports React 19 (confirm exact version via Context7 during implementation).

**Alternatives considered**:
- Slimmer custom ProseMirror setup: rejected — StarterKit already is the minimal curated bundle.
- TipTap JSON-only extensions: rejected — same library, different output (see R1).

## R3. Date input component

**Decision**: Build a custom `components/ui/date-picker.tsx` calendar popover on the already
installed `react-day-picker` v10 + `@base-ui/react` Popover + `date-fns` v4. Wrap it in a new
`components/forms/date-field.tsx` that bridges to react-hook-form via `Controller`, matching the
existing field-component pattern (`text-field.tsx`, `select-field.tsx`, etc.).

**Rationale**: User chose a custom date-picker over the native `<input type="date">`.
`react-day-picker` and `date-fns` are already in `package.json`, so no new date dependency is
required. The field wrapper keeps the Form-context convention (every field is a `Controller` inside
`<Form>`) and reuses `FormItem` for label/description/error. Output is an ISO `yyyy-MM-dd` string.
Future dates are disabled (`disabled={{ after: new Date() }}`) to satisfy FR-004 on the client;
backend enforces `before_or_equal:today` as the source of truth.

**Alternatives considered**:
- `TextField type="date"`: simplest and accessible, but rejected by the user in clarification.
- A new external date library: unnecessary — `react-day-picker` + `date-fns` already installed.

## R4. History list (Riwayat Notulen) presentation

**Decision**: Add a read-only `DataTable` (client-side pagination, like `versions-tab.tsx`) on a new
page `features/thesis/pages/supervision-notes/index.tsx` at route `/thesis/:thesisId/notulen`,
backed by a new `GET /api/thesis/{thesis}/notulen` index endpoint. One row per chapter.

**Rationale**: User clarification requested a datatable history view. The cardinality stays 1:1
(one note per chapter); the list only aggregates. A thesis has a small number of chapters, so
client-side pagination (the existing `DataTable` default mode) is appropriate and matches the
`versions-tab.tsx` usage. `DataTableToolbar` provides chapter-title search. The endpoint returns
an excerpt (HTML stripped, truncated) plus `session_date` and `has_note` so the table can show
chapters without a note too.

**Alternatives considered**:
- Build the list in the thesis detail page from eager-loaded `chapter.supervision_note`: rejected —
  the chapter index serializer's eager-loading is not guaranteed, and a dedicated endpoint gives a
  clean, decoupled contract with a purpose-built excerpt.
- Server-side pagination: rejected — too few rows to justify it.

## R5. Delete confirmation UX

**Decision**: Replace the current `window.confirm` in `notulen-tab.tsx` with the existing
`AlertDialog` primitives (pattern already used in `pages/thesis/detail.tsx` for chapter deletion).

**Rationale**: FR-007 requires explicit confirmation; `AlertDialog` is the project's polished,
accessible confirmation pattern and aligns with Principle IV (purposeful, consistent UI). It also
supports enter/exit motion per `/make-interfaces-feel-better`.

**Alternatives considered**:
- Keep `window.confirm`: rejected — inconsistent with the design system and not polishable.

## R6. View-vs-edit interaction model

**Decision**: When a note exists, show a read-only view (`RichTextViewer` + formatted session date
+ last-updated timestamp) with Edit and Delete actions; Edit switches the tab into the form. When no
note exists, show the create form directly inside a friendly empty-state card.

**Rationale**: Cleanly separates US2 (view formatted notes) from US1/US3 (record/update). The
view-then-edit pattern reduces accidental edits and lets the student review feedback as saved. The
view↔edit swap gets a subtle enter/exit transition (Principle IV).

**Alternatives considered**:
- Always show the editor when a note exists (current behavior): rejected — buries the "view
  formatted notes" requirement and exposes the editor unnecessarily.

## R7. Validation of empty/whitespace-only rich text

**Decision**: Backend `UpsertSupervisionNoteRequest` adds a custom closure on `content` that strips
HTML tags (`preg_replace('/<[^>]*>/', '', $value)`) and fails when `trim()` of the result is empty.
Frontend zod schema mirrors this with a `superRefine` that strips tags client-side.

**Rationale**: tiptap can produce non-empty HTML with no readable text (e.g. `<p></p>`,
`<ul><li></li></ul>`). FR-005 requires rejecting whitespace/formatting-only notes. The strip-then
-empty check catches both. Backend is the source of truth; the client check gives immediate
feedback.

**Alternatives considered**:
- `required|string|min:1` only: rejected — passes `<p></p>`, violating FR-005.

## R8. Authorization

**Decision**: Reuse the existing chapter ownership/update policy (`$this->authorize('update',
$chapter)` for upsert/delete, `view` for reads) and `Chapter::booted` `OwnedByUserScope`. No new
role or policy is introduced.

**Rationale**: FR-011 — the student (mahasiswa) is the author; the existing student-owned thesis
policy already governs chapter access. The new thesis-level `index` endpoint authorizes `view` on
the thesis.