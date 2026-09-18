# Research: Thesis Chapter Management

**Branch**: `002-thesis-chapter-management` | **Date**: 2026-08-04

Resolves the NEEDS CLARIFICATION items from Technical Context and the
open planning decisions left by the spec (file formats, conversion library,
LLM provider, storage, frontend form/table primitives).

## Decisions

### D1. Document → Markdown conversion: pandoc primary, pure-PHP fallback

- **Decision**: Convert chapter uploads (PDF/Word) to Markdown using
  `pandoc` (system binary) invoked via `Symfony Process`. When pandoc is
  not available on the host, fall back to a pure-PHP pipeline:
  `smalot/pdfparser` (PDF text) and `phpoffice/phpword` (DOCX → HTML),
  then `league/html-to-markdown` (HTML → Markdown).
- **Rationale**: The spec requires the conversion to "preserve the readable
  text structure as well as the format allows" (tables, footnotes, headings).
  Pandoc produces markedly better Markdown for thesis-grade documents than any
  pure-PHP extractor. The pure-PHP fallback keeps the app runnable in
  constrained environments (CI, container without pandoc) and is good enough
  for the ≥95% text-based upload success criterion (SC-007) on simple docs.
- **Alternatives considered**:
  - Pure-PHP only (`smalot/pdfparser` + `phpoffice/phpword` + HTML→MD): simpler
    deps, but drops tables/footnotes and produces poor structure for complex
    thesis docs — risks SC-007.
  - `spatie/pdf-to-text`: thin wrapper over `pdftotext`, text only, no
    structure — rejected for the same reason.
  - Hosted/remote conversion API: adds a network dependency and cost; the
    spec wants graceful on-device handling. Rejected for v1.

Conversion runs in a **queued job** (`ConvertChapterToMarkdownJob`) so the
upload request returns immediately and a slow/large doc never blocks the
HTTP request. `conversion_status` (`pending|succeeded|failed`) on
`chapter_versions` tracks progress; on failure the original file is retained
and a friendly message is surfaced (FR-022). Tests run the job synchronously
via the `sync` queue driver; dev already runs `queue:listen` via
`composer run dev`.

### D2. LLM paraphrase provider: OpenAI-compatible via `openai-php/laravel`

- **Decision**: Use `openai-php/laravel`. The base URL, API key, and model are
  env-configurable (`LLM_BASE_URL`, `LLM_API_KEY`, `LLM_MODEL`) so the same
  code works against OpenAI, an OpenAI-compatible gateway, or a local endpoint.
- **Rationale**: Decouples the feature from one vendor while keeping a single
  thin client. The spec explicitly leaves the provider as a planning decision
  and only requires request/preview/accept/discard + graceful failure (FR-023
  → FR-027).
- **Server-side guardrails**: enforce a max selection length (e.g. 5000 chars)
  and reject empty/oversized selections (FR-025); wrap the call in a timeout
  and on any error return a friendly "coba lagi" message without mutating the
  chapter text (FR-026).
- **Alternatives considered**:
  - Raw `Http::post` to the provider: works but reimplements client retries,
    streaming, error mapping. Rejected.
  - Anthropic SDK: equally viable, but the OpenAI-compatible surface is the
    lowest-friction default for a paraphrase endpoint and easy to swap.

### D3. File storage: private disk, authenticated download

- **Decision**: Store chapter version originals and reference files on the
  `private` disk (`storage/app/private`, already configured in Laravel 13).
  Downloads go through authenticated controller routes that authorize the
  owning student before streaming the file — never a public URL.
- **Rationale**: Students must only ever reach their own files (FR-013,
  SC-005). The `private` disk is not web-served, so a leaked URL is useless
  without the session. Same disk/format/size rules apply to chapter uploads
  and reference uploads (FR-005).
- **Accepted formats / size**: PDF + Word (`application/pdf`,
  `application/vnd.openxmlformats-officedocument.wordprocessingml.document`,
  and legacy `application/msword`). Max size **10 MB** for chapter docs and
  reference files (planning decision per spec assumption). Stored as a config
  constant so it can be tuned.

### D4. Multipart uploads: extend the SPA api client

- **Decision**: Extend `apps/web/src/lib/api.ts` so that when `body` is a
  `FormData` instance it skips the `Content-Type: application/json` header
  (lets the browser set the multipart boundary) and does not JSON-stringify.
  The existing XSRF/Sanctum handling is reused unchanged.
- **Rationale**: The current `api()` only sends JSON. Uploads (chapter doc,
  reference file) are multipart. A minimal, backward-compatible extension keeps
  one client for all calls.

### D5. Reusable forms: react-hook-form + zod in `components/forms`

- **Decision**: Add `react-hook-form`, `zod`, `@hookform/resolvers`. Build
  reusable form primitives in `apps/web/src/components/forms/` (`Form`,
  `FormField`, `FormItem`, `FormLabel`, `FormControl`, `FormMessage`,
  `FormDescription`) that compose the existing `components/ui` primitives
  (`Label`, `Input`, `Textarea`, `Field`, `Select`, `Checkbox`, etc.). These
  are generic, cross-feature primitives — no thesis-specific assumptions.
