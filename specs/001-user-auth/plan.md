# Implementation Plan: User Authentication & Role-Based Access Control

**Branch**: `001-user-auth` | **Date**: 2026-08-03 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/001-user-auth/spec.md`

## Summary

Deliver email + password authentication with persistent sessions for the Thesio
monorepo, spanning the Laravel 13 API (`apps/api`) and the React 19 SPA
(`apps/web`). Open self-registration creates accounts that default to the
`user` role. RBAC is implemented with `spatie/laravel-permission` (two seed
roles: `super admin`, `user`), enforced via spatie middleware on protected
routes. A full super-admin management UI lets a super admin manage users,
roles, and permissions dynamically. Password recovery, self-service profile,
and change-password flows complete the feature. Every security-relevant event
is recorded as a narrative activity log entry via `spatie/laravel-activitylog`.

The backend follows the constitution's Controller → Service → Action layering;
the frontend mirrors the existing route-group page layout under
`apps/web/src/pages/(authenticated)` and `apps/web/src/pages/(guest)`, with
shadcn base-nova components and Indonesian UI text.

## Technical Context

**Language/Version**: PHP 8.3 (`apps/api`); TypeScript (`apps/web`, React 19)

**Primary Dependencies**:
- Backend: Laravel 13, `spatie/laravel-permission` (RBAC), `spatie/laravel-activitylog` (audit), `laravel/sanctum` (SPA cookie session auth)
- Frontend: React 19 (React Compiler enabled), Vite 8, shadcn "base-nova" on `@base-ui/react`, Tailwind v4, `lucide-react`, i18n already installed

**Storage**: SQLite (default; `:memory:` + array drivers in tests). spatie permission publishes its own tables (`roles`, `permissions`, and pivots) alongside the `users` table.

**Testing**: No automated test suite (project policy — see `CLAUDE.md` + constitution). Verification via `php -l <file>` (PHP syntax), `npx tsc --noEmit --incremental` (TS type check), `vendor/bin/pint` (formatting), and diff inspection.

**Target Platform**: Linux server (Laravel API via `php artisan serve`); modern web browser (SPA).

**Project Type**: Web application — monorepo with a backend API service + a frontend SPA (two independent apps, no shared runtime contract yet).

**Performance Goals**: Sign-in completes within 10s on a stable connection; 99% of valid sign-in attempts succeed first try; password recovery end-to-end under 5 minutes (SC-001/002/004).

**Constraints**: SPA and API are separate apps — auth crosses the boundary via Sanctum SPA cookie sessions (stateful, CSRF-protected, same-domain or configured first-party CORS). Session persists across SPA reloads. Single `web` guard for v1. No OAuth/SSO, no email verification in v1. PHP class ≤ 300 lines, method ≤ 100 lines; React component file ≤ 300 lines.

**Scale/Scope**: 2 roles, 6 user stories, ~12 API endpoint groups, ~6 SPA page areas (login, register, forgot/reset password, profile, admin users/roles/permissions).

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | How this feature complies |
|-----------|--------|---------------------------|
| I. Layered HTTP Architecture (Controller → Service → Action) | PASS | Auth/admin Controllers only parse input + return responses; Services orchestrate use cases (login, registration, password reset, user/role/permission management); Actions execute each DB mutation (`CreateUserAction`, `AssignRoleAction`, `CreateRoleAction`, `AttachPermissionToRoleAction`, `UpdateProfileAction`, `ChangePasswordAction`, `DisableUserAction`, `ResetPasswordAction`). No Service called from inside an Action. |
| II. Action Single Responsibility & DB Execution | PASS | Every create/update/delete goes through an Action using Eloquent/spatie models. No raw SQL for single CRUD. One Action = one use case. |
| III. Narrative Activity Logging | PASS | `spatie/laravel-activitylog` records sign-in, sign-out, failed sign-in, password change/reset, and every role/permission/user management mutation with a narrative Indonesian description (causer, action, subject, before/after). |
| IV. Productivity-App Design Language | PASS | Admin & auth UIs follow Linear/ERPNext polish: dense, restrained, design-system-driven shadcn base-nova components, dark-mode parity, purposeful motion. |
| V. Frontend Design Craft | PASS | Route-group page layout matching the existing `apps/web/src/pages/(authenticated)` + `apps/web/src/pages/(guest)` convention: each route is a folder with a `<route>-page.tsx` entry and page-local `sections/` sub-blocks (`<block>-section.tsx`); reusable primitives stay in `src/components/ui/`, layouts in `src/components/layout/`, admin-shared components in `src/components/admin/`. Breadcrumbs on every inner page. Indonesian UI text, English i18n keys. Form rule: ≤5 fields modal, >5 fields separate page. React files ≤ 300 lines. |
| Naming (English, case per ecosystem) | PASS | All identifiers English; PHP PascalCase classes / snake_case migrations; JS/TS kebab-case files, camelCase identifiers, PascalCase types. |
| No automated tests; objective checks | PASS | Verification via `php -l`, `npx tsc --noEmit --incremental`, `vendor/bin/pint`, diff inspection — no PHPUnit/vitest authored unless user explicitly asks. |
| Size limits (PHP 300/100, React 300) | PASS | Enforced by extraction to Service/Action/Trait and route-group folders/sections/hooks. |

**Gate result**: PASS — no violations to justify. Complexity Tracking table left empty.

## Project Structure

### Documentation (this feature)

```text
specs/001-user-auth/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
│   └── api-contracts.md
└── tasks.md             # Phase 2 output (/speckit-tasks — not created here)
```

### Source Code (repository root)

```text
apps/api/                                    # Laravel 13 backend
├── app/
│   ├── Http/
│   │   ├── Controllers/
│   │   │   ├── Auth/
│   │   │   │   ├── AuthController.php            # login, logout
│   │   │   │   ├── RegisteredUserController.php  # register
│   │   │   │   ├── PasswordResetController.php   # link request + reset
│   │   │   │   └── ProfileController.php         # view/update profile, change password
│   │   │   └── Admin/
│   │   │       ├── UserController.php            # users CRUD + assign/revoke role
│   │   │       ├── RoleController.php            # roles CRUD + attach/detach permission
│   │   │       └── PermissionController.php      # permissions CRUD
│   │   └── Requests/
│   │       └── Auth/
│   │           ├── LoginRequest.php
│   │           ├── RegisterRequest.php
│   │           ├── ProfileUpdateRequest.php
│   │           ├── PasswordChangeRequest.php
│   │           ├── PasswordResetLinkRequest.php
│   │           ├── NewPasswordRequest.php
│   │           └── Admin/
│   │               ├── StoreUserRequest.php
│   │               ├── UpdateUserRequest.php
│   │               ├── StoreRoleRequest.php
│   │               ├── UpdateRoleRequest.php
│   │               └── StorePermissionRequest.php
│   ├── Services/
│   │   ├── AuthService.php
│   │   ├── RegistrationService.php
│   │   ├── ProfileService.php
│   │   ├── PasswordResetService.php
│   │   ├── UserManagementService.php
│   │   ├── RoleManagementService.php
│   │   └── PermissionManagementService.php
│   ├── Actions/
│   │   ├── CreateUserAction.php
│   │   ├── UpdateProfileAction.php
│   │   ├── ChangePasswordAction.php
│   │   ├── ResetPasswordAction.php
│   │   ├── DisableUserAction.php
│   │   ├── AssignRoleAction.php
│   │   ├── RevokeRoleAction.php
│   │   ├── CreateRoleAction.php
│   │   ├── UpdateRoleAction.php
│   │   ├── DeleteRoleAction.php
│   │   ├── CreatePermissionAction.php
│   │   ├── AttachPermissionToRoleAction.php
│   │   └── DetachPermissionFromRoleAction.php
│   ├── Models/
│   │   ├── User.php                  # HasRoles, HasActivity, MustLogAuthEvents
│   │   └── Traits/RecordsAuthEvents.php
│   └── Providers/
│       └── AppServiceProvider.php    # register spatie middleware aliases, Sanctum stateful
├── database/
│   ├── migrations/
│   │   ├── 0001_01_01_000000_create_users_table.php   # add name, is_disabled columns
│   │   └── (spatie permission published migrations)    # roles, permissions, pivots
│   └── seeders/
│       ├── RolePermissionSeeder.php  # super admin + user roles, base permissions
│       └── SuperAdminSeeder.php      # initial super-admin account
├── routes/
│   ├── auth.php                      # login/logout/register/password-reset/profile
│   └── admin.php                     # admin users/roles/permissions (role:super-admin middleware)
└── config/
    ├── permission.php                # spatie config (single web guard)
    ├── activitylog.php
    ├── sanctum.php                   # stateful domains = apps/web origin
    └── cors.php                      # first-party SPA origin

