# Phase 0 — Research & Decisions

**Feature**: 003-supervision-guide | **Date**: 2026-08-06

All spec-level ambiguities were resolved in `/speckit-clarify` (see `spec.md` → Clarifications). The remaining unknowns are technical/implementation decisions, resolved below against the real codebase.

## D1 — LLM provider: OpenRouter via the existing OpenAI-compatible client

**Decision**: Use **OpenRouter** (`https://openrouter.ai/api/v1`) as the LLM provider, reached through the already-installed `openai-php/laravel` ^0.20.0 client. No new dependency.

**Rationale**: `apps/api/config/openai.php` is already written as an OpenAI-compatible gateway config — it reads `LLM_BASE_URL`, `LLM_API_KEY`, `LLM_MODEL` (with `OPENAI_*` fallbacks) and exposes `base_uri`. The `openai-php` client supports a custom base URI (`withBaseUri()`, mirrored by the Laravel config's `base_uri` key — confirmed via the openai-php/client docs). OpenRouter is an OpenAI-compatible gateway, so pointing the existing client at it is a **configuration-only change**, not a code change. The existing `CreateParaphraseAction` already calls `OpenAI::chat()->create([...])` reading `config('openai.llm_model')` — the new guidance LLM call reuses the exact same facade/config.

**Env (`.env`)**:
```
LLM_BASE_URL=https://openrouter.ai/api/v1
LLM_API_KEY=<openrouter key>
LLM_MODEL=<e.g. openrouter/auto or a specific model id>
```

**Alternatives considered**:
- Add a dedicated OpenRouter SDK — rejected; redundant since openai-php already covers OpenAI-compatible endpoints.
- Call OpenAI directly — rejected by the user ("llm mau pakai openrouter saja").
- Introduce a new `LLM_PROVIDER` abstraction — rejected for v1; the config already abstracts the base URL, so a provider switch is env-only. If a non-OpenAI-compatible provider is ever needed, abstract then.

## D2 — Structured LLM output for the agenda

**Decision**: Request JSON output with `response_format => ['type' => 'json_object']` and a strict prompt that fixes the schema; parse + validate in PHP. Do not rely on OpenAI-style `json_schema` structured outputs.

**Rationale**: `response_format: json_object` is broadly supported across OpenRouter-routed models, whereas strict `json_schema` structured-output support varies by model. A fixed-shape JSON contract (documented in `contracts/llm.md`) + server-side validation is the portable choice. On parse/validation failure or empty result, the action treats the generation as failed (no partial guide persisted), matching FR-016.

**Schema (LLM returns)**:
```json
{
  "points": [
    {
      "title": "string",
      "description": "string",
      "chapter_id": "int|null",
      "supervision_note_id": "int|null",
      "priority": "int"
    }
  ]
}
```
- `chapter_id` / `supervision_note_id` are IDs from the prompt context; the server validates they belong to the thesis and ignores any it does not recognise.
- `priority` is an integer where **lower = more urgent** (1 = most urgent). The server re-sorts by remaining-time-to-deadline and may override/normalise priorities; the LLM's priority is advisory.

**Alternatives considered**:
- `json_schema` structured outputs — rejected (model-dependent on OpenRouter).
- Free-form text + regex parsing — rejected (brittle).

## D3 — Generation cadence (scheduled generation)

**Decision**: Schedule generation **weekly** by default via Laravel's scheduler, configurable in `config/openai.php` (new key `guidance.schedule`, default `'0 8 * * 1'` — Monday 08:00). The scheduled command iterates theses that (a) have ≥1 chapter, (b) have a set `defense_deadline_at` in the future, and (c) whose current guide is **not tailored since last generation** (skip-if-tailored, FR-018). Cadence is a planning/ops decision and stays env/config-configurable; the spec defers the exact cadence to planning.

**Rationale**: The spec defers cadence to planning; a weekly default is a safe, conservative starting point that the operator can tune. Acceleration near the deadline (e.g. daily in the final 2 weeks) is a future enhancement, noted but not built in v1 to keep scope tight.

**Alternatives considered**:
- Daily — rejected as default (noisy, LLM cost).
- Student-configurable per-thesis schedule — rejected for v1 (adds UI + config surface; defer).
- Deadline-accelerating cadence — noted as future enhancement.

## D4 — Defense deadline storage

**Decision**: Store the defense deadline as a nullable timestamp column **`defense_deadline_at` on the existing `theses` table** (new migration). Set/updated through the existing thesis update endpoint (extend `ThesisUpdateRequest`/`ThesisService` to accept `defense_deadline_at`). No separate entity.

**Rationale**: The spec says the deadline is "already determined" and is a single scalar per thesis. A column on `theses` is the KISS choice and aligns with the single-active-thesis-per-student assumption. Reading it for generation is a direct `$thesis->defense_deadline_at` access.

**Alternatives considered**:
- Separate `thesis_meta` / `defense_deadlines` entity — rejected (over-engineered for one scalar).
- Store on the `User` — rejected (deadline belongs to the thesis, not the user).

## D5 — Unread indicator ("new agenda since last visit")

**Decision**: Store **`guidance_last_viewed_at` (nullable timestamp) on `theses`** (same migration as D4). The unread state is **derived**: a guide is "unread" when the current guide's `generated_at` > `thesis.guidance_last_viewed_at`. The guidance page's "open" action updates `guidance_last_viewed_at = now`, clearing the indicator (FR-019).

**Rationale**: A single read-tracking timestamp on the thesis is the minimal data model for an unread signal; it avoids per-guide "seen" rows. It is surfaced only when the student is in the app (in-app unread), not pushed — consistent with the spec assumption that real-time push notifications are out of scope.

**Alternatives considered**:
- A `seen` boolean per guide — rejected (more rows, same signal).
- A `notifications` table — rejected (out of scope for v1; this is not a notification system).

## D6 — Skip-if-tailored guard (FR-018)

**Decision**: A guide is "tailored" if any of its points has `origin = 'student'`, or any system point has `status` changed from its initial `'pending'`/removed since generation. Tracked simply: a boolean column **`is_tailored`** on `supervision_guides` (default false), flipped to true by any tailoring Action (`AddGuidancePointAction`, `UpdateGuidancePointAction`, `DeleteGuidancePointAction`). Scheduled generation skips theses whose current guide `is_tailored = true`, leaving a `pending_adoption` flag (a nullable timestamp `adoptable_at` on theses OR simply a gentle in-app prompt computed at read time). For v1, the prompt is computed at read time (no extra column): the page shows "Ada panduan terbaru yang bisa kamu terapkan" with a Regenerate button when the current guide is tailored and the last generation is older than the schedule window.

**Rationale**: An `is_tailored` boolean is the cheapest reliable signal that the student has invested edits; the skip guard becomes a single boolean check. The "newer guidance available" prompt does not need a stored pending guide in v1 — on-demand regeneration is the adoption path, keeping the data model minimal.

**Alternatives considered**:
- Diff current guide against a stored "as-generated" snapshot — rejected (over-engineered).
- Track last-edit timestamp per point and compare to generated_at — rejected (more columns, same boolean signal suffices for v1).

## D7 — Scheduled job mechanism

**Decision**: A Laravel **Artisan command** `guidance:generate-scheduled` registered in `routes/console.php` (or `bootstrap/app.php` `withSchedule`), scheduled via `Schedule::command('guidance:generate-scheduled')->cron(config('openai.guidance.schedule'))`. The command injects `SupervisionGuideService` and loops eligible theses, calling `generateScheduled($thesis)` per thesis inside a try/catch (one thesis failure does not abort the batch; failure leaves the previous current guide intact and logs a narrative note, per FR-016). Uses the `database` queue driver default or runs synchronously — sync in v1 (simplest; queue can be added later). Each thesis run is wrapped in a DB transaction; LLM failure rolls back, no partial guide persisted.

**Rationale**: Matches Laravel 13's scheduler model and the project's existing `console.php`. Per-thesis isolation prevents one failure from blocking others. Sync execution in v1 keeps the footprint small; the command is background-run by the scheduler, not by a user request.

**Alternatives considered**:
- A queued job dispatched by a scheduled task — deferred (adds queue wiring; v1 sync is fine for tens of theses).
- A cron hitting an HTTP endpoint — rejected (exposes an internal trigger over HTTP unnecessarily).

## D8 — Frontend routing & state

**Decision**: New route `/thesis/:thesisId/guidance` in `apps/web/src/App.tsx` (under `AuthGuard`), rendered by `GuidancePage` at `features/thesis/pages/supervision-guide/index.tsx`. State via a `useSupervisionGuide(thesisId)` hook (mirrors `use-paraphrase.ts` pattern). API client in `features/thesis/api/supervision-guide.ts` using the existing `@/lib/api` helper. Types added to the existing `features/thesis/types.ts`. The thesis list/detail will get a link/card to open guidance (breadcrumb: Skripsi › Bimbingan › Panduan).

**Rationale**: Reuses the established frontend conventions (feature-based, `@/lib/api`, hook-per-concern, types in `types.ts`). The page is a separate route (not a modal) because it shows a list + history, exceeding the ≤5-field modal rule.

**Alternatives considered**:
- Embed guidance as a tab on the thesis detail — rejected (history + per-point actions need full page).
- Global state manager — rejected (local hook is sufficient; React Compiler handles memoization).