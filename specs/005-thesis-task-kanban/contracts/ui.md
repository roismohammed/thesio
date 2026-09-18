# UI Contract: Thesis Development Task Kanban

**Feature**: 005-thesis-task-kanban | **Date**: 2026-08-07

Designed with `/ui-ux-pro-max` (productivity, accessibility, horizontal-scroll
board, data-table-as-a11y-alternative) and polished with
`/make-interfaces-feel-better` (concentric radii, shadows-over-borders, staggered
entrance, subtle exits, tabular-nums, scale-on-press, interruptible transitions).
The project's existing Geist font and base-nova tokens are kept — no new palette
or font (Constitution Principle IV: no one-off styled duplicates).

Stack: React 19 + Tailwind v4 + shadcn base-nova on `@base-ui/react`, `motion` v12,
`@dnd-kit/core` + `@dnd-kit/sortable` (research.md D3), existing `components/datatable`
and `components/forms`. UI text: semi-formal friendly Indonesian. Dark-mode parity
on every surface.

---

## Route & page shell

**Route**: `/thesis/:thesisId/tasks` (added to `App.tsx` under `AuthGuard`).
**Page**: `features/thesis/pages/task-board/index.tsx` (≤ 300 lines — shell only;
all sections are partials).

**Breadcrumb** (Constitution Principle V, last item plain, others linked):
`Skripsi` (`/thesis`) → `<thesis title>` (`/thesis/:thesisId`) → `Papan Tugas` (plain).

**Layout** (top → bottom):
1. Page header: title `Papan Tugas` + subtitle + a view switch (Board | Daftar)
   using base-nova `ToggleGroup`/`Tabs`. Active state highlighted per
   ui-ux-pro-max `active-state` guideline (`text-primary border-b-2`, not same-style links).
2. `progress-overview.tsx` — a slim stats row (per-stage counts + completion %
   + time-to-defense). Always visible above the board/list.
3. Primary toolbar: "Tugas baru" button (primary, scale-on-press) +
   "Sarankan dari notulen" button (secondary) + (board view only) board
   filters. Uses the existing `DataTable` toolbar slot pattern in list view.
4. Content area: `board-view.tsx` (default) or `task-list-view.tsx`.

---

## Board view (`board-view.tsx` + `board-column.tsx`)