apps/web/                                    # React 19 SPA
├── src/
│   ├── pages/
│   │   ├── (guest)/                         # route group: public auth pages (GuestLayout wrapper, card-centered)
│   │   │   ├── login/
│   │   │   │   └── login-page.tsx
│   │   │   ├── register/
│   │   │   │   └── register-page.tsx
│   │   │   ├── forgot-password/
│   │   │   │   └── forgot-password-page.tsx
│   │   │   └── reset-password/
│   │   │       └── reset-password-page.tsx
│   │   └── (authenticated)/                 # route group: AppLayout applied page-level, client role-guarded
│   │       ├── profile/
│   │       │   ├── profile-page.tsx
│   │       │   └── sections/                # page-local sub-blocks (profile form, change password)
│   │       ├── access-denied/
│   │       │   └── access-denied-page.tsx   # shown when a logged-in user lacks a required role
│   │       └── admin/                       # admin area (role-guarded)
│   │           ├── admin-page.tsx           # admin landing (links to users/roles/permissions)
│   │           ├── users/
│   │           │   ├── users-page.tsx
│   │           │   └── sections/            # user form, role assign, disable toggle
│   │           ├── roles/
│   │           │   ├── roles-page.tsx
│   │           │   └── sections/            # role form, permission attach/detach
│   │           └── permissions/
│   │               ├── permissions-page.tsx
│   │               └── sections/            # permission form, in-use delete guard
│   ├── components/
│   │   ├── layout/                          # AppLayout, GuestLayout, nav (existing)
│   │   ├── auth/                            # auth-shared components (route guard)
│   │   ├── admin/                           # admin-shared components (user table, role picker)
│   │   └── ui/                              # reusable cross-feature primitives (shadcn base-nova)
│   ├── hooks/
│   │   ├── use-auth.ts                      # current-user + auth state
│   │   └── use-permission.ts                # hasRole/hasPermission client guards
│   ├── lib/
│   │   ├── api.ts                           # fetch wrapper with CSRF + credential handling
│   │   └── auth-context.tsx                 # current-user + permission providers
│   ├── i18n/locales/                        # auth + admin i18n keys (id/en, existing structure)
│   └── App.tsx                              # route declarations: (guest) + (authenticated) groups
└── ...
```

**Structure Decision**: Web-application layout matching the existing monorepo — `apps/api` (Laravel) for the backend service and `apps/web` (React SPA) for the frontend. Backend uses the constitution's Controller → Service → Action layering with Form Request validation. Frontend mirrors the existing `apps/web/src/pages/(authenticated)` and `apps/web/src/pages/(guest)` route-group layout already used by `dasbor` and `pengaturan`: each route is a folder containing a `<route>-page.tsx` entry plus page-local `sections/` (`<block>-section.tsx`). Public auth pages (login, register, forgot/reset password) live under `(guest)` wrapped by `GuestLayout`; profile, access-denied, and admin pages (admin landing + users/roles/permissions) live under `(authenticated)/admin/` with `AppLayout` applied page-level and client role guards (`components/auth/route-guard.tsx`). Reusable primitives stay in `components/ui/`, layouts in `components/layout/`, and admin-shared components in `components/admin/`, per Constitution Principle V.

## Complexity Tracking

> No Constitution Check violations — table intentionally empty.

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| — | — | — |