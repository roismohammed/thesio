# Feature Specification: Supervision Guidance for Bimbingan Preparation

**Feature Branch**: `003-supervision-guide`

**Created**: 2026-08-06

**Status**: Draft

**Input**: User description: "fitur memberikan panduan apa yang harus di bimbingin ke dosen." Follow-up: "nanti LLM yang akan membuat guidance setiap waktu yang ditentukan dari hasil notulen yang sudah ada, deadline sidang yang sudah ditentukan." The system has an LLM generate the guidance agenda automatically on a determined schedule, derived from the notulen already recorded by the student and the already-set defense (sidang) deadline, alongside the thesis chapters and their statuses. The student can also trigger a generation on demand.

## Clarifications

### Session 2026-08-06

- Q: When a scheduled generation runs while the student is actively tailoring the current agenda, what should happen to their in-progress work? → A: Scheduled regeneration is skipped when the current agenda has student edits since the last generation; the student gets a gentle prompt that newer guidance is available to adopt.
- Q: As the defense deadline approaches, how should "deadline-aware prioritisation" show up to the student in the agenda? → A: Only reorder points by urgency; every point stays fully visible regardless of deadline proximity (no collapsing or hiding).
- Q: After a scheduled generation produces a new agenda in the background, how does the student learn it is new since their last visit? → A: A subtle unread/badge indicator on the guidance section showing a new agenda arrived, cleared when the student opens it (an in-app unread state, distinct from out-of-scope real-time push notifications).

## User Scenarios & Testing *(mandatory)*

### User Story 1 - System Auto-Generates a Bimbingan Guidance Agenda on a Schedule (Priority: P1)

A student who has an active thesis with at least one chapter, at least one
recorded notulen, and a set defense (sidang) deadline does not need to ask for
guidance manually. On a determined schedule, the system has the LLM read the
state of the thesis — the notulen recorded from previous bimbingan sessions,
the defense deadline and how much time remains before it, the chapters and
their statuses, the Markdown content of the current chapter versions, and the
references attached to each chapter — and produces a structured guidance agenda
of what the student should bring up and seek supervision on at their next
bimbingan with the dosen. The agenda is deadline-aware: discussion points are
prioritised by how much time remains before the defense, so the most urgent
matters surface first as the deadline approaches. The generated agenda is
stored as the current guidance and is available for the student to view the next
time they open the section. The student can also request a generation on demand
at any time, using the same inputs and producing the same kind of agenda.

**Why this priority**: Scheduled, deadline-aware generation from the existing
notulen is the core act the follow-up asked for. It is the minimum viable
slice: a student with notulen and a defense deadline automatically receives a
fresh, prioritised guidance agenda on a schedule and can act on it, without
manual triggering being a precondition for value.

**Independent Test**: Can be fully tested by a student who has a thesis with
chapters, at least one notulen, and a set defense deadline waiting for the
scheduled generation to run (or triggering it on demand) and confirming the
produced agenda lists concrete, source-linked discussion points that reflect
their actual notulen and prioritise by the remaining time to the defense.

**Acceptance Scenarios**:

1. **Given** a student with an active thesis that has at least one chapter, at
   least one recorded notulen, and a set defense deadline, **When** the
   scheduled generation time arrives, **Then** the LLM produces a structured
   guidance agenda derived from the notulen and the thesis state, prioritised
   by the remaining time to the defense, and stores it as the current guidance.
2. **Given** the same student, **When** they open the supervision guidance
   section after a scheduled generation has run, **Then** they see the most
   recently generated agenda as the current guidance without having triggered
   anything themselves.
3. **Given** a student who wants guidance sooner than the next scheduled run,
   **When** they request a generation on demand, **Then** the LLM produces an
   agenda from the same inputs (notulen, defense deadline, chapters, statuses,
   references) and stores it as the current guidance.
4. **Given** a generated agenda, **When** the student views it, **Then** each
   discussion point links to the chapter (and, where relevant, the notulen) it
   was derived from, and the agenda communicates the remaining time to the
   defense so the student understands the prioritisation.
