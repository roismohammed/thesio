# Implementation Plan: Thesis Chapter Management

**Branch**: `002-thesis-chapter-management` | **Date**: 2026-08-04 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/002-thesis-chapter-management/spec.md`

## Summary

A student-only thesis management feature: each student owns one thesis with
independently uploadable chapters. Uploaded PDF/Word documents are converted
to Markdown (shown in the chapter viewer; original kept downloadable) with full
version history. Each chapter carries its own references (link or journal
file), its own supervision note ("notulen"), and an LLM paraphrase assistant
that previews and optionally replaces a selected passage. All data is scoped to
the owning student; every mutation is narrative-activity-logged. Backend
follows the existing Controller → Service → Action layering on Laravel 13 +
Sanctum; frontend adds reusable TanStack datatable and react-hook-form/zod
form primitives to the React 19 SPA, prioritizing the existing shadcn
base-nova `components/ui`.

## Technical Context

**Language/Version**: PHP 8.3 (apps/api), TypeScript / React 19 (apps/web).

**Primary Dependencies**:
- Existing — Laravel 13, Sanctum 4, spatie/laravel-activitylog 5,
  spatie/laravel-permission 8, Eloquent ORM. React 19 + Vite 8, react-router 7,
  shadcn base-nova on `@base-ui/react`, Tailwind v4, i18next.
- New (api) — `smalot/pdfparser`, `phpoffice/phpword`, `league/html-to-markdown`,
  `openai-php/laravel`; system `pandoc` (optional, primary converter).
- New (web) — `@tanstack/react-table`, `react-hook-form`, `zod`,
  `@hookform/resolvers`.

**Storage**: SQLite default (MySQL-compatible). Chapter version originals and
reference files on the `private` disk (`storage/app/private`), streamed via
authenticated download routes — never public URLs.

**Testing**: No automated tests authored (project policy). Verification via
`php -l`, `vendor/bin/pint`, `php artisan test` (existing suite only),
`npx tsc --noEmit --incremental`, and the manual scenarios in `quickstart.md`.

**Target Platform**: Linux server (Laravel) + modern browser SPA.

**Project Type**: Web service (Laravel JSON API) + SPA (React).

**Performance Goals**: Chapter upload + conversion usable within ~2 min (SC-001);
paraphrase accept/discard within ~30 s (SC-008); ≥95% text-based uploads convert
to readable Markdown (SC-007).

**Constraints**: One active thesis per student in v1. Max upload 10 MB (config).
Paraphrase selection 1..5000 chars. LLM failures must never mutate chapter text.

**Scale/Scope**: Single-student isolation hard requirement (SC-005 = 100%).

**NEEDS CLARIFICATION**: All resolved in `research.md` (D1–D10) — document
conversion library, LLM provider, storage, multipart client, form/datatable
primitives, `Notulen` → `SupervisionNote` naming, auth/ownership model, route
file, activity-log placement, paraphrase-versioning.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Constitution v1.1.0 (`.specify/memory/constitution.md`) — checked against
every principle:

- **I. Layered HTTP (Controller → Service → Action)**: PASS. New
  `ThesisController`/`ChapterController`/etc. only parse/translate/return;
  Services orchestrate use cases; Actions execute single DB units. No
  Service-injected-into-Action. (research D10, D8.)
- **II. Action single responsibility + DB via ORM**: PASS. All mutations
  through Actions using Eloquent; no raw SQL for single CRUD. Class ≤ 300
  lines, method ≤ 100 lines enforced by extraction.
- **III. Narrative activity logging**: PASS. Every create/update/delete +
  paraphrase accept/discard/fail logs via `spatie/activitylog` with
  `activity('thesis')`, narrative Indonesian, causer + subject. (D10.)
- **IV. Productivity-app design language**: PASS. Dense, legible, design-system
  driven; dark-mode parity; motion conveys state. Operationalized by
  `/make-interfaces-feel-better` and `/emil-design-eng` during implementation.
- **V. Frontend design craft**: PASS. `/ui-ux-pro-max` guidance; breadcrumb on
  every inner page; UI text semi-formal Indonesian; modal only for ≤5-field
  forms (chapter create, reference link); separate page for chapter detail
  (content + references + notulen + versions). Reusable primitives in
  `components/forms` and `components/datatable`; feature-shared under
  `features/thesis/components`; page-local under `partials/`. File ≤ 300 lines.
- **Technology stack & conventions**: PASS. English identifiers; kebab-case
  JS/TS files, PascalCase PHP classes, snake_case migrations/tables/columns.
  React Compiler respected (no manual memo). Comments minimal, complex-only.
- **Workflow & quality gates**: PASS. No auto-run of dev/build; objective checks
  (`php -l`, `pint`, `tsc`) before handoff; no browser automation unless asked;
  no emoji; Conventional Commits, no AI attribution.

**Post-Phase-1 re-check**: No violations introduced by the design. The only
deviation worth noting is the pre-existing Indonesian URL paths
(`/pengaturan`, `/profil`); new routes follow the constitution (English
`/thesis`). No new violations. No entries needed in Complexity Tracking.

## Project Structure

### Documentation (this feature)

```text
specs/002-thesis-chapter-management/
├── plan.md              # this file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/
│   └── api.md           # Phase 1 output — HTTP API contract
└── tasks.md             # Phase 2 output (/speckit-tasks — not created here)
```

### Source Code (repository root)

```text
apps/api/
├── app/
│   ├── Http/
│   │   ├── Controllers/Thesis/
│   │   │   ├── ThesisController.php
│   │   │   ├── ChapterController.php
│   │   │   ├── ChapterVersionController.php
│   │   │   ├── ReferenceController.php
│   │   │   ├── SupervisionNoteController.php
│   │   │   └── ParaphraseController.php
│   │   └── Requests/Thesis/
│   │       ├── StoreThesisRequest.php
│   │       ├── UpdateThesisRequest.php
│   │       ├── StoreChapterRequest.php
│   │       ├── UpdateChapterRequest.php
│   │       ├── StoreChapterVersionRequest.php        # upload (file rules)
│   │       ├── StoreReferenceRequest.php             # link/file union
│   │       ├── UpdateReferenceRequest.php
│   │       ├── UpsertSupervisionNoteRequest.php
│   │       └── ParaphraseRequest.php                 # selection rules
│   ├── Models/
│   │   ├── Thesis.php
│   │   ├── Chapter.php
│   │   ├── ChapterVersion.php
│   │   ├── Reference.php
│   │   ├── SupervisionNote.php
│   │   └── Paraphrase.php
│   ├── Policies/
│   │   ├── ThesisPolicy.php
│   │   └── ChapterPolicy.php   # + version/reference/note/paraphrase via chapter
│   ├── Services/Thesis/
│   │   ├── ThesisService.php
│   │   ├── ChapterService.php
│   │   ├── ChapterVersionService.php
│   │   ├── ReferenceService.php
│   │   ├── SupervisionNoteService.php
│   │   └── ParaphraseService.php
│   ├── Actions/Thesis/
│   │   ├── CreateThesisAction.php
│   │   ├── UpdateThesisAction.php
│   │   ├── DeleteThesisAction.php
│   │   ├── CreateChapterAction.php
│   │   ├── UpdateChapterAction.php
│   │   ├── DeleteChapterAction.php
│   │   ├── CreateChapterVersionAction.php
│   │   ├── RevertChapterVersionAction.php
│   │   ├── CreateReferenceAction.php
│   │   ├── UpdateReferenceAction.php
│   │   ├── DeleteReferenceAction.php
│   │   ├── UpsertSupervisionNoteAction.php
│   │   ├── DeleteSupervisionNoteAction.php
│   │   ├── CreateParaphraseAction.php
│   │   └── ApplyParaphraseAction.php
│   ├── Jobs/Thesis/
│   │   └── ConvertChapterToMarkdownJob.php
│   ├── Support/
│   │   └── MarkdownConverter.php        # pandoc primary + pure-PHP fallback
│   └── Scopes/
│       └── OwnedByUserScope.php         # global scope for Thesis/Chapter
├── routes/thesis.php
└── database/migrations/
    ├── 2026_08_04_000000_create_chapter_versions_table.php
    ├── 2026_08_04_000001_create_theses_table.php
    ├── 2026_08_04_000002_create_chapters_table.php
    ├── 2026_08_04_000003_create_chapter_references_table.php
    ├── 2026_08_04_000004_create_supervision_notes_table.php
    └── 2026_08_04_000005_create_paraphrases_table.php

