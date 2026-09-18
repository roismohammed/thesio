# Tasks: Thesis Chapter Management

**Input**: Design documents from `/specs/002-thesis-chapter-management/`

**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/api.md, quickstart.md

**Tests**: SKIPPED. Per user direction ("fokus fungsi skip automate test") and project
policy (no automated tests unless explicitly requested). No test tasks are generated.
Verification is via `php -l`, `vendor/bin/pint`, `npx tsc --noEmit --incremental`,
diff inspection, and the manual scenarios in `quickstart.md`.

**Organization**: Tasks grouped by user story (P1→P4) so each story is independently
implementable and verifiable. Backend follows Controller → Service → Action
(constitution Principles I–III). Frontend is feature-based under
`apps/web/src/features/thesis`, reusing new `components/forms` and `components/datatable`.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependency on incomplete tasks)
- **[Story]**: User story this task belongs to (US1..US4). Setup/Foundational/Polish: no label.
- File paths are absolute-relative to the monorepo root.

## Path Conventions

- Backend (Laravel): `apps/api/...` (PascalCase classes, snake_case migrations/routes)
- Frontend (React): `apps/web/src/...` (kebab-case files, PascalCase exports)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Dependency manifests, env config, route file registration.

^- [X] T001 Add backend deps to `apps/api/composer.json` and install: `smalot/pdfparser`, `phpoffice/phpword`, `league/html-to-markdown`, `openai-php/laravel`. Run `composer require` for each (or edit manifest + `composer install`). (User may run install.)
^- [X] T002 [P] Add frontend deps to `apps/web/package.json` and install: `@tanstack/react-table`, `react-hook-form`, `zod`, `@hookform/resolvers`. Run `bun add ...` (or edit manifest + `bun install`).
^- [X] T003 [P] Configure LLM client: publish `openai-php/laravel` config, add `LLM_BASE_URL`, `LLM_API_KEY`, `LLM_MODEL` to `apps/api/.env` (and `.env.example` placeholders), wire in `apps/api/config/services.php` / `config/openai.php` as needed.
^- [X] T004 Register `routes/thesis.php` in `apps/api/bootstrap/app.php` `withRouting()` `then` callback (after `auth.php`/`admin.php`), under `web`+`auth` middleware, `api` prefix. The file itself is created in US1 (T031).

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core schema + shared frontend primitives that ALL user stories depend on.
**CRITICAL**: No user story work until this phase is complete.

