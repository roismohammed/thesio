# Feature Specification: Thesis Chapter Management

**Feature Branch**: `002-thesis-chapter-management`

**Created**: 2026-08-04

**Status**: Draft

**Input**: User description: "Management skripsi: mahasiswa upload per bab, setiap bab punya masing-masing referensi (bisa upload jurnal, nambah link setiap bab), dan setiap bab ada notulen untuk memudahkan mahasiswa revisi dari dosen." Added in follow-up: "Ketika PDF/Word di-upload langsung dikonversi ke markdown, yang ditampilkan ke user adalah markdown-nya, dan ada fitur paraphrase menggunakan LLM."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Student Uploads a Thesis Chapter (Priority: P1)

A student who has an active thesis creates a chapter (e.g. "Bab I — Pendahuluan"),
uploads a PDF or Word document for that chapter, and the system automatically
converts the uploaded document to Markdown. What the student sees in the chapter
viewer is the converted Markdown rendering of their document (the original file
is still stored and downloadable). The student can upload each chapter separately
and independently — one chapter at a time, in any order — and the system keeps
each chapter as its own entry under the thesis. The student can upload a newer
version of a chapter's document, which is converted to Markdown in the same way.

**Why this priority**: Per-chapter upload with Markdown conversion is the
foundational act of the whole feature. Without a chapter existing with a
converted Markdown body, there is nothing to attach references to, nothing to
display in the reader, and nothing for the paraphrase feature to work on, so
this is the minimum viable slice.

**Independent Test**: Can be fully tested by a student creating a thesis, adding
one chapter, uploading a small PDF/Word document for it, and confirming the
chapter viewer shows the converted Markdown content while the original file
remains downloadable; reload confirms both persist.

**Acceptance Scenarios**:

1. **Given** a student with an active thesis and no chapters yet, **When** they
   create a chapter titled "Bab I — Pendahuluan" and upload a PDF/Word document
   for it, **Then** the chapter appears in the thesis chapter list with a
   "draft" status and its content is shown in the viewer as converted Markdown.
2. **Given** a student with an existing chapter that already has a document,
   **When** they upload a newer version of that chapter's document, **Then** a
   new chapter version is created, its content is converted to Markdown and
   shown, and previous versions remain available in the history.
3. **Given** a student uploading a document that exceeds the allowed size or is
   not an allowed format, **When** they submit the upload, **Then** it is
   rejected with a friendly message explaining the limit and accepted formats.
4. **Given** an uploaded document that the system cannot convert to Markdown
   (e.g. a scanned image-only PDF or a corrupted file), **When** conversion
   fails, **Then** the original file is still stored and the student sees a
   friendly message that the content could not be converted, with the option to
   re-upload a text-based file.
5. **Given** a student, **When** they view their thesis, **Then** they see every
   chapter they have added, each with its own current status, Markdown content,
   and last updated time.

---

### User Story 2 - Student Manages Per-Chapter References (Priority: P2)

For each chapter, a student manages that chapter's own list of references. A
reference is either an uploaded journal/article file or a link (URL) the student
adds to the chapter. References are scoped strictly to the chapter they belong
to — they do not appear under other chapters — and the student can add several
references to a single chapter, edit or remove them, and open/download them
later.

**Why this priority**: Per-chapter references are the second core differentiator
the user explicitly asked for ("setiap bab punya masing-masing referensi"). It
delivers value on its own once a chapter exists: a student can keep the sources
relevant to each chapter organised next to that chapter's text.

**Independent Test**: Can be fully tested by a student adding a chapter, then
adding one journal-file reference and one link reference to it, confirming only
that chapter shows those references, then editing the link and deleting the
journal file and confirming the list updates.

**Acceptance Scenarios**:

1. **Given** a student with an existing chapter, **When** they add a link
   reference (a URL and a title) to that chapter, **Then** the reference appears
   under that chapter only and is clickable to open the URL.
2. **Given** a student with an existing chapter, **When** they upload a
   journal/article file as a reference to that chapter, **Then** the file
   reference appears under that chapter and can be downloaded later.
3. **Given** a chapter with two references, **When** the student removes one,
   **Then** it is removed from that chapter's reference list and the other
   reference remains.
4. **Given** two chapters each with their own references, **When** the student
   views chapter A, **Then** they see only chapter A's references, not chapter
   B's.

---

### User Story 3 - Student Records Per-Chapter Notulen to Guide Revision (Priority: P3)

This application is a tool for students; the supervisor (dosen) does not have
access to it. After a bimbingan session, the student records a supervision note
(notulen) for the relevant chapter — capturing the revision points and guidance
the dosen gave them — so they can easily carry out the revision later. The
student can read the notulen for each of their chapters and use it as the basis
for revising that chapter. The notulen stays attached to its chapter, so the
student always knows which guidance applies to which chapter.