5. **Given** a student whose thesis has chapters and a set defense deadline but
   no recorded notulen yet, **When** the scheduled generation time arrives,
   **Then** the system still generates an agenda from the chapters, statuses,
   and the defense deadline, and notes that no prior supervision notes exist
   yet so follow-up points could not be derived.
6. **Given** a student whose thesis has no chapters yet, **When** the scheduled
   generation time arrives, **Then** the system does not generate an agenda and
   instead leaves a friendly note (visible next time the student opens the
   section) guiding them to create and upload at least one chapter first.
7. **Given** a scheduled or on-demand generation where the LLM analysis fails,
   **When** the failure occurs, **Then** the student sees a friendly message (on
   next open, or immediately for on-demand) that the agenda could not be
   generated and can retry, with no partial or corrupted agenda stored as
   current and the previous current agenda left intact.
8. **Given** a student who has tailored the current agenda (removed, marked, or
   added points) since it was generated, **When** the scheduled generation time
   arrives, **Then** the system skips the automatic regeneration to preserve
   their in-progress work and instead shows the student a gentle prompt that
   newer guidance is available, which they can adopt on demand.

---

### User Story 2 - Student Reviews and Tailors the Guidance Agenda (Priority: P2)

After a guidance agenda is generated (by schedule or on demand), the student
reviews the discussion points and tailors the agenda to their needs before the
bimbingan. They can mark a generated point as prepared or remove a point they do
not find useful, add their own custom discussion points (questions or topics
they want to raise with the dosen), and reorganise the agenda. Edits are saved so
the agenda reflects what the student actually intends to bring to the session.
The student can also request an on-demand regeneration to refresh the agenda
with the latest thesis state; regeneration produces a new agenda while the
previous one remains available in history.

**Why this priority**: The generated agenda is a starting point, not a final
plan. Tailoring it — keeping what is useful, dropping what is not, adding the
student's own questions — is what turns an auto-generated list into a real
bimbingan preparation the student will actually use.

**Independent Test**: Can be fully tested by a student opening a generated
agenda, removing one point, marking another as prepared, adding a custom point,
and confirming all edits persist on reload; then requesting an on-demand
regeneration and confirming the old agenda is preserved in history while the
new one becomes current.

**Acceptance Scenarios**:

1. **Given** a student with a current generated guidance agenda, **When** they
   remove a discussion point they do not want, **Then** that point is removed
   from the current agenda and the change persists.
2. **Given** a student with a current guidance agenda, **When** they mark a
   discussion point as prepared (ready to bring to bimbingan), **Then** the
   point's status updates to "prepared" and the change persists.
3. **Given** a student with a current guidance agenda, **When** they add their
   own custom discussion point (a topic or question for the dosen), **Then**
   the custom point appears in the agenda, is clearly distinguishable from
   system-generated points, and links to no specific chapter unless the student
   chooses one.
4. **Given** a student with a current guidance agenda, **When** they request an
   on-demand regeneration, **Then** a fresh agenda is produced from the latest
   thesis state, becomes the current agenda, and the previously current agenda
   is preserved in history with its timestamp.

---

### User Story 3 - Student Tracks Bimbingan Guidance History (Priority: P3)

Each generated guidance agenda is dated and kept in a history so the student can
look back at what they prepared for past bimbingan sessions, whether the agenda
was produced by a scheduled run or an on-demand request. The student can open a
past agenda, see which points were marked prepared, and compare it with later
agendas to notice what supervision topics recur or remain unresolved across
sessions — especially as the defense deadline approaches. This history gives the
student a continuous picture of their bimbingan progression alongside their
chapter and notulen history.

**Why this priority**: History adds continuity but is not required to deliver
the core value of receiving and preparing a single bimbingan agenda. It matters
once the student has several sessions and wants to track progression, so it is a
lower-priority slice on top of generation and tailoring.

