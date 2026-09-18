# Feature Specification: Supervision Note Rich Text & Date

**Feature Branch**: `004-supervision-note-rich-text`

**Created**: 2026-08-06

**Status**: Draft

**Input**: User description: "tracking waktu bimbingan dan notes dosen jadi mahasiswa ketika selesai bimbingan catat tanggal dan notes dari dosen. untuk menulis notes gunakan tiptap editor"

## User Scenarios & Testing *(mandatory)*

This feature evolves the existing per-chapter "notulen" (supervision note): it
adds the date the bimbingan took place and replaces the plain-text editor with a
rich text editor so the supervisor's feedback can be organized clearly. The
notulen stays one-per-chapter; the student (mahasiswa) transcribes the
supervisor's (dosen) feedback after each session.

### User Story 1 - Record the Supervision Date and Notes (Priority: P1)

After a bimbingan session for a chapter finishes, the student opens that
chapter's notulen and records the date the session took place plus the notes the
supervisor gave. The notes are written in a rich text editor that supports
headings, lists, bold, and italic, so feedback can be structured. Saving stores
both the date and the formatted notes as the chapter's supervision note.

**Why this priority**: This is the core act — capturing when a bimbingan happened
and what the supervisor advised, in a clear format. Without it the date tracking
and rich text have no value.

**Independent Test**: Open a chapter's notulen, enter a session date and
formatted notes, save, and confirm both the date and the formatted notes are
stored and shown back.

**Acceptance Scenarios**:

1. **Given** a chapter belongs to the active user's thesis, **When** the user
   opens the notulen and enters a session date plus notes then saves, **Then**
   the supervision note is stored with both the date and the formatted notes.
2. **Given** the notes input, **When** the user writes feedback, **Then** they
   can apply rich text formatting (headings, bullet/numbered lists, bold,
   italic) and the formatting is preserved on save.
3. **Given** the user tries to save with empty notes, **Then** the system
   prevents saving and asks for notes content.
4. **Given** the user enters a session date, **When** the date is a valid
   calendar date that is not in the future, **Then** it is accepted.

---

### User Story 2 - View the Supervision Date and Formatted Notes (Priority: P2)

When the user opens a chapter's notulen, they see the bimbingan date and the
supervisor's notes rendered with full rich text formatting, so they can review
what was discussed and advised without losing any structure.

**Why this priority**: The recorded date and formatting are only useful if they
can be reviewed exactly as saved; this confirms the capture worked and lets the
student revisit the feedback.

**Independent Test**: With a supervision note saved, open the notulen and confirm
the date is shown and the notes render with their headings/lists/emphasis
intact.

**Acceptance Scenarios**:

1. **Given** a chapter has a saved supervision note, **When** the user opens the
   notulen, **Then** the bimbingan date and the notes are displayed with the
   rich text formatting rendered as intended.
2. **Given** a chapter has no supervision note yet, **When** the user opens the
   notulen, **Then** a friendly empty state invites them to record the session
   date and notes.

---

### User Story 3 - Update or Clear the Supervision Note (Priority: P3)

The student can revise the session date or the notes as supervision continues,
or clear the notulen entirely when it is no longer needed. Clearing requires
confirmation so the record is not lost by accident.

**Why this priority**: Keeps the notulen accurate over time, but the feature
already delivers value with record + view; edits and deletion are a refinement
that already exists today and is preserved.

**Independent Test**: Edit a notulen's date/notes and confirm the change
persists; delete the notulen and confirm it is removed after confirmation.

**Acceptance Scenarios**:

1. **Given** a chapter has a saved supervision note, **When** the user edits the
   session date or the notes, **Then** the updated values are saved and shown.
2. **Given** a chapter has a saved supervision note, **When** the user chooses to
   delete it, **Then** the system asks for confirmation and only removes the
   note after the user confirms.
3. **Given** the notulen is deleted, **When** the user reopens it, **Then** the
   empty state is displayed.

---

### Edge Cases

- What happens when the user enters a session date in the future? (Rejected with
  a clear message — the notulen records a past bimbingan meeting.)