^- [X] T005 [P] Create migration `apps/api/database/migrations/2026_08_04_000000_create_chapter_versions_table.php` (table `chapter_versions`: id, chapter_id, version_number, source, original_file_path, original_file_name, mime, size, markdown_content, conversion_status, conversion_message, uploaded_by, timestamps). Create first; `chapters` references it.
^- [X] T006 [P] Create migration `apps/api/database/migrations/2026_08_04_000001_create_theses_table.php` (table `theses`: id, user_id, title, status, timestamps).
^- [X] T007 Create migration `apps/api/database/migrations/2026_08_04_000002_create_chapters_table.php` (table `chapters`: id, thesis_id, title, position, status, current_version_id (nullable FK → chapter_versions), timestamps). Depends on T005.
^- [X] T008 [P] Create `apps/api/app/Scopes/OwnedByUserScope.php` — a reusable global scope filtering by `user_id = Auth::id()` (applied to Thesis) and a chapter-level variant resolving through `thesis.user_id`. Used by models in US1.
^- [X] T009 [P] Extend `apps/web/src/lib/api.ts` with multipart support: when `body` is `FormData`, skip `Content-Type: application/json`, do not JSON.stringify, let the browser set the boundary. Reuse existing XSRF/Sanctum flow unchanged. Backward compatible for existing JSON calls.
^- [X] T010 [P] Create reusable form core in `apps/web/src/components/forms/`: `form.tsx` (`<Form>` useForm provider + `useFormField` context hook), `types.ts` (shared `FieldProps`: name, label, description, placeholder, disabled, required), `use-form-submit.ts` (submit handler + `ApiError` → toast helper).
^- [X] T011 Create reusable form fields in `apps/web/src/components/forms/` (flat, no subfolder): `text-field.tsx`, `textarea-field.tsx`, `select-field.tsx`, `combobox-field.tsx`, `checkbox-field.tsx`, `radio-group-field.tsx`, `switch-field.tsx`, `file-field.tsx`. Each composes the matching `components/ui` input + `components/ui/field.tsx` (`Field`/`FieldLabel`/`FieldDescription`/`FieldError` with `errors` array) + react-hook-form `Controller`. No re-styling. Depends on T010. (Different field files may be authored in parallel.)
^- [X] T012 [P] Create reusable DataTable in `apps/web/src/components/datatable/`: `data-table.tsx` (generic `<DataTable<TData>>` over `@tanstack/react-table`), `data-table-toolbar.tsx`, `data-table-pagination.tsx` (server-side `{ data, meta }` envelope), `data-table-column-header.tsx`, `types.ts`. Built on `components/ui` (`table`, `pagination`, `button`, `input`, `badge`, `skeleton`, `empty`).
^- [X] T013 [P] Add `FileDropzone` UI primitive at `apps/web/src/components/ui/file-dropzone.tsx` (install via shadcn CLI against the base-nova registry, or author wrapping `@base-ui/react` if unavailable). Needed by `file-field` (T011) and upload UI.

**Checkpoint**: Foundation ready — schema for theses/chapters/versions exists; ownership scope, multipart api, reusable forms, datatable, and file dropzone are available for all stories.

---

## Phase 3: User Story 1 — Student Uploads a Thesis Chapter (Priority: P1) MVP

**Goal**: A student creates a thesis, adds a chapter, uploads a PDF/Word doc that is converted to Markdown and shown in a viewer (original kept downloadable), with full version history + revert.
**Independent Test**: Log in as a student → create thesis → add chapter → upload a small text-based PDF/Word → reload → viewer shows converted Markdown; upload a newer version → history lists both; revert → viewer switches back. (quickstart.md S1)

### Implementation for User Story 1

**Backend — models & ownership**
^- [X] T014 [P] [US1] Create `apps/api/app/Models/Thesis.php` (fillable title/status, casts, `belongsTo(User)`, `hasMany(Chapter)`, apply `OwnedByUserScope`).
^- [X] T015 [P] [US1] Create `apps/api/app/Models/ChapterVersion.php` (fillable per data-model, casts, `belongsTo(Chapter)`, `belongsTo(User, 'uploaded_by')`).
^- [X] T016 [P] [US1] Create `apps/api/app/Models/Chapter.php` (fillable title/position/status/current_version_id, `belongsTo(Thesis)`, `hasMany(ChapterVersion)`, `belongsTo(ChapterVersion, 'current_version_id')`, `hasMany(Reference)` + `hasOne(SupervisionNote)` + `hasMany(Paraphrase)` relations declared for later stories). Apply chapter ownership scope resolving via `thesis.user_id`.

**Backend — policies**
^- [X] T017 [P] [US1] Create `apps/api/app/Policies/ThesisPolicy.php` and `apps/api/app/Policies/ChapterPolicy.php` (authorize owner only; `view/update/delete` check `Auth::user()->is($model->user)` via thesis for chapters). Register in `AuthServiceProvider`/policy map.

