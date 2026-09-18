# Implementation Plan: Supervision Guidance for Bimbingan Preparation

**Branch**: `003-supervision-guide` | **Date**: 2026-08-06 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/003-supervision-guide/spec.md`

## Summary

An LLM (OpenRouter, via the existing OpenAI-compatible `openai-php/laravel` client) generates a **bimbingan guidance agenda** for a student's active thesis, derived from the student's recorded supervision notes (notulen), the already-set defense (`sidang`) deadline, and the thesis chapters' statuses/content/references. Generation happens **on a schedule** (Laravel scheduler) and **on demand**. The agenda is a set of discussion points prioritised by remaining time to the defense; the student can tailor points (remove / mark prepared / add custom) and browse history. A background scheduled command drives automatic generation, with skip-if-tailored and deadline-passed guards. Backend follows the existing `Controller → Service → Action` layering with `OwnedByUserScope` ownership and `spatie/laravel-activitylog` narrative logging; frontend is a new page under `apps/web/src/features/thesis/`.

## Technical Context

**Language/Version**: PHP 8.3 (apps/api, Laravel 13) + TypeScript (apps/web, React 19 + Vite 8)

**Primary Dependencies**:
- Backend: `openai-php/laravel` ^0.20.0 (OpenAI-compatible client, pointed at OpenRouter via `LLM_BASE_URL`), `spatie/laravel-activitylog` ^5.0, `spatie/laravel-permission` ^8.3, Laravel scheduler.
- Frontend: React 19 (React Compiler on), Tailwind v4, shadcn "base-nova" on `@base-ui/react`, `react-router-dom`, existing `@/lib/api` fetch helper.

**Storage**: SQLite (default; `:memory:` + array drivers in tests). New tables `supervision_guides`, `guidance_points`; new columns on `theses` (`defense_deadline_at`, `guidance_last_viewed_at`).

**Testing**: No automated tests in this project (per project CLAUDE.md). Validation via `php -l`, `php artisan test` only if explicitly requested, `npx tsc --noEmit --incremental`, and the manual quickstart scenarios.

**Target Platform**: Web — Laravel API (`apps/api`) + React SPA (`apps/web`), independent apps, JSON over `api/` prefix, `auth` + ownership enforced.

**Project Type**: Web application (SPA frontend + API backend, no Inertia).

**Performance Goals**: On-demand generation returns within ~30s (LLM round-trip; SC-003). Scheduled generation is background (no user-facing latency). Agenda payload small (tens of points).

**Constraints**: Single DB action via Eloquent ORM; PHP class ≤ 300 lines, method ≤ 100 lines; React component file ≤ 300 lines; narrative activity log on every mutation; no raw SQL for single CRUD; no emoji in code/output.

**Scale/Scope**: Student-only tool; one active thesis per student; tens of guides per thesis over a thesis lifecycle. Single-tenant-per-user ownership.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|---|---|---|
| I. Layered HTTP (Controller → Service → Action) | Pass | `SupervisionGuideController` only parses HTTP + authorizes; `SupervisionGuideService` orchestrates (scheduled guards, prompt assembly, history); Actions execute single DB units (`CreateSupervisionGuideAction`, `AddGuidancePointAction`, `UpdateGuidancePointAction`, `DeleteGuidancePointAction`). LLM call is external API — kept in an infra Service (`GuidanceLlmClient`), not an Action, per "Service still valid for cross-cutting infra (external API)". |
| II. Action single responsibility & DB execution | Pass | Each Action = one use case (create guide, add point, update point, delete point). DB writes via Eloquent. `CreateSupervisionGuideAction` composes the LLM result + persists guide+points in one transaction; it calls the LLM infra Service (not a domain Service) — consistent with `002`'s `CreateParaphraseAction` calling the OpenAI facade, here abstracted behind `GuidanceLlmClient`. No Action injects a domain Service. |
| III. Narrative activity logging | Pass | Every create/update/delete of a guide or point logs via `activity('thesis')` with a narrative Indonesian description (e.g. "Membuat agenda bimbingan otomatis untuk skripsi '...' — 6 poin diskusi, deadline sidang 2026-09-30."). |
| IV. Productivity-app design language | Pass | Dense agenda list, clear point statuses, unread indicator, deadline-remaining badge, dark-mode parity. |
| V. Frontend design craft | Pass | Breadcrumb on the guidance page (Skripsi › Bimbingan › Panduan); feature-based placement: page-specific partials under `pages/supervision-guide/partials/`, shared thesis types in existing `features/thesis/types.ts`, API client in `features/thesis/api/`. UI text semi-formal friendly Indonesian; identifiers English. |

No violations. No complexity tracking entries needed.

## Project Structure

### Documentation (this feature)

```text
specs/003-supervision-guide/
├── plan.md              # This file
├── research.md          # Phase 0 — research/decisions
├── data-model.md        # Phase 1 — entities, migrations, relations
├── quickstart.md        # Phase 1 — manual validation guide
├── contracts/           # Phase 1 — API + LLM contracts
│   ├── api.md
│   └── llm.md
└── tasks.md             # Phase 2 (/speckit-tasks — NOT created here)
```

### Source Code (repository root)

```text
apps/api/
├── app/
│   ├── Models/
│   │   ├── Thesis.php                    # +defense_deadline_at, +guidance_last_viewed_at, supervisionGuides()
│   │   ├── SupervisionGuide.php          # NEW
│   │   └── GuidancePoint.php            # NEW
│   ├── Scopes/OwnedByUserScope.php       # reused (thesis.user_id) for SupervisionGuide
│   ├── Actions/Thesis/
│   │   ├── CreateSupervisionGuideAction.php   # NEW
│   │   ├── AddGuidancePointAction.php         # NEW
│   │   ├── UpdateGuidancePointAction.php      # NEW
│   │   └── DeleteGuidancePointAction.php      # NEW
│   ├── Services/Thesis/
│   │   ├── SupervisionGuideService.php   # NEW — orchestration
│   │   └── GuidanceLlmClient.php        # NEW — OpenRouter LLM call (infra)
│   ├── Http/
│   │   ├── Controllers/Thesis/SupervisionGuideController.php  # NEW
│   │   ├── Requests/Thesis/
│   │   │   ├── GenerateSupervisionGuideRequest.php  # NEW
│   │   │   ├── StoreGuidancePointRequest.php        # NEW
│   │   │   └── UpdateGuidancePointRequest.php      # NEW
│   │   └── Resources/Thesis/
│   │       ├── SupervisionGuideResource.php  # NEW
│   │       └── GuidancePointResource.php    # NEW
│   ├── Policies/
│   │   ├── SupervisionGuidePolicy.php    # NEW
│   │   └── GuidancePointPolicy.php      # NEW
│   └── Console/Commands/
│       └── GenerateScheduledSupervisionGuides.php  # NEW — scheduled job
├── database/migrations/
│   ├── 2026_08_06_000001_add_defense_deadline_and_guidance_tracking_to_theses_table.php  # NEW
│   ├── 2026_08_06_000002_create_supervision_guides_table.php   # NEW
│   └── 2026_08_06_000003_create_guidance_points_table.php      # NEW
├── config/openai.php                     # unchanged (already LLM_BASE_URL/LLM_API_KEY/LLM_MODEL)
└── routes/thesis.php                     # +supervision-guide routes