**Pattern**: horizontal-scroll four-column board (ui-ux-pro-max "Horizontal Scroll
Journey" fits Kanban — keep nav visible, immersive scan). On `< lg` screens columns
scroll horizontally with a sticky stage header; on `≥ lg` all four columns share the
viewport when space allows. No horizontal page scroll (ui-ux-pro-max
`horizontal-scroll` guideline).

**Column anatomy** (`board-column.tsx`):
- Header row: stage label + task count (`tabular-nums`, ui-ux-pro-max / polish
  skill #9 to prevent layout shift as counts change) + a subtle add (`+`) button
  that opens `task-form-dialog.tsx` pre-set to this stage.
- Column body: a `@dnd-kit` droppable area. Empty column shows a faint "Tarik
  tugas ke sini" placeholder (empty-state guideline: guide, never blank).
- Drop indicator: a 2px token-colored line that animates in (`motion`, opacity +
  scaleY, `ease-out` 150ms) where the card will land — never a jarring full-height
  box (polish: subtle, transform/opacity only).
- Column z-index within a defined scale (ui-ux-pro-max `z-index-management`:
  10/20/30/50; dragging card gets `z-50`, columns `z-10`).

**Card anatomy** (`task-card.tsx` — feature-shared, in
`features/thesis/components/`):
- Surface: base-nova `Card`, radius concentric with the column padding (polish #1:
  outer = inner + padding). Shadow over border (polish #3): layered transparent
  `box-shadow` for depth, not a hard border — adapts to dark mode.
- Hover/active: `transition-colors` (200ms) to a slightly elevated surface; never
  a scale transform that shifts layout (ui-ux-pro-max `stable-hover`). Cursor
  `pointer` on the whole card (ui-ux-pro-max `cursor-pointer`). Drag handle
  (`GripVertical` lucide icon) with a 40×40px hit area (polish #16: dense desktop
  ≥ 40px; extend with pseudo-element if needed).
- Title: one line, `text-wrap: balance` (polish #10); truncated with `…` and
  revealed fully on card open (spec edge case).
- Badge row (below title, wrap): `task-priority-badge.tsx` (high priority =
  distinct destructive/primary token dot, never color-only — ui-ux-pro-max
  `color-contrast` + "color is not the only indicator"), `task-due-badge.tsx`
  (due-soon = amber token; overdue = destructive token + icon, only when
  stage ≠ done — research.md D5), `task-link-badge.tsx` (chapter icon / notulen
  icon linking to the origin route in ≤2 interactions, SC-004).
- Footer: a "Pindah ke" `DropdownMenu` (move to stage) — the accessible, no-DnD
  fallback (research.md D3) — plus an edit (`Pencil`) and delete (`Trash2`) action,
  each ≥ 40×40px hit area. Delete opens a confirm dialog (spec FR-004).
- Entrance: staggered via `motion` (`initial={false}` on the board's
  `AnimatePresence` so no animation plays on first load — polish #13), ~100ms per
  card, opacity + translateY(8px→0), `ease-out`, respects `prefers-reduced-motion`.

**Interaction**:
- Drag a card across/within columns → `PATCH /tasks/{task}/move` (contracts/api.md
  §5). Drop animation via `motion` spring `duration: 0.3, bounce: 0` (polish #7).
- Keyboard: `@dnd-kit` `KeyboardSensor` — Space to grab, arrows to move, Space to
  drop (ui-ux-pro-max CRITICAL `keyboard-nav`). Visible focus ring on the drag
  handle (ui-ux-pro-max `focus-states`).
- After a successful move/delete, the board state is the hook's optimistic source
  of truth; a refetch reconciles. `useFormSubmit`/`toast` plumbing is reused for
  errors (existing `components/forms` + `components/ui/toast`).

---

## List view (`task-list-view.tsx`)

The accessibility-required table alternative (ui-ux-pro-max `data-table` guideline)
and the user-mandated reuse of `components/datatable`.

- Built on `DataTable` (`@/components/datatable/data-table.tsx`) with
  `ColumnDef`s: title, stage (badge), priority, due date (with overdue/due-soon
  tint via cell renderer), links (chapter/notulen icons), and a row-actions cell
  (edit / move-to / delete).
- Server pagination is **not** used (a board has tens-to-low-hundreds of rows);
  `DataTable` client pagination (`DataTablePagination`) is reused as-is.
- Sorting on title / priority / due date via the existing `DataTableColumnHeader`.
- The same `task-form-dialog.tsx` / confirm-delete dialog are reused for row
  actions — no second set of forms.

---

## Forms & dialogs (reuse `components/forms`)

All dialogs use the existing `Form` + `Field` components + `useFormSubmit` +
`zod` schemas, exactly like `add-point-form.tsx`. Each is a base-nova `Dialog`
with `motion` enter/exit (subtle `translateY` exit, polish #6; scale-in enter
`ease-out` 200ms). `AnimatePresence` with `initial={false}` on the dialog host so
default-state dialogs do not animate on first mount (polish #13).

### `task-form-dialog.tsx` — create / edit (≤ 5 fields → modal, Constitution V)
Fields: `title` (TextField, required), `description` (TextareaField, optional),
`stage` (SelectField: Todo/In Progress/Review/Done), `priority` (SelectField or
number, optional), `due_date` (date field, optional). Five fields — modal is
allowed. On create, opens pre-set to a stage when launched from a column `+`.
Validation via `zod` mirroring the server `StoreTaskRequest`.

### `link-task-dialog.tsx` — link to chapter / notulen (separate, spec SC-004)
Two `ComboboxField`s: chapter (from the thesis's chapters) and supervision note
(from the thesis's notulen). Either/both nullable. Kept out of the create form so
the create modal stays ≤ 5 fields. Reachable from a card's "Tautkan" action.

### `suggest-tasks-dialog.tsx` — LLM suggestion review (US5)
- Trigger: "Sarankan dari notulen" → choose a notulen (`ComboboxField`) →
  `POST /tasks/suggestions` with a loading state (skeleton, ui-ux-pro-max
  `loading-states`; button disabled while pending — ui-ux-pro-max
  `loading-buttons`).
- Results: a list of suggestion rows, each showing title + description + proposed
  priority + link chips + a `duplicates_task_id` warning ("Sudah ada tugas
  mirip") when set (spec edge case). Per row: "Terima" (primary, creates the task
  via the normal create endpoint, pre-filling `task-form-dialog.tsx` for an
  optional edit) and "Tutup" (dismiss). Batch "Terima semua" optional.
- Failure: friendly inline error + retry (spec edge case); the notulen and board
  are untouched.
- Empty: "Tidak ada hal yang bisa ditindaklanjuti dari notulen ini." (spec edge
  case — never fabricate tasks).

---

## Progress overview (`progress-overview.tsx`)

A slim, dense stats row (Linear/ERPNext feel, Constitution IV):
- Four stage-count chips (Todo / In Progress / Review / Done) with `tabular-nums`.
- Completion % as a thin progress bar (token colors; `transform: scaleX` only,
  polish #14 — no `transition: all`) or a ring; the number uses `tabular-nums`.
- Time-to-defense: "X hari menuju sidang" pulled from `defense_remaining_days`
  (contracts/api.md §1); "Deadline sidang belum ditetapkan" when null (spec
  acceptance: empty state guidance, not zeros).
- Empty board: a friendly empty state inviting the first task (spec US4
  acceptance 3) rather than zero counts.

---

## Empty & error states (ui-ux-pro-max `empty-state`, `error-feedback`)

- **Empty board**: a centered illustration-free empty state (no emoji icons —
  ui-ux-pro-max `no-emoji-icons`; lucide icon only) with a single primary CTA
  "Buat tugas pertama" and a secondary "Sarankan dari notulen" if a notulen exists.
- **Error loading/mutating**: inline `text-destructive` message near the relevant
  surface + a toast via the existing `toast` (reused, not re-invented).
- **LLM failure**: inline retry in `suggest-tasks-dialog.tsx`; no global error.

---

## Accessibility & motion checklist (from both skills)

- [ ] No emoji icons — lucide only (ui-ux-pro-max).
- [ ] `cursor-pointer` on every interactive card/button (ui-ux-pro-max).
- [ ] Visible focus rings, tab order matches visual order (ui-ux-pro-max CRITICAL).
- [ ] `@dnd-kit` keyboard sensor for drag; move-to dropdown as fallback (D3).
- [ ] `prefers-reduced-motion` honored — motion disabled → instant transitions.
- [ ] No `transition: all`; only `transform`/`opacity` animate (polish #14).
- [ ] Nested radii concentric (polish #1); shadows over hard borders (polish #3).
- [ ] Counts/percent use `tabular-nums` (polish #9).
- [ ] Buttons use `active:scale-[0.96]` (polish #12); never below 0.95.
- [ ] `AnimatePresence` uses `initial={false}` for default-state dialogs (polish #13).
- [ ] Color is never the only indicator (priority/overdue also use icon/label).
- [ ] Responsive at 375 / 768 / 1024 / 1440; no horizontal page scroll.
- [ ] Dark-mode parity on every surface via tokens.

---

## File-size & placement compliance (Constitution V)

- Each file ≤ 300 lines; page shell `index.tsx` composes partials only.
- Page-specific sections live in `pages/task-board/partials/` (board-view,
  board-column, task-list-view, the dialogs, progress-overview,
  board-empty-state) — never imported by other pages.
- Feature-shared `task-card.tsx` + the three badge components live in
  `features/thesis/components/` (consumed by both board and list views).
- Nothing is added to project-wide `src/components/ui/` — no component here is
  generic enough to be cross-feature.