**Why this priority**: The notulen is the explicit value the user asked for to
"memudahkan mahasiswa revisi dari dosen". It depends on a chapter existing (US1)
to be attached to, but is otherwise an independent slice that turns the upload
feature into a guided revision loop — the student uses the recorded notulen to
drive their own revisions.

**Independent Test**: Can be tested by a student creating a chapter, then writing
a notulen for it, then re-opening that chapter and confirming the notulen
appears clearly under the chapter and is readable and editable.

**Acceptance Scenarios**:

1. **Given** a chapter that exists, **When** the student creates a notulen for
   that chapter, **Then** the notulen is attached to that chapter only and is
   visible when viewing the chapter.
2. **Given** a chapter with an existing notulen, **When** the student updates
   the notulen, **Then** they see the updated content when they reopen that
   chapter.
3. **Given** two chapters each with their own notulen, **When** the student
   opens chapter A, **Then** they see chapter A's notulen, not chapter B's.
4. **Given** a student reading a chapter's notulen, **When** they follow the
   points in the notulen and re-upload a corrected chapter document (US1),
   **Then** the chapter reflects the new document while the notulen remains
   accessible for that chapter.

---

### User Story 4 - Student Paraphrases Chapter Text with LLM (Priority: P4)

While viewing a chapter's converted Markdown content, the student can select a
portion of their own chapter text and ask the system to paraphrase it using a
language model. The system shows the paraphrased result as a preview. The
student can accept the paraphrase (which replaces the selected portion in the
chapter's Markdown) or discard it and keep the original text. This is a writing
assistance feature that helps the student rephrase their own draft for clarity
or flow.

**Why this priority**: Paraphrase is the highest-value writing assist layered on
top of the Markdown viewer (US1). It depends on a chapter with converted
Markdown content existing, but is otherwise an independent slice: a student can
open a chapter, paraphrase a paragraph, and get a rephrased version without
touching references or notulen.

**Independent Test**: Can be tested by a student opening a chapter that has
converted Markdown content, selecting a paragraph, requesting a paraphrase,
confirming a paraphrased preview appears, accepting it, and confirming the
chapter's Markdown now shows the paraphrased text in place of the selection.

**Acceptance Scenarios**:

1. **Given** a chapter with converted Markdown content, **When** the student
   selects a portion of text and requests a paraphrase, **Then** the system
   returns a paraphrased version of that selection shown as a preview alongside
   the original.
2. **Given** a paraphrase preview the student is happy with, **When** they
   accept it, **Then** the selected portion in the chapter's Markdown is replaced
   by the paraphrased text and the change is saved.
3. **Given** a paraphrase preview the student is unhappy with, **When** they
   discard it, **Then** the chapter's Markdown is left unchanged.
4. **Given** a paraphrase request that the language model cannot fulfil (e.g.
   the service is unavailable or the selection is too short/empty), **When** the
   request fails, **Then** the student sees a friendly message and the chapter's
   text is untouched.
5. **Given** a student paraphrasing text, **When** the action completes (accept
   or discard), **Then** it is recorded in the activity log as a narrative entry
   describing what was paraphrased and whether it was applied.

---

### Edge Cases

- What happens when a student uploads a chapter document with the same filename
  as one already attached to a different chapter of the same thesis? The
  system must store them independently without overwriting the other chapter's
  file.
- What happens when a student adds a link reference with a malformed or
  non-http(s) URL? It should be rejected with a friendly message asking for a
  valid URL.
- What happens when a student tries to upload a reference journal file that is
  too large or in an unsupported format? It should be rejected with the same
  friendly limit/format guidance as chapter uploads.
- What happens when a student records a notulen for a chapter that has no
  document uploaded yet? The notulen should still be allowed (the student may
  want to note structural guidance from the dosen before any draft exists) and
  visible to the student.
- What happens when a student deletes a chapter that already has references,
  a notulen, and previous document versions? The references, notulen, and all
  versions must be removed with the chapter (or clearly blocked), so no
  orphaned records remain.
- What happens when a student reverts to a previous chapter version? The
  reverted-to version becomes the current document while all other versions
  remain in the history.
- What happens when a student tries to access or download another student's
  thesis chapter, references, or notulen? Access must be denied; a student
  only ever sees their own thesis.
- What happens when an uploaded PDF/Word document is image-only (scanned) or
  contains no extractable text? The conversion to Markdown must fail gracefully,
  the original file must still be stored, and the student must see a friendly
  message that the content could not be converted and be invited to re-upload a
  text-based document.
- What happens when an uploaded document has complex formatting (tables, images,
  footnotes)? The Markdown conversion must preserve the readable text structure
  as well as the format allows; content that cannot be represented in Markdown
  is omitted without failing the whole conversion.
- What happens when a student paraphrases a very large selection (e.g. the whole
  chapter)? The system must enforce a sensible maximum selection size and show a
  friendly message inviting the student to select a smaller portion.
- What happens when the language model service is slow or temporarily
  unavailable during a paraphrase request? The student must see a friendly
  "try again" message and the chapter text must never be altered.
- What happens when a student accepts a paraphrase that replaces text — is the
  replaced text recoverable? The replaced text is part of a chapter Markdown
  edit, so the previous chapter version (before the edit) remains available in
  the version history.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST allow a student to create a thesis that holds their
  chapters, scoped to that student only.
- **FR-002**: System MUST allow a student to create a chapter under their thesis
  with a title and an optional order/position, and upload one document per
  chapter.
- **FR-003**: System MUST allow a student to upload each chapter's document
  separately and independently of other chapters.
- **FR-004**: System MUST allow a student to upload a newer version of a
  chapter's document; every previous version is retained in a version history so
  the student can open and compare past versions and revert to any earlier one.
- **FR-005**: System MUST enforce accepted file formats and a maximum file size
  for chapter uploads and journal/reference uploads, rejecting oversized or
  unsupported files with a friendly message.
- **FR-006**: System MUST allow a student to add references to a specific
  chapter, where each reference is either an uploaded journal/article file or a
  link (URL + title).
- **FR-007**: System MUST scope references to the chapter they belong to, so a
  reference added to one chapter is never listed under another chapter.
- **FR-008**: System MUST allow a student to edit and to remove a reference
  (link or uploaded file) from a chapter.
- **FR-009**: System MUST validate that link references use a well-formed
  http/https URL and reject invalid URLs with a friendly message.
- **FR-010**: System MUST allow a notulen (supervision note) to be created for a
  specific chapter, attached to that chapter only.
- **FR-011**: System MUST allow the notulen of a chapter to be updated, and the
  student must see the latest content when viewing the chapter.
- **FR-012**: System MUST let the student view, for each of their chapters, the
  chapter's current document (plus its version history), its references, and its
  notulen together in one place.
- **FR-013**: System MUST ensure a student can only access their own thesis,
  chapters, references, notulen, and chapter versions; another student's data
  must be unreachable.
- **FR-014**: System MUST record a narrative activity log entry for every
  data-changing action (create/update/delete of thesis, chapter, chapter version,
  reference, or notulen), capturing who did it, what changed, and the relevant
  before/after.
- **FR-015**: System MUST support a chapter status so the student can tell
  whether a chapter is a draft, submitted for review, or reviewed.
- **FR-016**: System MUST allow the student (owner of the thesis) to author and
  edit the notulen for each of their own chapters; no other actor has access to
  this application, so the notulen is entirely student-managed.
- **FR-017**: System MUST retain every previous chapter document version on
  re-upload as a full version history, and MUST let the student open, download,
  and revert to any earlier version of a chapter.
- **FR-018**: System MUST let the student see, for each chapter, a list of its
  document versions with timestamps so the revision progress is traceable.
- **FR-019**: System MUST accept PDF and Word document uploads for chapter
  documents and automatically convert each upload to Markdown.
- **FR-020**: System MUST show the student the converted Markdown content as the
  chapter's readable body in the chapter viewer, while still storing the original
  uploaded file so it can be downloaded.
- **FR-021**: System MUST store the converted Markdown as part of each chapter
  version, so the Markdown corresponds to the version that produced it.
- **FR-022**: System MUST handle conversion failure gracefully: if a document
  cannot be converted to Markdown (e.g. image-only scan, no extractable text),
  the original file is still stored and the student sees a friendly message
  inviting them to re-upload a text-based document.
- **FR-023**: System MUST allow a student to select a portion of their chapter's
  Markdown content and request an LLM-generated paraphrase of that selection,
  shown as a preview alongside the original text.
- **FR-024**: System MUST let the student accept a paraphrase preview (replacing
  the selected portion in the chapter's Markdown) or discard it (leaving the
  text unchanged).
- **FR-025**: System MUST enforce a sensible maximum selection size for
  paraphrase and reject oversized or empty selections with a friendly message,
  without altering the chapter text.
- **FR-026**: System MUST handle language model failures (service unavailable,
  timeout, error) gracefully with a friendly "try again" message and MUST NOT
  alter the chapter text when a paraphrase request fails.
- **FR-027**: System MUST record each paraphrase action in the activity log as a
  narrative entry stating what was paraphrased and whether the result was applied
  or discarded.

### Key Entities *(include if feature involves data)*

- **Thesis**: A student's thesis project; belongs to one student; holds many
  chapters. Has a title and a status (e.g. in progress).
- **Chapter**: A single chapter (e.g. "Bab I — Pendahuluan") belonging to one
  thesis; has a title, an order/position, a status (draft / submitted / reviewed),
  a current document version, and timestamps. Holds its own references, its own
  notulen, and its own document version history.
- **Chapter Version**: One saved revision of a chapter's uploaded document;
  belongs to one chapter; has the stored original file (PDF/Word), the Markdown
  content converted from that file, an uploader (the student), and a timestamp.
  The current version of a chapter points to one chapter version; re-upload
  creates a new chapter version (with its own converted Markdown) and moves the
  "current" pointer to it.
- **Reference**: A source attached to one chapter only. Either a link
  (title + URL) or an uploaded file (title + stored file). Never shared across
  chapters.
- **Notulen**: A supervision note attached to one chapter only; written by the
  student to record the guidance/revision points the dosen gave them, so the
  student can use it to revise that chapter. Has content (text) and timestamps;
  belongs to exactly one chapter.
- **Paraphrase**: A single LLM paraphrase request made by a student against a
  selection of their chapter's Markdown; has the original selection, the
  generated paraphrased text, the outcome (applied or discarded), and a
  timestamp. Belongs to one chapter and one student.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A student can create a thesis, add a chapter, and upload that
  chapter's document in under 2 minutes on a typical connection.
- **SC-002**: A student can add a link reference and a journal-file reference to
  a chapter in under 1 minute total, and confirm both are listed under only that
  chapter.
- **SC-003**: A student can open any of their chapters and immediately see, in
  one view, the chapter's converted Markdown content, its references, and its
  notulen without navigating to separate screens.
- **SC-004**: A student can record a notulen for a chapter in under 2 minutes,
  and the notulen is visible on their next view of that chapter.
- **SC-005**: 100% of students can only see and download their own thesis
  chapters, references, notulen, and chapter versions; cross-student access is
  never possible.
- **SC-006**: Every create/update/delete of a thesis, chapter, chapter version,
  reference, notulen, or paraphrase produces a narrative activity log entry a
  human can read and understand without inspecting code or database rows.
- **SC-007**: For at least 95% of text-based PDF/Word chapter uploads, the
  system produces a readable Markdown rendering the student can view without
  re-uploading.
- **SC-008**: A student can paraphrase a selected paragraph and accept or
  discard the result in under 30 seconds on a typical connection.

## Assumptions

- The authentication and role-based access control from the `001-user-auth`
  feature already exist and provide a logged-in user. This feature treats every
  logged-in user as a student (the application is a student-only tool); how that
  maps to existing roles is a planning concern, not a spec concern.
- The supervisor (dosen) has no access to this application. Bimbingan happens
  outside the tool; the student records the outcome as a notulen themselves to
  guide their own revision. There is no supervisor actor in this feature.
- A student has exactly one active thesis at a time in the v1 scope; managing
  multiple concurrent theses per student is out of scope for v1.
- Accepted chapter upload formats are document types commonly used for theses
  (e.g. PDF and Word document formats); exact formats and size limits are a
  planning/implementation decision, not a spec decision.
- Reference journal uploads use the same kind of document-format allowance and
  size-limit enforcement as chapter uploads.
- The system is a web application accessed by logged-in users on a stable
  internet connection; offline editing is out of scope.
- File storage and download are handled by the existing application's storage
  layer; this spec only requires that uploaded files (chapter versions and
  reference files) can be retrieved and downloaded by their owner.
- Chapter document versioning keeps full history with the ability to revert to
  any earlier version. The notulen is authored and managed solely by the student
  who owns the thesis (no supervisor access in this application).
- Chapter uploads are converted to Markdown automatically; the converted
  Markdown is what the student reads in the chapter viewer, while the original
  PDF/Word file remains stored and downloadable. The conversion targets
  text-based documents; image-only/scanned documents are out of scope for
  conversion and are reported gracefully.
- The paraphrase feature is a writing-assist that rephrases the student's own
  chapter draft text. Which specific language model provider to use is a
  planning/implementation decision, not a spec decision; this spec only requires
  that a paraphrase can be requested, previewed, accepted, or discarded, and
  that failures are handled gracefully without corrupting chapter content.
- Accepting a paraphrase edits the chapter's Markdown; the prior text remains
  recoverable through the chapter version history.