- **Rationale**: The user explicitly asked for reusable forms under
  `components/forms`. react-hook-form + zod is the React-community standard,
  plays well with React Compiler (no manual memo needed), and gives schema-
  driven validation that mirrors the server Form Request rules. Per the
  constitution, `components/forms` is the right home for project-wide form
  primitives; thesis-specific form sections live in the feature folder.
- **Alternatives considered**:
  - Bare controlled `useState` forms (current admin users page style): fine
    for tiny forms but no schema validation, error messages, or reuse.
    Rejected for a multi-entity feature.
  - `formik`: viable but react-hook-form is lighter and more idiomatic with
    React 19.

### D6. Reusable DataTable: TanStack Table in `components/datatable`

- **Decision**: Add `@tanstack/react-table`. Build a generic, typed
  `DataTable<TData>` in `apps/web/src/components/datatable/` with sub-parts
  (`data-table.tsx`, `data-table-toolbar.tsx`, `data-table-pagination.tsx`,
  `data-table-column-header.tsx`) composed from `components/ui` (`Table`,
  `Button`, `Input`, `Pagination`, `Badge`, `Skeleton`, `Empty`). Server-side
  pagination is wired to the existing `{ data, meta }` envelope used by the
  admin controllers.
- **Rationale**: The user explicitly required a TanStack datatable under
  `components/datatable`, design must prioritize existing `components/ui`
  primitives (no shadcn add needed — `table`, `pagination`, `badge`,
  `skeleton`, `empty`, `button`, `input` are already installed). The admin
  users page's hand-rolled table is the obvious refactor target later, but
  not part of this feature's scope.
- **Alternatives considered**:
  - Keep hand-rolled `<Table>` per page: no sorting/filtering/column visibility
    reuse. Rejected — the user asked for a reusable datatable.

### D7. Entity naming: "Notulen" → `SupervisionNote` (English identifier)

- **Decision**: The spec entity "Notulen" is implemented as the English
  identifier `SupervisionNote` (model `SupervisionNote.php`, table
  `supervision_notes`, route `/.../notulen` kept as the resource word because
  it is the documented API contract term — but the PHP/TS **identifier** is
  English). The user-facing UI label stays "Notulen" (Indonesian, semi-formal
  — allowed because UI text, not identifier).
- **Rationale**: The constitution (supreme) mandates English identifiers with no
  Indonesian/mix. "notulen" is Dutch/Indonesian. The spec itself glosses it as
  "supervision note", giving the English equivalent directly. This keeps
  identifiers compliant while preserving the familiar UI term for users.
- **Reversible**: if the user prefers the literal `Notulen` model name, only
  the model class/table/relation names change; the data model and contracts
  are otherwise unaffected.

### D8. Auth & ownership model

- **Decision**: Every authenticated user is treated as a student (per spec
  assumption). A `Thesis` belongs to the logged-in `User`. Ownership is
  enforced by a model policy (`ThesisPolicy`, `ChapterPolicy`, etc.) **and**
  a global scope on `Thesis`/`Chapter` so a student's queries never return
  another student's rows (defense in depth for FR-013/SC-005). Route model
  binding loads within that scope, so a foreign `id` returns 404, not the data.
- **Rationale**: The spec makes isolation a hard requirement (SC-005 = 100%).
  Existing auth (`001-user-auth`) provides the logged-in user and Sanctum
  cookie session already used by `api.ts`.

### D9. Routes & route file

- **Decision**: New `routes/thesis.php` loaded via the `then` callback in
  `bootstrap/app.php`, under `web` + `auth` middleware and `api` prefix —
  matching the existing `auth.php`/`admin.php` pattern (stateful Sanctum).
  URL **paths** are English per the constitution: `/api/thesis`,
  `/api/thesis/{thesis}/chapters/{chapter}`, etc. SPA routes mirror them:
  `/thesis`, `/thesis/:thesisId/chapters/:chapterId`.
- **Note**: The existing app has Indonesian URL paths (`/pengaturan`,
  `/profil`) that predate the ratified constitution; new work follows the
  constitution's English-route rule.

### D10. Activity logging placement

- **Decision**: Match the existing codebase convention — `activity()` calls
  live in the **Service** (after the Action performs the DB write), using
  `spatie/laravel-activitylog` with a `thesis` log name, narrative Indonesian
  descriptions, `causedBy(request()->user())`, and `performedOn($subject)`
  (constitution Principle III + existing `UserManagementService` precedent).
- **Rationale**: The constitution permits the Action to log, but the existing
  Services already own narrative logging and that is where cross-use-case
  context (before/after) is available. Keeping it in the Service stays
  consistent with the codebase.

## Open items deferred to tasks/implementation

- Exact pandoc invocation flags (`--wrap=none`, `--markdown-headings=atx`,
  extract media to a per-version folder or drop media) — finalized in
  implementation; v1 may drop embedded media and keep text/tables/footnotes.
- Whether paraphrase "accept" creates a new `chapter_version` or edits the
  current version's Markdown in place. Spec edge case says the prior text
  remains recoverable via version history → **decision**: accepting a
  paraphrase updates the current version's Markdown **and** snapshots a new
  `chapter_version` row (lightweight, Markdown-only, `original_file_*` null
  with a `source = paraphrase` marker) so the pre-edit text is recoverable.
  Finalized in data-model.md.