**Backend — actions**
^- [X] T018 [P] [US1] Create `apps/api/app/Actions/Thesis/CreateThesisAction.php`, `UpdateThesisAction.php`, `DeleteThesisAction.php` (single DB unit via Eloquent; delete cascades chapters).
^- [X] T019 [P] [US1] Create `apps/api/app/Actions/Thesis/CreateChapterAction.php`, `UpdateChapterAction.php`, `DeleteChapterAction.php` (delete cascades versions/refs/notes/paraphrases).
^- [X] T020 [P] [US1] Create `apps/api/app/Actions/Thesis/CreateChapterVersionAction.php` (store uploaded file on `private` disk, create version row `conversion_status=pending`, set chapter `current_version_id`, dispatch `ConvertChapterToMarkdownJob`) and `RevertChapterVersionAction.php` (set `current_version_id` to an earlier version, keep history).

**Backend — services (orchestration + activity log)**
^- [X] T021 [US1] Create `apps/api/app/Services/Thesis/ThesisService.php` (list/create/update/delete; calls actions; logs `activity('thesis')` narrative Indonesian entries with causer + subject + before/after). Depends T018.
^- [X] T022 [US1] Create `apps/api/app/Services/Thesis/ChapterService.php` (list/show/create/update/delete within a thesis; calls actions; narrative activity log). Depends T019.
^- [X] T023 [US1] Create `apps/api/app/Services/Thesis/ChapterVersionService.php` (upload/list/show/download/revert; calls actions; narrative activity log; download streams from `private` disk after authorization). Depends T020.

**Backend — form requests**
^- [X] T024 [P] [US1] Create `apps/api/app/Http/Requests/Thesis/StoreThesisRequest.php` (title required max 255) and `UpdateThesisRequest.php` (title optional, status in enum).
^- [X] T025 [P] [US1] Create `apps/api/app/Http/Requests/Thesis/StoreChapterRequest.php` (title required, position nullable int≥1) and `UpdateChapterRequest.php` (title/position/status).
^- [X] T026 [P] [US1] Create `apps/api/app/Http/Requests/Thesis/StoreChapterVersionRequest.php` (`file` required, mime in PDF/Word allow-list, max 10 MB — rule from config).

**Backend — controllers & routes**
^- [X] T027 [US1] Create `apps/api/app/Http/Controllers/Thesis/ThesisController.php` (index/store/show/update/delete; manual `serialize()` matching contract; thin). Depends T021,T024.
^- [X] T028 [US1] Create `apps/api/app/Http/Controllers/Thesis/ChapterController.php` (index/store/show/update/delete under a thesis; show returns chapter + current version incl. `markdown_content` + references + note + versions summary). Depends T022,T025.
^- [X] T029 [US1] Create `apps/api/app/Http/Controllers/Thesis/ChapterVersionController.php` (store=upload multipart, index=history, show=with markdown, download=stream, revert). Depends T023,T026.
^- [X] T030 [US1] Create `apps/api/routes/thesis.php` with thesis, chapter, and chapter-version routes per `contracts/api.md` (English paths `/api/thesis/...`). Wired into bootstrap by T004.

