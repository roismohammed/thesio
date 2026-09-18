# Tasks: Supervision Guidance for Bimbingan Preparation

**Input**: Design documents from `/specs/003-supervision-guide/`

**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/api.md, contracts/llm.md, quickstart.md, `.specify/memory/constitution.md`

**Tests**: None. Per project CLAUDE.md there are no automated tests in this project; validation is via `php -l`, `npx tsc --noEmit --incremental`, `vendor/bin/pint`, and the manual `quickstart.md` scenarios. Do NOT generate PHPUnit/Pest/vitest tasks.

**Organization**: Tasks grouped by user story so each story can be implemented and validated independently. Backend follows `Controller -> Service -> Action` (constitution I-II); every mutation logs a narrative `activity('thesis')` entry (constitution III); frontend is feature-based with page-specific partials under `pages/supervision-guide/partials/` (constitution V). PHP class <=300 lines, method <=100 lines; React component file <=300 lines.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[Story]**: Which user story this task belongs to (US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- Backend: `apps/api/app/...`, `apps/api/database/migrations/`, `apps/api/routes/`, `apps/api/config/`
- Frontend: `apps/web/src/...`
- PHP class files PascalCase; migrations/routes/config snake_case; JS/TS kebab-case; SQL snake_case.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Config, env, and i18n scaffolding for the guidance feature. No runtime code yet.

^- [X] T001 [P] Add `guidance` schedule config block to `apps/api/config/openai.php` — new key `guidance.schedule` default `'0 8 * * 1'` (Monday 08:00 weekly, per research.md D3); reuse existing `llm_model` and `request_timeout` keys (no new LLM dependency).
^- [X] T002 [P] Add OpenRouter LLM env keys to `apps/api/.env.example` — `LLM_BASE_URL=https://openrouter.ai/api/v1`, `LLM_API_KEY=`, `LLM_MODEL=`, `LLM_REQUEST_TIMEOUT=30` (per research.md D1).
^- [X] T003 [P] Add guidance i18n keys to `apps/web/src/i18n/locales/en/thesis.json` and `apps/web/src/i18n/locales/id/thesis.json` — covers all three stories' UI text (nav label, breadcrumb, page title, empty states, deadline-remaining badge, unread indicator, regenerate/add/remove/mark-prepared buttons, "sedang disesuaikan" hint, "Ada panduan terbaru" prompt, history labels, failure messages). Identifiers stay English; values semi-formal friendly Indonesian in the `id` locale.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Schema, models, policies, and the shared thesis defense-deadline extension that ALL user stories depend on.

**CRITICAL**: No user story work can begin until this phase is complete.

^- [X] T004 [P] Create migration `apps/api/database/migrations/2026_08_06_000001_add_defense_deadline_and_guidance_tracking_to_theses_table.php` — add nullable timestamps `defense_deadline_at`, `guidance_last_viewed_at` to `theses` (additive, no data migration).
^- [X] T005 [P] Create migration `apps/api/database/migrations/2026_08_06_000002_create_supervision_guides_table.php` — `id`, `thesis_id` foreignId cascadeOnDelete, `origin` string(20), `status` string(20) default `'current'`, `is_tailored` boolean default false, `generated_at` timestamp, timestamps; index on `(thesis_id, status)`.
^- [X] T006 [P] Create migration `apps/api/database/migrations/2026_08_06_000003_create_guidance_points_table.php` — `id`, `supervision_guide_id` foreignId cascadeOnDelete, `origin` string(20), `title` string(255), `description` text nullable, `status` string(20) default `'pending'`, `priority` integer default 999, `chapter_id` foreignId nullOnDelete, `supervision_note_id` foreignId nullOnDelete, timestamps; indexes on `supervision_guide_id` and `(supervision_guide_id, priority)`.
^- [X] T007 [P] Extend `apps/api/app/Models/Thesis.php` — add `defense_deadline_at`, `guidance_last_viewed_at` to `$fillable`; add casts `'defense_deadline_at' => 'datetime'`, `'guidance_last_viewed_at' => 'datetime'`; add `supervisionGuides(): HasMany` relation ordered by `generated_at` desc.
^- [X] T008 [P] Create `apps/api/app/Models/SupervisionGuide.php` — `$fillable = ['thesis_id','origin','status','is_tailored','generated_at']`; casts `'is_tailored' => 'boolean'`, `'generated_at' => 'datetime'`; `booted()` adds `OwnedByUserScope('thesis.user_id')` (same pattern as `Chapter`); relations `thesis(): BelongsTo`, `points(): HasMany` ordered by `priority` asc; helper `markTailored()` sets `is_tailored = true`.
^- [X] T009 [P] Create `apps/api/app/Models/GuidancePoint.php` — `$fillable = ['supervision_guide_id','origin','title','description','status','priority','chapter_id','supervision_note_id']`; cast `'priority' => 'integer'`; NO global ownership scope (accessed through scoped parent guide); relations `supervisionGuide(): BelongsTo`, `chapter(): BelongsTo` (optional), `supervisionNote(): BelongsTo` (optional).
^- [X] T010 [P] Create `apps/api/app/Policies/SupervisionGuidePolicy.php` — `view(User, SupervisionGuide): bool` and `update(User, SupervisionGuide): bool` resolving `$user->is($guide->thesis->user)`.
^- [X] T011 [P] Create `apps/api/app/Policies/GuidancePointPolicy.php` — `view`/`update` resolving `$user->is($point->supervisionGuide->thesis->user)`.
^- [X] T012 Extend `apps/api/app/Http/Requests/Thesis/UpdateThesisRequest.php` — add `'defense_deadline_at' => ['sometimes', 'nullable', 'date', 'after:today']` to rules (existing title/status rules unchanged).
^- [X] T013 Extend `apps/api/app/Actions/Thesis/UpdateThesisAction.php` — persist `defense_deadline_at` (fill from `$data['defense_deadline_at']` when present; leave existing title/status logic intact).
^- [X] T014 Extend `apps/api/app/Services/Thesis/ThesisService.php` `update()` — when `defense_deadline_at` changed/added, append a narrative `activity('thesis')` log "Menetapkan deadline sidang skripsi '{title}' pada {date}." (per data-model.md activity log targets); keep existing title-change log.
^- [X] T015 Extend `apps/api/app/Http/Controllers/Thesis/ThesisController.php` `serialize()` — include `defense_deadline_at` and `guidance_last_viewed_at` (iso8601, nullable) in the thesis payload.

**Checkpoint**: Migrations apply cleanly (`php artisan migrate`), models + scopes resolve ownership, and a student can set a defense deadline via the existing thesis update endpoint (quickstart Scenario 1). User story implementation can now begin.

---

## Phase 3: User Story 1 - System Auto-Generates a Bimbingan Guidance Agenda (Priority: P1) MVP

**Goal**: The LLM generates a deadline-aware, source-linked guidance agenda from the student's notulen, defense deadline, chapters, statuses, and references — automatically on a weekly schedule and on demand — and stores it as the current guidance the student can view.

**Independent Test**: A student with an active thesis (>=1 chapter, >=1 notulen, set defense deadline) triggers an on-demand generation (or runs `php artisan guidance:generate-scheduled`) and confirms the agenda lists concrete, source-linked discussion points prioritised by remaining time to the defense; opening the guidance section shows the agenda as current. Edge cases (no notulen, no chapters, LLM failure, deadline passed, skip-if-tailored) behave per spec acceptance scenarios 1-8.

### Implementation for User Story 1

^- [X] T016 [P] [US1] Create `apps/api/app/Services/Thesis/GuidanceLlmClient.php` — infra Service (external API, per constitution I). Assembles the user-content context JSON from thesis state: `thesis_title`, `defense_deadline_at`, `defense_remaining_days`, `deadline_set`, `chapters` (id/title/status/has_readable_content from `currentVersion.markdown_content` non-empty), `notulen` (id/chapter_id/content truncated to ~2000 chars/created_at), `previous_open_points`. Calls `OpenAI::chat()->create([...])` with `response_format => ['type' => 'json_object']`, the fixed Indonesian system prompt from `contracts/llm.md`, `model` from `config('openai.llm_model')`. Parses `choices[0].message->content` as JSON, validates the `{points:[...]}` schema, drops any `chapter_id`/`supervision_note_id` not belonging to the thesis to `null`, normalises priority by re-sorting asc and assigning stable 1..N. Returns the validated points array; throws on HTTP/timeout/parse/schema failure (no partial result). Empty `points` is a valid success.
^- [X] T017 [P] [US1] Create `apps/api/app/Http/Requests/Thesis/GenerateSupervisionGuideRequest.php` — no body rules; `authorize()` delegates to `view` thesis policy.
^- [X] T018 [P] [US1] Create `apps/api/app/Http/Resources/Thesis/SupervisionGuideResource.php` — renders `id`, `thesis_id`, `origin`, `status`, `is_tailored`, `generated_at`, `defense_deadline_at`, `defense_remaining_days` (computed from `thesis.defense_deadline_at` vs now, null when deadline unset), `is_unread` (true when `generated_at > thesis.guidance_last_viewed_at`), and `points` via `GuidancePointResource`.
^- [X] T019 [P] [US1] Create `apps/api/app/Http/Resources/Thesis/GuidancePointResource.php` — renders `id`, `origin`, `title`, `description`, `status`, `priority`, `chapter_id`, `supervision_note_id`.
^- [X] T020 [US1] Create `apps/api/app/Actions/Thesis/CreateSupervisionGuideAction.php` — one use case: archive the prior current guide (`status='archived'`) then create the new guide as `current` with the LLM-produced system points, all inside a single DB transaction. Calls `GuidanceLlmClient` (infra Service, permitted in an Action per constitution I — external API is Service territory, not a domain Service) to obtain points; on LLM/parse failure throws without persisting (no partial guide stored, FR-016). Sets `origin`, `generated_at = now`. Keeps within method/class size limits (prompt assembly stays in `GuidanceLlmClient`).
^- [X] T021 [US1] Create `apps/api/app/Services/Thesis/SupervisionGuideService.php` — orchestrates generation. `generateOnDemand(Thesis $thesis)`: guard no-chapters -> throw a domain exception with message "Buat dan unggah minimal satu bab sebelum membuat agenda bimbingan." (422); call `CreateSupervisionGuideAction`; on success log narrative "Membuat agenda bimbingan atas permintaan untuk skripsi '{title}' — {n} poin diskusi."; on `GuidanceLlmClient` failure catch, log "Gagal membuat agenda bimbingan untuk skripsi '{title}'. Agenda sebelumnya tetap digunakan.", leave previous current intact, and rethrow as a 422-domain failure. `generateScheduled(Thesis $thesis)`: guards no-chapters (skip), deadline passed (skip, log "deadline sidang telah terlewati"), current guide `is_tailored` (skip-if-tailored, FR-018, log "dilewati karena sedang disesuaikan"); otherwise call action, log "Membuat agenda bimbingan otomatis untuk skripsi '{title}' — {n} poin diskusi, deadline sidang {deadline}." or failure note. Also `getCurrent(Thesis)`, `markViewed(Thesis)` (sets `guidance_last_viewed_at = now`), and a `previousOpenPoints(Thesis)` helper (prior guides' points never marked `prepared`, for cross-session continuity context).
^- [X] T022 [US1] Create `apps/api/app/Http/Controllers/Thesis/SupervisionGuideController.php` — `current(Thesis)`: authorize `view`, load current guide, build `SupervisionGuideResource` (computes `is_unread` from pre-update timestamps), then call `markViewed`; return `200` with `data: null` when no current guide. `store(GenerateSupervisionGuideRequest, Thesis)`: authorize `view`, call `generateOnDemand`; on domain-failure return `422 {message}` (no-chapters message or "Gagal membuat agenda bimbingan. Silakan coba lagi."); on success return `201` with the new guide resource. Controller only parses HTTP + authorizes + delegates (no business logic).
^- [X] T023 [US1] Add supervision-guide generation routes to `apps/api/routes/thesis.php` — `GET thesis/{thesis}/supervision-guides/current` and `POST thesis/{thesis}/supervision-guides` inside the existing `['web','auth'] api-prefixed group.
^- [X] T024 [US1] Create `apps/api/app/Console/Commands/GenerateScheduledSupervisionGuides.php` — Artisan command `guidance:generate-scheduled`; injects `SupervisionGuideService`; loops theses with `>=1 chapter` and a future `defense_deadline_at` (deadline-passed guard lives in the service), calling `generateScheduled($thesis)` per thesis inside a per-thesis try/catch so one failure does not abort the batch (FR-016); sync execution in v1.
^- [X] T025 [US1] Register the scheduled command in `apps/api/routes/console.php` — `Schedule::command('guidance:generate-scheduled')->cron(config('openai.guidance.schedule'))` (per research.md D7).
^- [X] T026 [P] [US1] Add `SupervisionGuide` and `GuidancePoint` interfaces to `apps/web/src/features/thesis/types.ts` — fields matching the resources (incl. `origin`, `status`, `is_tailored`, `generated_at`, `defense_deadline_at`, `defense_remaining_days`, `is_unread`, `points`).
^- [X] T027 [P] [US1] Create `apps/web/src/features/thesis/api/supervision-guide.ts` — `getCurrent(thesisId)` and `generate(thesisId)` using the existing `@/lib/api` helper (mirrors `api/thesis.ts` patterns); point/history methods are added in US2/US3.
^- [X] T028 [P] [US1] Create `apps/web/src/features/thesis/hooks/use-supervision-guide.ts` — `useSupervisionGuide(thesisId)`: load current guide, on-demand `generate()` action, `loading`/`error` state, and unread handling (mirrors `use-paraphrase.ts` shape). Tailoring/history handlers are added in US2/US3.
^- [X] T029 [US1] Add route `/thesis/:thesisId/guidance` to `apps/web/src/App.tsx` — under the authenticated `AppLayout` group, rendering `GuidancePage` (lazy import).
^- [X] T030 [US1] Create `apps/web/src/features/thesis/pages/supervision-guide/index.tsx` — `GuidancePage` (<=300 lines): breadcrumb `Skripsi > Bimbingan > Panduan` (last item plain text, parents link to `/thesis` and `/thesis/:thesisId`); composes `guide-header`, `guide-empty-state`, and the current agenda list of `guidance-point-item`s; fetches via `useSupervisionGuide`. Uses i18n keys from T003.
^- [X] T031 [P] [US1] Create `apps/web/src/features/thesis/pages/supervision-guide/partials/guide-header.tsx` — deadline-remaining badge ("sisa waktu menuju sidang: N hari"), unread indicator, and "Buat agenda sekarang"/"Buat ulang" regenerate button calling the hook's `generate`.
^- [X] T032 [P] [US1] Create `apps/web/src/features/thesis/pages/supervision-guide/partials/guide-empty-state.tsx` — friendly empty states for no-current-guide (on-demand CTA), no-chapters ("Buat dan unggah minimal satu bab dulu"), and deadline-not-set nudge.
^- [X] T033 [P] [US1] Create `apps/web/src/features/thesis/pages/supervision-guide/partials/guidance-point-item.tsx` — display a point row: title, description, source-link badge (chapter and/or notulen), `system`/`student` origin distinction, and `pending`/`prepared` status pill; accepts a `readOnly` prop (used later by history). Tailoring action controls are added in US2.
^- [X] T034 [US1] Add guidance navigation entry to `apps/web/src/components/layout/nav-config.tsx` and a "Panduan" link on the thesis detail page `apps/web/src/features/thesis/pages/thesis/detail.tsx` (link to `/thesis/:thesisId/guidance`); wire the unread indicator into the nav entry. Reconcile with any in-progress changes already present in these files.

**Checkpoint**: US1 fully functional — on-demand generation returns a source-linked, deadline-prioritised agenda within ~30s (SC-003); `php artisan guidance:generate-scheduled` archives the prior current and creates a new one for eligible theses (quickstart Scenario 4 Case A/C); no-chapters/LLM-failure/deadline-passed/skip-if-tailored behave per spec; ownership enforced (403 cross-student). The student sees the agenda as current with a deadline-remaining badge and (once) an unread indicator.

---

## Phase 4: User Story 2 - Student Reviews and Tailors the Guidance Agenda (Priority: P2)

**Goal**: The student can remove a generated point, mark a point as prepared, and add their own custom discussion point, with all edits persisted; the agenda is clearly distinguishable between system and student points and marked "sedang disesuaikan" once tailored. An on-demand regeneration produces a fresh current agenda while preserving the previous one in history.

**Independent Test**: A student opens a generated agenda, removes one point, marks another as prepared, adds a custom point, reloads, and confirms all edits persist with the custom point visually distinct; the guide shows a "sedang disesuaikan" hint. (Requires a current guide from US1 to tailor.)

### Implementation for User Story 2

^- [X] T035 [P] [US2] Create `apps/api/app/Http/Requests/Thesis/StoreGuidancePointRequest.php` — `title` required string max 255; `description` nullable string; `chapter_id` nullable exists:`chapters,id` and must belong to the thesis; `supervision_note_id` nullable exists:`supervision_notes,id` and must belong to the thesis; `authorize()` delegates to `update` thesis policy. `origin` forced `'student'`, `status` forced `'pending'`, `priority` forced `999` (set in the Action, not from request).
^- [X] T036 [P] [US2] Create `apps/api/app/Http/Requests/Thesis/UpdateGuidancePointRequest.php` — `status` nullable in `['pending','prepared']`; `title` nullable string max 255; `description` nullable string; `authorize()` delegates to `update` thesis policy. System-point title/description edits are rejected in the Action/Policy (only status + delete allowed for `origin='system'`).
^- [X] T037 [P] [US2] Create `apps/api/app/Actions/Thesis/AddGuidancePointAction.php` — create a `GuidancePoint` with `origin='student'`, `status='pending'`, `priority=999` on the given guide; flip `guide.is_tailored = true` via `markTailored()`. No activity log (logged in the Service, per existing `ThesisService` pattern).
^- [X] T038 [P] [US2] Create `apps/api/app/Actions/Thesis/UpdateGuidancePointAction.php` — update `status` and, only when `point.origin === 'student'`, `title`/`description`; reject title/description edits for `origin='system'` points (throw domain exception). Flip `guide.is_tailored = true`. No activity log.
^- [X] T039 [P] [US2] Create `apps/api/app/Actions/Thesis/DeleteGuidancePointAction.php` — delete the point; flip `guide.is_tailored = true`. No activity log.
^- [X] T040 [US2] Extend `apps/api/app/Services/Thesis/SupervisionGuideService.php` — `addPoint(Thesis, SupervisionGuide, array $data)` -> `AddGuidancePointAction` then narrative log "Menambahkan poin bimbingan '{title}' pada agenda skripsi '{thesis}'."; `updatePoint(Thesis, GuidancePoint, array $data)` -> `UpdateGuidancePointAction` then log (when status becomes prepared: "Menandai poin bimbingan '{title}' sebagai siap dibawa ke dosen."); `deletePoint(Thesis, GuidancePoint)` -> `DeleteGuidancePointAction` then log "Menghapus poin bimbingan '{title}' dari agenda.". All logs `activity('thesis')` `performedOn($guide)`.
^- [X] T041 [US2] Extend `apps/api/app/Http/Controllers/Thesis/SupervisionGuideController.php` — `storePoint(StoreGuidancePointRequest, Thesis, SupervisionGuide)` authorize `update`, return `201` with `GuidancePointResource`; `updatePoint(UpdateGuidancePointRequest, Thesis, SupervisionGuide, GuidancePoint)` authorize `update`, return `200` with resource; `destroyPoint(Thesis, SupervisionGuide, GuidancePoint)` authorize `update`, return `204`. Route binding resolves the point through the scoped guide.
^- [X] T042 [US2] Add guidance point routes to `apps/api/routes/thesis.php` — `POST thesis/{thesis}/supervision-guides/{guide}/points`, `PATCH thesis/{thesis}/supervision-guides/{guide}/points/{point}`, `DELETE thesis/{thesis}/supervision-guides/{guide}/points/{point}`.
^- [X] T043 [P] [US2] Extend `apps/web/src/features/thesis/api/supervision-guide.ts` — `addPoint(thesisId, guideId, body)`, `updatePoint(thesisId, guideId, pointId, body)`, `deletePoint(thesisId, guideId, pointId)`.
^- [X] T044 [P] [US2] Extend `apps/web/src/features/thesis/hooks/use-supervision-guide.ts` — `addPoint`, `markPrepared`/`unmarkPrepared` (toggle status), `removePoint` handlers with optimistic state updates and friendly error surfacing.
^- [X] T045 [US2] Extend `apps/web/src/features/thesis/pages/supervision-guide/partials/guidance-point-item.tsx` — add status toggle (mark/unmark prepared), remove button, and clear system-vs-student visual distinction; keep the `readOnly` prop for history reuse.
^- [X] T046 [US2] Create `apps/web/src/features/thesis/pages/supervision-guide/partials/add-point-form.tsx` — custom-point form: `title` input, optional `description` textarea, optional `chapter_id` select (chapters of the thesis); submit via `addPoint`; inline validation.
^- [X] T047 [US2] Extend `apps/web/src/features/thesis/pages/supervision-guide/index.tsx` — wire the `add-point-form` and tailoring action callbacks; show a "sedang disesuaikan" hint when `is_tailored`; when the current guide is tailored and the last generation predates the schedule window, show the "Ada panduan terbaru yang bisa kamu terapkan" prompt with a Regenerate action (per research.md D6).

**Checkpoint**: US2 fully functional — tailoring (remove, mark prepared, add custom point) persists across reload (SC-004), custom points are visually distinct (FR-012), `is_tailored` flips true, and on-demand regeneration creates a fresh current agenda while archiving the previous (FR-013).

---

## Phase 5: User Story 3 - Student Tracks Bimbingan Guidance History (Priority: P3)

**Goal**: Every generated agenda (scheduled or on-demand) is dated and kept in a viewable history; the student can open a past agenda, see its points' point-in-time statuses and source links, and compare agendas to spot recurring/unresolved topics as the defense approaches.

**Independent Test**: A student receives two agendas (one scheduled, one on-demand) on different occasions, marks some points prepared, and confirms both appear in history with their dates, generation origin, and point statuses, and that the older one is no longer current (quickstart Scenario 8).

### Implementation for User Story 3

^- [X] T048 [US3] Extend `apps/api/app/Http/Controllers/Thesis/SupervisionGuideController.php` — `index(Thesis)`: authorize `view`, return history list (archived + current, newest first) as `{id, origin, status, is_tailored, generated_at, points_count, prepared_count}`. `show(Thesis, SupervisionGuide)`: authorize `view`, return the full guide via `SupervisionGuideResource` (point-in-time statuses + source links) WITHOUT the markViewed side effect.
^- [X] T049 [US3] Add history routes to `apps/api/routes/thesis.php` — `GET thesis/{thesis}/supervision-guides` (index) and `GET thesis/{thesis}/supervision-guides/{guide}` (show).
^- [X] T050 [P] [US3] Extend `apps/web/src/features/thesis/api/supervision-guide.ts` — `listHistory(thesisId)` and `showGuide(thesisId, guideId)`.
^- [X] T051 [P] [US3] Extend `apps/web/src/features/thesis/hooks/use-supervision-guide.ts` — `loadHistory()` and `selectPastGuide(guideId)` state.
^- [X] T052 [P] [US3] Create `apps/web/src/features/thesis/pages/supervision-guide/partials/history-list.tsx` — list past agendas with generation date, origin badge (scheduled/on-demand), and point counts; click opens the detail.
^- [X] T053 [P] [US3] Create `apps/web/src/features/thesis/pages/supervision-guide/partials/history-detail.tsx` — read-only past agenda: points with their point-in-time statuses and source links, rendered via the `readOnly` mode of `guidance-point-item`; highlights discussion points that recur across agendas (unresolved-topic signal).
^- [X] T054 [US3] Extend `apps/web/src/features/thesis/pages/supervision-guide/index.tsx` — add the history section/tab wiring (list + detail) so the page stays <=300 lines.

**Checkpoint**: All three user stories independently functional. History shows every past agenda with date, origin, and point-in-time statuses; recurring points are identifiable (FR-014, SC-007).

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Objective checks and manual validation across all stories. Per project policy, run these yourself (the agent does not start dev/build servers).

^- [X] T055 [P] Run `php -l` on every new PHP file in `apps/api/app/{Models,Actions/Thesis,Services/Thesis,Http/Controllers/Thesis,Http/Requests/Thesis,Http/Resources/Thesis,Policies,Console/Commands}`.
^- [X] T056 [P] Run `vendor/bin/pint` from `apps/api` to format all new PHP files.
^- [X] T057 [P] Run `npx tsc --noEmit --incremental` from `apps/web` to verify TypeScript types (no `any`, `import type` for type-only imports per `verbatimModuleSyntax`).
^- [X] T058 Run the manual validation scenarios in `specs/003-supervision-guide/quickstart.md` (Scenarios 1-8 + edge cases) against running `apps/api` (`composer run dev`) and `apps/web` (`bun run dev`), started by you.
^- [X] T059 [P] Verify ownership isolation per quickstart "Ownership check" — a student B cannot `GET /api/thesis/{A}/supervision-guides/current` or touch A's points (403 / not found via `OwnedByUserScope` + policies).

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately.
- **Foundational (Phase 2)**: Depends on Setup (config/env/i18n scaffolding) — BLOCKS all user stories.
- **User Stories (Phase 3-5)**: All depend on Foundational completion.
  - US1 (Phase 3): can start after Foundational; no dependency on other stories.
  - US2 (Phase 4): can start after Foundational; its independent test consumes a current guide produced by US1, so implement US1 first for end-to-end validation. Backend point CRUD (T035-T042) is buildable in parallel with US1's backend since it only depends on the Foundational models/policies.
  - US3 (Phase 5): can start after Foundational; its independent test needs >=2 agendas, so it naturally follows US1+US2.
- **Polish (Phase 6)**: depends on all desired user stories being complete.

### User Story Dependencies

- **US1 (P1)**: Foundational only. MVP slice.
- **US2 (P2)**: Foundational + US1's current-guide output for validation; backend tailoring Actions/Controller/Routes are independent of US1 code.
- **US3 (P3)**: Foundational + US1's generation (produces history entries) for validation; backend history endpoints are independent of US2.

### Within Each User Story

- Migrations/models before Actions; LLM client (infra Service) before the create Action; Actions before the orchestrating Service; Service before Controller; Controller before routes; backend before the frontend that calls it; types/api before hook; hook before page; page partials before the page composes them.
- Commit after each task or logical group; stop at any checkpoint to validate the story independently.

### Parallel Opportunities

- All Setup tasks (T001-T003) are [P] — different files.
- All Foundational tasks marked [P] (T004-T011) — independent migrations/models/policies.
- Within US1: T016-T019 (LLM client, request, two resources) are [P]; T026-T028, T031-T033 are [P] (different FE files). T020 -> T021 -> T022 -> T023 (backend chain) and T024 -> T025 (scheduler) are sequential; the scheduler chain can run parallel to the controller chain.
- Within US2: T035-T039 (two requests + three Actions) are [P]; FE T043/T044 are [P].
- Within US3: T050-T053 are [P].
- Polish: T055-T057 and T059 are [P].
- US2 backend (T035-T042) can be built in parallel with US1 frontend (T026-T034) by a second developer since they touch different files.

---

## Parallel Example: User Story 1

```bash
# Backend infra + HTTP layer (different files):
Task: "Create GuidanceLlmClient in apps/api/app/Services/Thesis/GuidanceLlmClient.php"   # T016
Task: "Create GenerateSupervisionGuideRequest in apps/api/app/Http/Requests/Thesis/..."   # T017
Task: "Create SupervisionGuideResource in apps/api/app/Http/Resources/Thesis/..."          # T018
Task: "Create GuidancePointResource in apps/api/app/Http/Resources/Thesis/..."             # T019

# Frontend scaffolding (different files):
Task: "Add SupervisionGuide/GuidancePoint interfaces to apps/web/src/features/thesis/types.ts"   # T026
Task: "Create supervision-guide api client in apps/web/src/features/thesis/api/..."               # T027
Task: "Create use-supervision-guide hook in apps/web/src/features/thesis/hooks/..."               # T028
Task: "Create guide-header partial in apps/web/.../partials/guide-header.tsx"                    # T031
Task: "Create guide-empty-state partial in apps/web/.../partials/guide-empty-state.tsx"          # T032
Task: "Create guidance-point-item partial in apps/web/.../partials/guidance-point-item.tsx"       # T033
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (config, env, i18n).
2. Complete Phase 2: Foundational (migrations, models, policies, thesis deadline extension) — CRITICAL, blocks all stories.
3. Complete Phase 3: User Story 1 (generation + current view, scheduled + on-demand).
4. **STOP and VALIDATE**: run quickstart Scenarios 1, 2, 4, 5, 6, 7 and the edge cases; verify `php -l`, `npx tsc --noEmit --incremental`, ownership isolation.
5. Deploy/demo if ready — a student already receives deadline-aware, source-linked agendas automatically and on demand.

### Incremental Delivery

1. Setup + Foundational -> foundation ready.
2. Add User Story 1 -> validate independently -> MVP demo.
3. Add User Story 2 -> validate tailoring persists -> demo.
4. Add User Story 3 -> validate history -> demo.
5. Each story adds value without breaking previous stories.

### Parallel Team Strategy

With multiple developers after Foundational:
- Developer A: US1 backend (LLM client -> Action -> Service -> Controller -> routes -> scheduler).
- Developer B: US2 backend (point Actions/Requests/Controller/routes) — only needs Foundational models/policies.
- Developer C: US1 frontend (types -> api -> hook -> page + partials -> route/nav).
US1 frontend waits on US1 backend contract; US3 can start once US1 backend generation exists.

---

## Notes

- [P] tasks = different files, no dependencies on incomplete tasks.
- [Story] label maps a task to its user story for traceability.
- Each user story is independently completable and validable.
- Per project policy: NO automated tests; validate via `php -l`, `npx tsc --noEmit --incremental`, `vendor/bin/pint`, and the `quickstart.md` scenarios. Do NOT run `php artisan test`, `bun run dev`, or `bun run build` unless explicitly asked.
- Narrative activity logs (constitution III) live in the Service layer (matching the existing `ThesisService` pattern), not in Actions.
- Commit after each task or logical group; commit messages follow Conventional Commits with no AI attribution and no emoji.