apps/web/
├── src/
│   ├── components/
│   │   ├── forms/                         # NEW — reusable form fields (flat)
│   │   │   ├── form.tsx                   # core: <Form> (useForm provider),
│   │   │   │                              # useFormField context hook
│   │   │   ├── use-form-submit.ts         # submit + ApiError → toast helper
│   │   │   ├── types.ts                   # shared field prop types
│   │   │   ├── text-field.tsx             # TextField → Input
│   │   │   ├── textarea-field.tsx         # TextareaField → Textarea
│   │   │   ├── select-field.tsx           # SelectField → Select
│   │   │   ├── combobox-field.tsx         # ComboboxField → Combobox
│   │   │   ├── checkbox-field.tsx         # CheckboxField → Checkbox
│   │   │   ├── radio-group-field.tsx      # RadioGroupField → RadioGroup
│   │   │   ├── switch-field.tsx           # SwitchField → Switch
│   │   │   └── file-field.tsx             # FileField → FileDropzone (new, in ui/)
│   │   │                                  # Each field composes a components/ui input +
│   │   │                                  # components/ui/field.tsx (Field/FieldLabel/
│   │   │                                  # FieldDescription/FieldError) + RHF binding.
│   │   └── datatable/                     # NEW — reusable TanStack datatable
│   │       ├── data-table.tsx             # <DataTable<TData, TValue>>
│   │       ├── data-table-toolbar.tsx
│   │       ├── data-table-pagination.tsx
│   │       ├── data-table-column-header.tsx
│   │       └── types.ts
│   ├── features/thesis/
│   │   ├── api/                           # typed API calls (api.ts wrappers)
│   │   │   └── thesis.ts
│   │   ├── components/                    # feature-shared (cross-page)
│   │   │   ├── chapter-status-badge.tsx
│   │   │   └── chapter-content-viewer.tsx  # Markdown render + selection
│   │   ├── hooks/
│   │   │   ├── use-thesis.ts
│   │   │   └── use-paraphrase.ts
│   │   ├── pages/
│   │   │   ├── thesis/                     # list + detail
│   │   │   │   ├── index.tsx
│   │   │   │   └── partials/
│   │   │   ├── chapter/                    # chapter detail (tabs)
│   │   │   │   ├── index.tsx
│   │   │   │   └── partials/
│   │   │   │       ├── content-tab.tsx
│   │   │   │       ├── references-tab.tsx
│   │   │   │       ├── notulen-tab.tsx
│   │   │   │       └── versions-tab.tsx
│   │   │   └── thesis-form/                # create/edit thesis (page, simple)
│   │   └── types.ts                        # Chapter, Thesis, Reference, ...
│   ├── lib/
│   │   └── api.ts                          # EXTEND — FormData multipart support
│   └── i18n/locales/{id,en}/thesis.json    # NEW — feature i18n keys
└── src/App.tsx                             # EDIT — register /thesis routes
```

**Structure Decision**: Web application (Option 2 adapted to the existing
monorepo): `apps/api` (Laravel, layered) + `apps/web` (React SPA, feature-based
under `src/features/thesis`). Reusable primitives live in
`src/components/forms` and `src/components/datatable` (project-wide);
feature-shared components in `src/features/thesis/components`; page-local in
each page's `partials/` — per constitution Principle V. Backend mirrors the
existing `Admin/*` controller/service/action layout under a `Thesis` namespace.

### `components/forms` scope — reusable form fields composing `components/ui` (NON-NEGOTIABLE)

`components/forms` holds **reusable, cross-feature form field components** —
generic `<TextField>`, `<TextareaField>`, `<SelectField>`, `<ComboboxField>`,
`<CheckboxField>`, `<RadioGroupField>`, `<SwitchField>`, `<FileField>` — plus
the core `<Form>` provider and a `use-form-submit` helper. A feature page drops
a field in one line (e.g. `<TextField name="title" label="Judul Bab" />`)
without re-writing the label/control/error boilerplate per form.

- **Each field composes — never re-styles — `components/ui` inputs.** A
  `TextField` renders `Input`, a `SelectField` renders `Select`, etc. The
  styled control stays the single source of truth in `components/ui`
  (constitution Principle V design-system layer); the field component only
  wires react-hook-form (`Controller` / `useFormContext`) + label + description
  + error around it. No parallel styled-input system.
- **Reuse the existing `components/ui/field.tsx` primitives** for the shell:
  `Field`/`FieldLabel`/`FieldDescription`/`FieldError` (which already accepts an
  `errors` array). Field components pass react-hook-form field-state errors to
  `FieldError`, so label, orientation, invalid-state styling, and error
  rendering match the pages already using `Field` (e.g. `pengaturan/sections/*`)
  — no new field/label/error layout invented.
- **Common field props** (`name`, `label`, `description`, `placeholder`,
  `disabled`, `required`) live in `components/forms/types.ts` and are shared by
  every field so the surface is consistent. Input-specific props pass through to
  the underlying `components/ui` control.
- **New input not yet in `components/ui`** (e.g. a `FileDropzone` for chapter
  and reference uploads) is added via the shadcn CLI or authored in
  `components/ui` first, then a `FileField` in `components/forms` wraps it —
  never the other way around — per the user's standing instruction to
  prioritize `components/ui` and install from shadcn when missing.
- **What does NOT belong here**: thesis-specific fields (e.g. a
  `ChapterStatusSelect` with the draft/submitted/reviewed options baked in) —
  those live in `features/thesis/components/` and consume the generic fields.
  `components/forms` fields carry no feature-specific assumptions.
- **Rationale**: reusable fields remove per-form boilerplate (DRY) while keeping
  styling centralized in `components/ui` (single source of truth). Per-input
  re-styling is prohibited; per-input *binding* is exactly what makes them
  reusable. This is the productive reading of Principle V's "reusable,
  cross-feature primitives" rule.

## Complexity Tracking

> Fill ONLY if Constitution Check has violations that must be justified.

None. All principles pass; no justified violations.