**Independent Test**: Can be fully tested by a student receiving two agendas
(one scheduled, one on-demand) on different occasions, marking some points as
prepared, and confirming both appear in history with their dates, their
generation origin (scheduled or on-demand), and point statuses, and that the
older one is no longer current.

**Acceptance Scenarios**:

1. **Given** a student who has received more than one guidance agenda (by
   schedule or on demand), **When** they open the guidance history, **Then**
   they see every past agenda listed with its generation date, its origin
   (scheduled or on-demand), and the count of points it contained.
2. **Given** a student viewing the guidance history, **When** they open a past
   agenda, **Then** they see its discussion points with the statuses they had
   at the time (prepared or not) and the links to the chapters and notulen as
   they were recorded.
3. **Given** a student with multiple past agendas, **When** they compare two,
   **Then** they can identify discussion points that recur across agendas,
   signalling topics that remain unresolved across bimbingan sessions as the
   defense deadline approaches.

---

### Edge Cases

- What happens when the scheduled generation runs for a thesis that has chapters
  and a set defense deadline but no recorded notulen? The system still generates
  an agenda from the chapters, statuses, and the defense deadline, and notes
  that no prior supervision notes exist yet, so follow-up points could not be
  derived.
- What happens when the defense deadline is not set? The scheduled generation
  still runs from the notulen and chapters, but cannot apply deadline-aware
  prioritisation; the agenda nudges the student to set their defense deadline so
  future agendas can prioritise by remaining time.
- What happens when the defense deadline has already passed? The scheduled
  generation stops producing new agendas (or produces a single post-deadline
  note) and informs the student that the defense deadline has passed, so no
  further bimbingan preparation guidance is generated.
- What happens when all chapters are already in a final/approved state and no
  open notulen points remain? The agenda tells the student there is nothing
  pressing to bring to the dosen and suggests confirmation/final review points
  instead of fabricating issues.
- What happens when a chapter's Markdown content is empty (uploaded but
  conversion failed or pending)? The agenda relies on the chapter's status and
  notulen rather than its content, and flags that chapter as one the student
  should bring up because its content is not yet readable.
- What happens when the LLM analysis is slow or unavailable during a scheduled
  run? The system retries within the scheduled window and, on failure, leaves
  the previous current agenda intact and records a friendly note; it never
  stores a partial or corrupted agenda as current. On-demand failures surface
  immediately with a retry option.
- What happens when the scheduled generation runs again shortly after a prior
  run with no thesis or notulen changes in between? The system may skip
  regeneration to avoid redundant LLM work, leaving the existing current agenda
  in place.
- What happens when the scheduled generation time arrives while the student is
  actively tailoring the current agenda (it has edits since the last generation)?
  The system skips the automatic regeneration to preserve their in-progress work
  and shows a gentle prompt that newer guidance is available to adopt on demand,
  rather than overwriting the tailored agenda.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST have the LLM automatically generate a guidance agenda
  for a student's active thesis on a determined schedule, without the student
  triggering it.
- **FR-002**: System MUST also allow the student to request a guidance agenda
  generation on demand at any time, using the same inputs as a scheduled run.
- **FR-003**: System MUST derive the guidance agenda from the student's actual
  thesis state — the notulen recorded from previous bimbingan sessions, the
  set defense deadline and the remaining time to it, the chapters and their
  statuses, the Markdown content of current chapter versions, and the references
  attached to each chapter.
- **FR-004**: System MUST prioritise agenda discussion points by how much time
  remains before the defense deadline, surfacing the most urgent matters first
  as the deadline approaches. Prioritisation is by reordering only — every
  point MUST remain fully visible regardless of deadline proximity; points are
  never collapsed or hidden as the deadline nears.
- **FR-005**: System MUST surface open revision points from previous notulen as
  follow-up discussion points in the generated agenda.
- **FR-006**: System MUST link each generated discussion point to the chapter
  (and, where relevant, the notulen) it was derived from, and communicate the
  remaining time to the defense so the student understands the prioritisation.