- What happens when notes contain only whitespace/formatting with no actual text?
  (Treated as empty and rejected, since there is no meaningful feedback to
  record.)
- What happens when very long, heavily formatted notes are saved? (The full
  content is preserved and displayed without truncation.)
- What happens to existing plain-text notulen when the rich text editor is
  introduced? (They remain fully readable — existing content is preserved and
  rendered as plain paragraphs; no data loss.)
- What happens when the chapter itself is deleted? (Its supervision note is
  removed alongside it, as today.)

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST allow the active user to record a supervision note for
  a chapter that contains a session date (waktu bimbingan) and the supervisor's
  notes, remaining one supervision note per chapter (1:1).
- **FR-002**: System MUST provide a rich text editor for the notes field that
  supports headings, bullet/numbered lists, bold, and italic, preserving the
  formatting on save and on display. The user has specified tiptap as the
  editor.
- **FR-003**: System MUST store the session date alongside the notes for each
  chapter's supervision note, representing when the bimbingan took place.
- **FR-004**: System MUST validate the session date as a real calendar date and
  MUST reject dates in the future.
- **FR-005**: System MUST reject saving a supervision note whose notes are empty
  or contain only whitespace/formatting with no readable text.
- **FR-006**: System MUST allow updating the session date and the notes of an
  existing supervision note.
- **FR-007**: System MUST allow deleting a supervision note only after explicit
  confirmation.
- **FR-008**: System MUST render the stored notes with their rich text
  formatting whenever the supervision note is viewed.
- **FR-009**: System MUST keep existing plain-text supervision notes fully
  readable after the rich text editor is introduced, with no data loss.
- **FR-010**: System MUST record a narrative activity log entry (who, action,
  target, when, narrative description) for every create, update, and delete of
  a supervision note.
- **FR-011**: The student (mahasiswa) is the author who transcribes the
  supervisor's (dosen) feedback into the supervision note; authorization reuses
  the existing chapter ownership and update policy — no new user role is
  introduced.

### Key Entities *(include if feature involves data)*

- **Supervision Note** (existing, 1:1 with chapter): evolves to carry a session
  date (waktu bimbingan) and rich-text notes content. Represents the record of a
  bimbingan session for that chapter — when it happened and what the supervisor
  advised the student.
- **Chapter** (existing): its supervision note now captures a date plus
  formatted notes instead of a single plain-text blob.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A user can record or refresh a chapter's supervision note (date +
  formatted notes) in under 1 minute.
- **SC-002**: Users can open a chapter's notulen and see the bimbingan date plus
  fully formatted notes within 2 seconds.
- **SC-003**: At least 90% of users complete the "record supervision note" flow
  successfully on their first attempt without assistance.
- **SC-004**: Every existing plain-text supervision note remains fully readable
  after the rich text editor is introduced — zero data loss.

## Assumptions

- The student (mahasiswa) is the author and transcribes the supervisor's (dosen)
  feedback into the supervision note after each bimbingan session. The system
  reuses the existing student-owned thesis and chapter update authorization; no
  new role or access path is introduced. (Resolved clarification Q1 → A.)
- This feature evolves the existing per-chapter "notulen" in place: it adds a
  session date and switches the notes editor to rich text, while keeping the
  one-supervision-note-per-chapter relationship. It is not a new many-entries
  session log. (Resolved clarification Q2 → C.)
- The user explicitly specified tiptap as the rich text editor. This spec
  expresses that as a rich-text editing capability (the WHAT); tiptap is the
  chosen implementation tool (the HOW, deferred to planning).
- The session date represents a real-world bimbingan meeting date and must not
  be in the future; backdating to an actual past meeting date is allowed.
- Existing plain-text notulen content is migrated as-is and rendered as plain
  paragraphs; no content is lost or rewritten during the editor switch.
- The target is the existing web SPA; dedicated mobile layouts are out of scope.
- Activity logging follows the existing project audit trail conventions
  (narrative, semi-formal Indonesian descriptions of each create/update/delete).