**Backend — conversion**
^- [X] T031 [P] [US1] Create `apps/api/app/Support/MarkdownConverter.php` — pandoc primary (via `Symfony Process`), pure-PHP fallback (`smalot/pdfparser` for PDF; `phpoffice/phpword` DOCX→HTML; `league/html-to-markdown` HTML→Markdown). Returns `{ markdown, status, message }`; on failure returns `status=failed` + friendly message, never throws on unconvertable input.
^- [X] T032 [US1] Create `apps/api/app/Jobs/Thesis/ConvertChapterToMarkdownJob.php` (reads the version's stored original file, calls `MarkdownConverter`, writes `markdown_content` + `conversion_status`/`conversion_message`; handles image-only/empty gracefully per FR-022). Depends T031.

**Frontend — types & API layer**
^- [X] T033 [P] [US1] Create `apps/web/src/features/thesis/types.ts` (TS interfaces: `Thesis`, `Chapter`, `ChapterVersion`, `Reference`, `SupervisionNote`, `Paraphrase`, pagination `Meta`).
^- [X] T034 [P] [US1] Create `apps/web/src/features/thesis/api/thesis.ts` — typed wrappers over `api()` for thesis/chapter/version endpoints (list, create, update, delete, upload via FormData, history, download, revert).
^- [X] T035 [P] [US1] Create `apps/web/src/features/thesis/hooks/use-thesis.ts` (fetch the student's thesis + chapters; loading/error state; React Compiler handles memoization).

**Frontend — i18n & navigation**
^- [X] T036 [P] [US1] Add i18n keys for the thesis feature to `apps/web/src/i18n/locales/id/thesis.json` and `apps/web/src/i18n/locales/en/thesis.json` (English identifiers, Indonesian text for `id`). Wire into the i18n loader.
^- [X] T037 [US1] Register `/thesis` and `/thesis/:thesisId/chapters/:chapterId` routes in `apps/web/src/App.tsx` (English paths), wrapped in `AuthGuard`. Add a "Skripsi" entry to the sidebar nav config at `apps/web/src/components/layout/nav-config.tsx`.

**Frontend — pages & components**
^- [X] T038 [P] [US1] Create `apps/web/src/features/thesis/components/chapter-status-badge.tsx` (draft/submitted/reviewed → `Badge` variant).
^- [X] T039 [US1] Create thesis list/detail page at `apps/web/src/features/thesis/pages/thesis/index.tsx` (+ `partials/` as needed): breadcrumb (Dasbor → Skripsi), thesis list via `DataTable`, "Buat Skripsi" button opening a modal form (≤5 fields) using `components/forms` fields. File ≤300 lines; extract partials.
^- [X] T040 [US1] Create chapter detail page at `apps/web/src/features/thesis/pages/chapter/index.tsx` with tabs (Content / Versi; references + notulen tabs added in later stories). Breadcrumb (Dasbor → Skripsi → {thesis title} → {chapter title}). Uses `AppLayout`. File ≤300 lines; tab contents in `partials/`.
^- [X] T041 [US1] Create content tab `apps/web/src/features/thesis/pages/chapter/partials/content-tab.tsx`: shows current version's Markdown (rendered) + upload-new-version button (modal or inline `FileField` via `components/forms`); friendly "konten belum dikonversi/belum ada dokumen" empty state; handles `conversion_status` pending/failed messaging (FR-022).
^- [X] T042 [P] [US1] Create `apps/web/src/features/thesis/components/chapter-content-viewer.tsx` — renders the converted Markdown (use a markdown renderer compatible with the stack; if none installed, add one via `bun add` e.g. `react-markdown` + `remark-gfm`). Pure presentational.
^- [X] T043 [US1] Create versions tab `apps/web/src/features/thesis/pages/chapter/partials/versions-tab.tsx`: version history (`DataTable`: number, source, created_at, conversion_status), download original, revert-to-this-version. Confirm revert before applying.

**Checkpoint**: US1 fully functional — a student can create a thesis, add a chapter, upload PDF/Word, see converted Markdown, manage/download versions, and revert. Owns-only isolation enforced. Activity log populated.

---

## Phase 4: User Story 2 — Student Manages Per-Chapter References (Priority: P2)

**Goal**: Each chapter has its own references (link or journal file), scoped to that chapter only, with add/edit/remove/download.
**Independent Test**: Add a link ref and a file ref to a chapter; confirm both appear under only that chapter; edit the link; delete the file; list updates. (quickstart.md S2)

### Implementation for User Story 2

**Backend**
^- [X] T044 [P] [US2] Create migration `apps/api/database/migrations/2026_08_04_000003_create_chapter_references_table.php` (table `chapter_references`: id, chapter_id, type, title, url, file_path, file_name, mime, size, timestamps).
^- [X] T045 [P] [US2] Create `apps/api/app/Models/Reference.php` (fillable per data-model, `belongsTo(Chapter)`; accessors for link vs file).
^- [X] T046 [P] [US2] Create `apps/api/app/Http/Requests/Thesis/StoreReferenceRequest.php` (union: link → title + http(s) URL rule rejecting non-http(s); file → title + file mime/size rules) and `UpdateReferenceRequest.php`.
^- [X] T047 [P] [US2] Create `apps/api/app/Actions/Thesis/CreateReferenceAction.php`, `UpdateReferenceAction.php`, `DeleteReferenceAction.php` (file type stores on `private` disk; delete removes stored file).
^- [X] T048 [US2] Create `apps/api/app/Services/Thesis/ReferenceService.php` (list/create/update/delete/download within a chapter; calls actions; narrative activity log). Depends T047.
^- [X] T049 [US2] Create `apps/api/app/Http/Controllers/Thesis/ReferenceController.php` (index/store multipart-or-json/patch/destroy/download). Add reference routes to `routes/thesis.php`. Depends T048,T046.

**Frontend**
^- [X] T050 [US2] Create references tab `apps/web/src/features/thesis/pages/chapter/partials/references-tab.tsx`: list the chapter's references (link → open URL; file → download), add (modal form: link uses `TextField`+`TextField` for url; file uses `FileField`), edit link, delete with confirm. Uses `components/forms` fields + `DataTable` or list. Add typed API calls to `features/thesis/api/thesis.ts`. Add i18n keys (T036 file).

**Checkpoint**: US1 + US2 both work independently; references never leak across chapters.

---

## Phase 5: User Story 3 — Student Records Per-Chapter Notulen (Priority: P3)

**Goal**: A student records/edits a supervision note ("notulen") per chapter to guide their own revision; scoped to the chapter; allowed even before any document.
**Independent Test**: Create a notulen for a chapter (even with no doc), reopen → content shows; update it → latest shows; another chapter's notulen does not appear here. (quickstart.md S3)

### Implementation for User Story 3

**Backend**
^- [X] T051 [P] [US3] Create migration `apps/api/database/migrations/2026_08_04_000004_create_supervision_notes_table.php` (table `supervision_notes`: id, chapter_id unique, content, timestamps).
^- [X] T052 [P] [US3] Create `apps/api/app/Models/SupervisionNote.php` (fillable content, `belongsTo(Chapter)`).
^- [X] T053 [P] [US3] Create `apps/api/app/Http/Requests/Thesis/UpsertSupervisionNoteRequest.php` (content required, min 1).
^- [X] T054 [P] [US3] Create `apps/api/app/Actions/Thesis/UpsertSupervisionNoteAction.php` (create-or-update the single row per chapter) and `DeleteSupervisionNoteAction.php`.
^- [X] T055 [US3] Create `apps/api/app/Services/Thesis/SupervisionNoteService.php` (show upsert delete; calls actions; narrative activity log). Depends T054.
^- [X] T056 [US3] Create `apps/api/app/Http/Controllers/Thesis/SupervisionNoteController.php` (GET show → 404 if none; PUT upsert; DELETE). Add note routes to `routes/thesis.php`. Depends T055,T053.

**Frontend**
^- [X] T057 [US3] Create notulen tab `apps/web/src/features/thesis/pages/chapter/partials/notulen-tab.tsx`: load note (404 → empty editor), edit via `TextareaField` from `components/forms`, save (PUT upsert), delete with confirm. Add typed API calls to `features/thesis/api/thesis.ts`. Add i18n keys (T036 file).

**Checkpoint**: US1–US3 all work independently; notulen is per-chapter and pre-doc.

---

## Phase 6: User Story 4 — Student Paraphrases Chapter Text with LLM (Priority: P4)

**Goal**: A student selects a portion of a chapter's Markdown, requests an LLM paraphrase preview, accepts (replaces selection + snapshots a recoverable version) or discards; failures never alter the text.
**Independent Test**: Open a chapter with Markdown, select a paragraph, paraphrase → preview appears; accept → text replaced + new version snapshot (old recoverable); discard → unchanged; with LLM off → friendly "coba lagi", text untouched. (quickstart.md S4)

### Implementation for User Story 4

**Backend**
^- [X] T058 [P] [US4] Create migration `apps/api/database/migrations/2026_08_04_000005_create_paraphrases_table.php` (table `paraphrases`: id, chapter_id, user_id, original_selection, paraphrased_text nullable, outcome, timestamps).
^- [X] T059 [P] [US4] Create `apps/api/app/Models/Paraphrase.php` (fillable per data-model, `belongsTo(Chapter)`, `belongsTo(User)`).
^- [X] T060 [P] [US4] Create `apps/api/app/Http/Requests/Thesis/ParaphraseRequest.php` (`selection` required, length 1..5000 chars).
^- [X] T061 [P] [US4] Create `apps/api/app/Actions/Thesis/CreateParaphraseAction.php` (call LLM via `openai-php/laravel` with env-configurable base_url/model; system prompt: paraphrase the student's Indonesian draft preserving meaning; enforce max length; on any error set `outcome=failed`, `paraphrased_text=null`; never throw to caller) and `ApplyParaphraseAction.php` (replace selection in current version Markdown, snapshot a new `ChapterVersion` `source=paraphrase` for recoverability, mark `outcome=applied`).
^- [X] T062 [US4] Create `apps/api/app/Services/Thesis/ParaphraseService.php` (request=preview without mutating text, records `Paraphrase` outcome=discarded initially; apply=accept; calls actions; narrative activity log for accept/discard/fail per FR-027). Depends T061.
^- [X] T063 [US4] Create `apps/api/app/Http/Controllers/Thesis/ParaphraseController.php` (POST `.../paraphrase` → preview + `paraphrase_id`; POST `.../paraphrase/{paraphrase}/apply`). Add routes to `routes/thesis.php`. On LLM failure return `422` friendly "coba lagi", text untouched. Depends T062,T060.

**Frontend**
^- [X] T064 [P] [US4] Create `apps/web/src/features/thesis/hooks/use-paraphrase.ts` (request preview + apply; loading/error state).
^- [X] T065 [US4] Extend `apps/web/src/features/thesis/components/chapter-content-viewer.tsx` (or its partial) with text selection → "Parafrase" action: shows preview alongside original (diff/preview panel), Accept (calls apply → refetch chapter) / Discard (no mutation). Friendly messages for empty/oversized selection and LLM failure. Add typed API calls to `features/thesis/api/thesis.ts`. Add i18n keys (T036 file).

**Checkpoint**: All four stories functional independently; paraphrase never corrupts chapter text on failure.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Consistency, sizing, and final validation across stories.

^- [X] T066 [P] Verify every new PHP class ≤ 300 lines and every method ≤ 100 lines; extract to Service/Action/private method where exceeded. Run `php -l` on each new PHP file and `vendor/bin/pint` on touched PHP.
^- [X] T067 [P] Verify every React component file ≤ 300 lines; extract to `partials/` or `use-*` hooks where exceeded. Run `npx tsc --noEmit --incremental` in `apps/web`.
^- [X] T068 [P] Verify breadcrumbs on every new inner page (thesis list, thesis detail, chapter detail) reflect root→active hierarchy; last item plain text, others link to correct parent routes (never `#`).
^- [X] T069 [P] Verify all user-facing text is semi-formal Indonesian (labels, buttons, empty states, messages, toasts); identifiers/i18n keys stay English.
^- [X] T070 [P] Verify dark-mode parity (`.dark`) for every new surface (viewer, tabs, datatable, forms, dialogs).
^- [X] T071 Run `quickstart.md` scenarios S1–S5 manually against the running stack (user starts `composer run dev` + `bun run dev`); confirm ownership isolation (S5) and narrative activity log entries (S6).

---

## Dependencies & Execution Order

### Phase Dependencies
- **Setup (Phase 1)**: No dependencies — start immediately. T004 (route registration) is applied but the `routes/thesis.php` file is created in US1 (T030); registration line can be added now and the file included later.
- **Foundational (Phase 2)**: Depends on Setup. BLOCKS all user stories.
- **User Stories (Phases 3–6)**: All depend on Foundational completion. May proceed sequentially P1→P4 (recommended MVP order) or in parallel if team capacity allows.
- **Polish (Phase 7)**: Depends on the stories being complete.

### User Story Dependencies
- **US1 (P1)**: Depends on Foundational only. No other-story dependency. **MVP scope.**
- **US2 (P2)**: Depends on Foundational; integrates with US1 (references attach to a chapter) but is independently testable once a chapter exists.
- **US3 (P3)**: Depends on Foundational; integrates with US1 (note attaches to a chapter); independently testable.
- **US4 (P4)**: Depends on Foundational + US1 (paraphrase operates on a chapter's converted Markdown); independently testable once a chapter with Markdown exists.

### Within Each User Story
- Migrations → Models → Policies → Actions → Services → Form Requests → Controllers → Routes → Frontend types/api → hooks → pages/components.
- Activity logging is part of each Service task (narrative Indonesian, causer + subject).
- No automated tests; verify via `php -l`, `pint`, `tsc`, diff inspection, then quickstart scenarios.

### Parallel Opportunities
- T002, T003 are parallel with T001 (independent manifests/config).
- Foundational [P] tasks: T005–T006, T008–T010, T012–T013 run in parallel; T007 after T005; T011 after T010.
- Within US1: models T014–T016, requests T024–T026, controller-ish [P] groups, conversion T031, frontend types/api/hooks/i18n T033–T036 all parallelize across different files.
- US2/US3/US4 backend (migration + model + request + actions) are mutually parallel across stories once Foundational is done; only the Service/Controller that composes them is sequential within a story.
- Frontend of US2/US3/US4 (their tab partials) parallelize across stories.

---

## Parallel Example: User Story 1

```bash
# Backend models (parallel — different files):
Task: "Create Thesis model in apps/api/app/Models/Thesis.php"
Task: "Create ChapterVersion model in apps/api/app/Models/ChapterVersion.php"
Task: "Create Chapter model in apps/api/app/Models/Chapter.php"

# Form requests (parallel):
Task: "StoreThesisRequest + UpdateThesisRequest"
Task: "StoreChapterRequest + UpdateChapterRequest"
Task: "StoreChapterVersionRequest"

# Conversion infra (parallel with controllers):
Task: "MarkdownConverter in apps/api/app/Support/MarkdownConverter.php"
```

---

## Implementation Strategy

### MVP First (User Story 1 only)
1. Phase 1: Setup (deps, env, route registration).
2. Phase 2: Foundational (migrations, ownership scope, multipart api, reusable forms + datatable + file dropzone).
3. Phase 3: US1 — thesis + chapter + upload + Markdown conversion + version history/revert.
4. STOP & VALIDATE: run quickstart.md S1 + S5 (isolation) manually.
5. Demo/deploy if ready.

### Incremental Delivery
1. Foundational → foundation ready.
2. + US1 → MVP (upload + Markdown + versions).
3. + US2 → per-chapter references.
4. + US3 → per-chapter notulen.
5. + US4 → LLM paraphrase.
Each story adds value without breaking previous ones.

---

## Notes
- No automated test tasks (per user direction + project policy). Verify via `php -l`, `vendor/bin/pint`, `npx tsc --noEmit --incremental`, diff inspection, and quickstart.md scenarios.
- [P] = different files, no dependency on incomplete tasks.
- [Story] label maps a task to its user story.
- Commit after each task or logical group; Conventional Commits, no AI attribution.
- Stop at any checkpoint to validate a story independently.
- Delegate per project rules: BE Laravel → `ammar` (use `/laravel-best-practices`, `/clean-code-principles`, `/design-patterns`); FE → `sierly` (use `/ui-ux-pro-max`, `/make-interfaces-feel-better`).