- **FR-007**: System MUST generate an agenda from chapters, statuses, and the
  defense deadline even when no notulen exist yet, and note within the agenda
  that no prior supervision notes were available.
- **FR-008**: System MUST refuse to generate an agenda when the thesis has no
  chapters and instead leave a friendly note guiding the student to create and
  upload at least one chapter first.
- **FR-009**: When the defense deadline is not set, System MUST still generate
  an agenda from notulen and chapters but skip deadline-aware prioritisation and
  nudge the student to set their defense deadline.
- **FR-010**: When the defense deadline has passed, System MUST stop scheduled
  generation of new agendas and inform the student that the defense deadline has
  passed.
- **FR-011**: System MUST allow the student to remove a generated discussion
  point, mark a point as prepared, and add their own custom discussion point to
  the current agenda, with all edits persisted.
- **FR-012**: System MUST clearly distinguish student-added custom discussion
  points from system-generated points in the agenda view.
- **FR-013**: System MUST allow the student to request an on-demand regeneration;
  the fresh agenda becomes the current one and the previously current agenda is
  preserved in history with its timestamp.
- **FR-014**: System MUST keep a dated history of every generated guidance
  agenda, viewable by the student, with each agenda's generation origin
  (scheduled or on-demand) and its points' point-in-time statuses.
- **FR-015**: System MUST restrict all access — generation, tailoring, and
  history — to the owning student; a student can never read or manipulate
  another student's guidance agendas.
- **FR-016**: System MUST handle LLM analysis failures gracefully: on a failed
  scheduled run, leave the previous current agenda intact and record a friendly
  note; on a failed on-demand run, show a friendly retry immediately; and never
  store a partial or corrupted agenda as current.
- **FR-017**: Every create, update (tailor, mark, regenerate), and delete of a
  guidance agenda or its discussion points MUST produce a narrative activity log
  entry a human can read and understand without inspecting code or database rows.
- **FR-018**: When the current agenda has student edits (removed, marked, or
  added points) since the last generation, a scheduled generation MUST be
  skipped to preserve the student's in-progress work, and the student MUST be
  shown a gentle prompt that newer guidance is available to adopt on demand.
- **FR-019**: When a scheduled generation produces a new current agenda, the
  system MUST show a subtle unread indicator on the guidance section signalling
  a new agenda arrived since the student's last visit, and MUST clear that
  indicator once the student opens the guidance section.

### Key Entities *(include if feature involves data)*

- **SupervisionGuide**: A generated guidance agenda for one thesis, produced for
  a specific bimbingan session. Has a generation timestamp, a generation origin
  (scheduled or on-demand), a status (current or archived in history), the set
  of discussion points it contains, and belongs to exactly one thesis (and thus
  one student). Each scheduled run or on-demand request creates a new
  SupervisionGuide; the newest becomes current and prior ones are archived. The
  unread indicator is derived by comparing the current guide's generation
  timestamp against the student's last-viewed timestamp for the guidance
  section (a read tracking field, not an attribute of the guide itself).
- **GuidancePoint**: A single discussion point within a SupervisionGuide. Has a
  title, a short description/context, an origin (system-generated or
  student-added), a status (pending or prepared), a priority relative to the
  defense deadline, an optional link to the chapter it relates to, and an
  optional link to the notulen it derives from. Belongs to exactly one
  SupervisionGuide.
- **Defense Deadline (deadline sidang)**: The already-set date of the student's
  defense. It is part of the thesis state this feature reads (alongside chapters
  and notulen) to compute remaining time and prioritise agenda points. Whether
  it is stored as an attribute of the existing Thesis entity or a separate
  entity is a planning decision, not a spec decision.
- **Thesis, Chapter, Notulen, Reference**: Existing entities from the
  `002-thesis-chapter-management` feature. This feature reads them as inputs to
  guide generation and links generated points back to them; it does not modify
  them.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A student with an active thesis, at least one notulen, and a set
  defense deadline receives a freshly generated, source-linked guidance agenda
  automatically on each scheduled run, without taking any action.
