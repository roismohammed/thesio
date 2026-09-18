# Feature Specification: Thesis Development Task Kanban

**Feature Branch**: `005-thesis-task-kanban`

**Created**: 2026-08-07

**Status**: Draft

**Input**: User description: "Kanban task yang harus di kejar selama proses pengembangan skripsi"

## Overview

A Kanban board where a student tracks the concrete tasks they must pursue during
their thesis (skripsi) development — from revision items raised in bimbingan, to
chapter milestones, to administrative steps before the defense (sidang). Each task
lives as a card that the student moves across ordered stages, so the student
always sees what is pending, what is in progress, what is blocked, and what is
done.

The board is the student's single actionable to-do list for the thesis journey.
Tasks may be created manually and may optionally be linked to the thesis chapter
or supervision note (notulen) they originate from, so the student can jump from
"what I need to do" straight to "why I need to do it / where it came from" without
leaving the workflow.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Student Tracks Thesis Tasks on a Kanban Board (Priority: P1)

A student working on their thesis opens their task board and sees all open work
laid out across ordered stages. They add a task ("Revisi paragraf landasan
teori Bab II sesuai catatan dosen"), place it in the right stage, and later drag
it forward as they work on it until it reaches Done. The board becomes the living
checklist of what must be chased to move the thesis forward.

**Why this priority**: This is the MVP. A board where a student can capture,
organize, and advance tasks delivers standalone value even with no other feature
connected. Everything else builds on this.

**Independent Test**: Can be fully tested by creating a task, moving it from the
first stage to the last stage, and confirming the board reflects the new state —
delivering a usable personal thesis task tracker.

**Acceptance Scenarios**:

1. **Given** a student with an active thesis and an empty board, **When** they
   create a task with a title, **Then** the task appears as a card in the first
   stage of the board.
2. **Given** a task in the first stage, **When** the student advances it to the
   next stage, **Then** the card moves and the board preserves the new ordering
   without losing any other task.
3. **Given** a task the student no longer needs, **When** they delete it, **Then**
   the card is removed and the student is asked to confirm before the deletion is
   permanent.
4. **Given** an existing task, **When** the student edits its title or details,
   **Then** the card updates in place without changing its stage.

---

### User Story 2 - Student Links a Task to Its Origin (Priority: P2)

While reviewing feedback from bimbingan, a student creates a task and links it to
the specific thesis chapter and/or the supervision note (notulen) that gave rise
to it. Later, when the student looks at the card, they can open that chapter or
notulen directly from the task, so the actionable item and its source stay
connected instead of living in two separate places.

**Why this priority**: Linking turns the board from a generic to-do list into a
thesis-aware tracker. It is the bridge to the existing chapter and notulen
features and removes the "where did this task come from?" lookup cost.

**Independent Test**: Can be fully tested by creating a task, linking it to a
chapter and a notulen, then opening each linked item from the card and confirming
it is the correct source.

**Acceptance Scenarios**:

1. **Given** a task and an existing thesis chapter, **When** the student links
   the task to that chapter, **Then** the card shows a reference to the chapter
   and offers an action to open it.
2. **Given** a task and an existing supervision note, **When** the student links
   the task to that notulen, **Then** the card shows a reference to the notulen
   and offers an action to open it.
3. **Given** a task linked to a chapter, **When** the linked chapter is later
   removed, **Then** the task remains on the board with its link cleared and the
   student is informed of the broken reference rather than the task disappearing.

---

### User Story 3 - Student Prioritizes and Chases Due Tasks (Priority: P2)

A student has many tasks and a fixed defense (sidang) deadline approaching. They
assign a priority and an optional due date to each task. The board surfaces which
tasks are overdue or due soon and which are high priority, so the student knows
what to chase next without scanning every card.

**Why this priority**: With a deadline-driven thesis, raw task lists overwhelm;
priority and due dates turn the board into a guided "what to do now" view. This
is what makes the board actively useful during crunch time rather than just a
passive list.

**Independent Test**: Can be fully tested by giving several tasks different
priorities and due dates (one past, one near, one far) and confirming the board
highlights the overdue and due-soon high-priority tasks above the rest.

**Acceptance Scenarios**:

1. **Given** a task with no priority, **When** the student sets it to a high
   priority, **Then** the card is visually distinguished from normal-priority
   tasks on the board.
2. **Given** a task whose due date is today or in the past and is not Done,
   **When** the student views the board, **Then** that task is surfaced as
   overdue without the student having to search for it.
3. **Given** several tasks with different due dates, **When** the student views
   the board, **Then** tasks due within the next few days are visibly flagged as
   approaching.
4. **Given** a task in Done, **When** its due date is in the past, **Then** it is
   not flagged as overdue (a completed task is not nagged).

---

### User Story 4 - Student Reviews Overall Thesis Progress (Priority: P3)

A student wants a quick read on how close the thesis is to being "done" before
bimbingan. They look at a progress overview that summarizes the board: how many
tasks are open, in progress, blocked, and done, and how that maps against the
approaching defense deadline. This gives them a one-glance self-assessment instead
of counting cards by hand.

**Why this priority**: A summary view is valuable but builds on a populated board;
it is only meaningful once tasks exist. It improves self-awareness and the quality
of bimbingan conversations, not the core tracking act.

**Independent Test**: Can be fully tested by populating a board with tasks across
several stages and confirming the overview reports the correct counts per stage
and the overall completion share.

**Acceptance Scenarios**:

1. **Given** a board with tasks across multiple stages, **When** the student opens
   the progress overview, **Then** they see the count of tasks in each stage and
   the share of tasks that are Done.
2. **Given** a board with a known defense deadline, **When** the student opens the
   overview, **Then** the time remaining until the defense is shown alongside the
   completion share so the student can gauge pace.
3. **Given** an empty board, **When** the student opens the overview, **Then** they
   see a friendly empty state that invites them to add their first task rather than
   zeros with no guidance.

---

### User Story 5 - Student Generates Tasks From a Supervision Note (Priority: P3)

After a bimbingan, a student has a notulen full of the supervisor's feedback and
wants to turn the actionable parts into tasks without retyping them. They choose
the notulen and ask the board to suggest tasks; the system proposes actionable
items derived from the note, and the student accepts, edits, or dismisses each
one. Accepted suggestions land on the board like any manually created task.

**Why this priority**: This is an accelerator on top of manual tracking, not the
core tracking act itself. It is valuable for turning dense bimbingan notes into a
chaseable list quickly, but the board is fully useful without it.

**Independent Test**: Can be fully tested by picking a notulen, requesting
suggestions, accepting one and dismissing another, and confirming the accepted
suggestion appears on the board while the dismissed one does not.

**Acceptance Scenarios**:

1. **Given** a supervision note with actionable feedback, **When** the student
   requests suggestions from that notulen, **Then** the system proposes a list of
   candidate tasks derived from the note's content.
2. **Given** a proposed suggestion, **When** the student accepts it, **Then** a
   new task is created on the board in the first stage, optionally linked to the
   source notulen.
3. **Given** a proposed suggestion, **When** the student dismisses it, **Then** no
   task is created for that suggestion and the board is unchanged.
4. **Given** a proposed suggestion that closely matches a task already on the
   board, **When** the student reviews it, **Then** the likely duplicate is flagged
   so the student can skip it rather than create a redundant card.

---

### Edge Cases

- **Empty board**: A brand-new thesis with no tasks shows a guided empty state, not
  a blank set of columns.
- **Reopening a done task**: A task moved to Done can be moved back to an open
  stage; its "overdue" flag resumes applying if the due date is still past and it
  is no longer Done.
- **Past due date at creation**: A student can create a task with a due date
  already in the past; it is immediately surfaced as overdue.
- **Broken link to a deleted source**: When a linked chapter or notulen is
  deleted, the task stays on the board with the link cleared and a notice; the
  task itself is never deleted by the removal of its source.
- **Duplicate task titles**: The system allows identical titles (the student may
  legitimately have two "Revisi Bab II" tasks); uniqueness is not enforced.
- **Very long task title**: Overlong titles are truncated on the card face and
  shown in full when the card is opened, so the board layout stays stable.
- **Two devices editing at once**: If a student edits the same task from two
  devices, the most recent save wins and the other device sees the updated state
  on next view; no silent data loss, and the board remains consistent.
- **All tasks Done**: A board where every task is Done celebrates completion and
  stops surfacing overdue/due-soon warnings.
- **Suggestion duplicates an existing task**: When the LLM proposes a task that
  matches one already on the board, the student is shown the likely duplicate and
  can skip it rather than create a redundant card.
- **Suggestion generation failure**: If the LLM cannot produce suggestions for a
  notulen, the student is told generation failed and can retry; the notulen and the
  existing board are unaffected.
- **Dismissed suggestion reappears**: Re-requesting suggestions from the same
  notulen may surface similar items again; dismissing is per-request and does not
  permanently suppress a suggestion.
- **Suggestion from an empty or non-actionable notulen**: If a notulen contains no
  actionable feedback, the system returns no suggestions and tells the student
  there was nothing actionable to extract, rather than fabricating tasks.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST provide each active thesis with one task board
  containing an ordered set of stages (at minimum a starting stage, an in-progress
  stage, and a completed stage).
- **FR-002**: The system MUST allow the student to create a task with a title and
  optional details, placing it in a chosen stage.
- **FR-003**: The system MUST allow the student to move a task between stages and
  reorder tasks within a stage.
- **FR-004**: The system MUST allow the student to edit and delete a task, with
  deletion requiring explicit confirmation.
- **FR-005**: The system MUST allow the student to optionally link a task to a
  thesis chapter and/or a supervision note (notulen) as its origin.
- **FR-006**: The system MUST allow the student to set an optional priority and an
  optional due date on a task.
- **FR-007**: The system MUST visually distinguish high-priority tasks and MUST
  surface tasks that are overdue or due soon, while never flagging a completed
  task as overdue.
- **FR-008**: The system MUST keep a task on the board if a linked chapter or
  notulen is deleted, clearing only the broken link and informing the student.
- **FR-009**: The system MUST record who created/changed each task, what changed,
  and when, in a narrative activity log entry (per the project's narrative
  logging standard).
- **FR-010**: The system MUST provide a progress overview showing the count of
  tasks per stage, the completion share, and the time remaining until the defense
  deadline when one is set.
- **FR-011**: The system MUST allow the student to request task suggestions from a chosen supervision note (notulen) via an LLM. The system proposes actionable tasks derived from that notulen's feedback, and the student accepts, edits, or dismisses each suggestion individually. Accepted suggestions become tasks on the board exactly like manually created ones; manual creation remains the primary flow and no task is ever created without the student accepting it.
- **FR-012**: The board MUST be private to the student who owns the thesis. No supervisor (dosen) or any other party has any access to the board. This feature is student-facing only; the supervisor is not a user of this feature and has no view, create, or edit capability on the board.

### Key Entities *(include if feature involves data)*

- **Task**: A single actionable item the student must pursue for the thesis. Has a
  title, optional details, a current stage, an optional priority, an optional due
  date, an optional link to a chapter, an optional link to a supervision note, and
  created/changed audit metadata. Belongs to one thesis board.
- **Board**: The task board for one thesis; owns an ordered set of stages and the
  tasks within them. There is one board per active thesis.
- **Stage**: An ordered column on the board representing a task's progress state
  (e.g. a starting/to-do state, an in-progress state, and a completed state). A
  task occupies exactly one stage at a time.
- **Task Link**: The optional association between a task and a thesis chapter
  and/or a supervision note, recording where the task originated.
- **Task Suggestion**: A task proposed by the system from a chosen supervision
  note, pending the student's accept/edit/dismiss decision. A suggestion is not a
  task until the student accepts it; on acceptance it becomes a Task on the board
  (optionally linked to its source notulen), and on dismissal it is discarded.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A student can capture a new task and place it in the correct stage
  in under 30 seconds from opening the board.
- **SC-002**: A student can advance a task from the first stage to the completed
  stage in a single move action, with no other task disturbed.
- **SC-003**: Overdue and due-soon tasks are visible on the board view without the
  student needing to open or sort any card.
- **SC-004**: A student can reach the originating chapter or supervision note from
  a task card in at most two interactions.
- **SC-005**: A student can gauge overall thesis progress (completion share and
  time to defense) at a single glance, without counting cards manually.
- **SC-006**: When a linked chapter or notulen is deleted, no task is lost, and
  the affected task clearly reports its broken link rather than silently
  disappearing.
- **SC-007**: A student can request task suggestions from a notulen and accept or
  dismiss each proposed task without leaving the board, with no suggestion ever
  becoming a card unless the student explicitly accepts it.

## Clarification Decisions (2026-08-07)

Two scope-shaping decisions were resolved with the product owner before planning.

### Q1: Task origination — manual only, or also auto-extracted from supervision notes?

**Decision**: B — manual plus optional LLM suggestion.

The student can ask the system to propose tasks from a chosen supervision note
(notulen) via an LLM, then accept, edit, or dismiss each proposed suggestion.
Accepted suggestions become tasks on the board exactly like manually created
ones. Manual creation remains the primary flow, and no task is ever created
without the student explicitly accepting it (no automatic background extraction).
Encoded in FR-011 and User Story 5; supported by the Task Suggestion entity.

### Q2: Supervisor participation — read-only, or may also add/edit tasks?

**Decision**: Neither — the board is fully private to the student; the supervisor
(dosen) has no involvement in this feature at all.

Thesio is a student-facing management application. The supervisor is not a user
of the Kanban: no view, no create, no edit, no assignment capability. The board is
owned and operated solely by the student who owns the thesis. The supervisor role
from spec 001 is therefore not invoked by this feature. Encoded in FR-012; the
earlier "supervisor monitors the board" story was removed and replaced by the
student-side LLM-suggestion story (User Story 5).

## Assumptions

- Each student has one active thesis, so the default is one task board per thesis
  (a single board per student). Multi-thesis boards are out of scope for v1.
- The stage set is a sensible fixed default (a to-do / in-progress / completed
  progression). Fully custom stage configuration by the student is out of scope for
  v1; the default stages are assumed sufficient.
- The existing user authentication and role system (spec 001) is reused to identify
  the student and gate board access. Only the student who owns the thesis may see
  or touch its board; the supervisor (dosen) is not a user of this feature (see
  Clarification Decision Q2).
- The existing thesis chapter and supervision note (notulen) data (specs 002 and
  004) is reused as link targets and as the source for LLM task suggestions; this
  feature does not re-create chapter or notulen data, only references and reads it.
- The defense (sidang) deadline used by the progress overview is the one already
  established by the supervision guidance feature (spec 003); this feature reads
  it rather than introducing a separate deadline.
- Manual task creation is the primary flow. The LLM-driven suggestion flow
  (Clarification Decision Q1, option B) is a student-initiated, per-notulen,
  accept-to-create addition on top of manual creation — never a replacement for it
  and never a background pipeline.
- The task-suggestion LLM flow reuses the project's existing LLM integration
  pattern (already used by chapter paraphrasing in spec 002 and guidance
  generation in spec 003); no new LLM vendor or contract is assumed for v1.
- Standard web-app performance expectations apply; no high-concurrency or offline
  requirement is assumed for v1.
- Tasks are personal to the thesis; there is no cross-student collaboration, shared
  board, or supervisor involvement in v1.