apps/web/
└── src/
    ├── App.tsx                           # +route /thesis/:thesisId/guidance
    ├── features/thesis/
    │   ├── types.ts                      # +SupervisionGuide, +GuidancePoint interfaces
    │   ├── api/
    │   │   └── supervision-guide.ts      # NEW — API client
    │   ├── hooks/
    │   │   └── use-supervision-guide.ts  # NEW
    │   └── pages/
    │       └── supervision-guide/
    │           ├── index.tsx             # NEW — GuidancePage (≤300 lines)
    │           └── partials/
    │               ├── guide-header.tsx        # NEW (deadline-remaining, unread, regenerate)
    │               ├── guidance-point-item.tsx # NEW (point row w/ status actions)
    │               ├── add-point-form.tsx     # NEW
    │               └── guide-empty-state.tsx  # NEW
    └── pages/(authenticated)/dasbor/...  # (optional entry card — not required for v1)
```

**Structure Decision**: Web-application layout (monorepo `apps/api` + `apps/web`), extending the existing `thesis` feature on both sides. No new top-level packages. Frontend follows feature-based placement: page-specific components in `pages/supervision-guide/partials/`, shared thesis types/API alongside the existing `features/thesis/` files. The LLM provider is **OpenRouter**, reached through the already-present OpenAI-compatible config — no new backend dependency.