- **SC-002**: At least 90% of generated agendas reference the student's actual
  chapters, statuses, and open notulen points, and prioritise points by the
  remaining time to the defense, rather than generic placeholders the student
  finds unhelpful.
- **SC-003**: A student can also generate an agenda on demand in under 30
  seconds on a typical connection and receive a structured list of concrete,
  source-linked discussion points.
- **SC-004**: A student can tailor an agenda — remove a point, mark a point as
  prepared, and add one custom point — in under 2 minutes total, with all edits
  persisting across reload.
- **SC-005**: 100% of students can only access, tailor, and view the history of
  their own guidance agendas; cross-student access is never possible.
- **SC-006**: Every create/update/delete of a guidance agenda or its points
  produces a narrative activity log entry a human can read and understand
  without inspecting code or database rows.
- **SC-007**: A student can open any past agenda from history and, within one
  view, see its discussion points with their point-in-time statuses, its
  generation origin (scheduled or on-demand), and links to the chapters and
  notulen as they were recorded.
- **SC-008**: When LLM analysis failure occurs during a scheduled run, the
  previous current agenda remains intact and the student sees a friendly note on
  next open; when it occurs during an on-demand run, the student sees a friendly
  retry option within the expected generation window. No partial or corrupted
  agenda is ever stored as current.

## Assumptions

- The authentication and role-based access control from the `001-user-auth`
  feature and the thesis/chapter/notulen/reference data model from the
  `002-thesis-chapter-management` feature already exist. This feature reads
  those entities as inputs and links generated points back to them; it does not
  modify them.
- Consistent with the `002` feature, the supervisor (dosen) has no access to
  this application. Bimbingan happens outside the tool; the student uses this
  feature to prepare what to bring to the dosen, then attends the session
  outside the tool. There is no supervisor actor in this feature. The phrase
  "dibimbingin ke dosen" is interpreted as the student seeking guidance from the
  dosen, so the feature produces a preparation agenda for the student, not a
  task list for the dosen.
- The student is treated as a single-actor owner of their thesis and its
  guidance agendas, mirroring the `002` assumption that the application is a
  student-only tool. How that maps to existing roles is a planning concern, not
  a spec concern.
- A student has exactly one active thesis at a time in the v1 scope, consistent
  with `002`; guidance agendas are scoped to that active thesis.
- The defense deadline (deadline sidang) is already determined and available as
  part of the thesis state before guidance generation runs. How and where the
  deadline is set and stored (e.g. an attribute of the existing Thesis entity,
  or a separate entity) is a planning decision, not a spec decision; this spec
  only requires that the generation can read it to compute remaining time and
  prioritise points, and behaves gracefully when it is unset or has passed.
- The LLM generates guidance automatically on a determined schedule. The exact
  cadence (e.g. a fixed recurring interval, a cadence that accelerates as the
  defense approaches, or a student-configurable schedule) and which specific LLM
  provider is used are planning/implementation decisions, not spec decisions.
  This spec only requires that scheduled generation happens without the student
  triggering it, that on-demand generation is also available, that agendas are
  derived from the real thesis state and notulen, and that failures are handled
  gracefully without corrupting data.
- Scheduled generation is a background process; the student sees its result the
  next time they open the guidance section. Real-time push notifications of a
  completed scheduled generation are out of scope for v1, but an in-app unread
  indicator signalling a new agenda arrived since the student's last visit is in
  scope (it is surfaced when the student is in the app, not pushed externally).
- Custom discussion points the student adds are free-text topics or questions;
  rich formatting (attachments, nested sub-points) is out of scope for v1.
- Guidance history retains past agendas with their point-in-time statuses and
  generation origin; deep analytics or trend reporting across many sessions is
  out of scope for v1 — only viewing and side-by-side comparison of past agendas
  is in scope.
- The agenda is a preparation aid for the next bimbingan; it does not schedule,
  notify, or communicate with the dosen. Communication and scheduling with the
  dosen happen outside the tool.