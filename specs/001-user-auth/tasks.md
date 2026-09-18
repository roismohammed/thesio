# Tasks: User Authentication & Role-Based Access Control

**Input**: Design documents from `/specs/001-user-auth/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/api-contracts.md, quickstart.md

**Tests**: None. Project policy prohibits authoring automated tests (PHPUnit/vitest) unless the user explicitly asks. Verification is via `php -l`, `npx tsc --noEmit --incremental`, `vendor/bin/pint`, diff inspection, and the manual `quickstart.md` scenarios.

**Organization**: Tasks grouped by user story (P1→P6) so each story is independently implementable and testable. Backend follows Controller → Service → Action layering; frontend follows feature-based placement with shadcn base-nova components, Indonesian UI text via i18n (English keys, Indonesian values), and breadcrumbs on every inner page.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[Story]**: Which user story this task belongs to (US1–US6)
- All file paths are repo-relative

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Install dependencies and publish package assets for `apps/api`.

- [X] T001 Install backend dependencies in apps/api via composer: `spatie/laravel-permission`, `spatie/laravel-activitylog`, `laravel/sanctum`
- [X] T002 [P] Publish spatie/laravel-permission assets (migration + config) in apps/api via `php artisan vendor:publish --provider="Spatie\Permission\PermissionServiceProvider"`
- [X] T003 [P] Publish spatie/laravel-activitylog assets (migration + config) in apps/api via `php artisan vendor:publish --provider="Spatie\Activitylog\ActivitylogServiceProvider"`
- [X] T004 [P] Configure apps/api/.env from .env.example: `APP_URL`, `SANCTUM_STATEFUL_DOMAINS` (apps/web origin), mail driver, and `SUPER_ADMIN_NAME` / `SUPER_ADMIN_EMAIL` / `SUPER_ADMIN_PASSWORD`

**Checkpoint**: Dependencies installed and package assets published.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core backend + frontend infrastructure that MUST be complete before ANY user story.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

### Backend foundational

- [X] T005 [P] Configure spatie permission for single `web` guard (teams=false, default guard=web) in apps/api/config/permission.php
- [X] T006 [P] Register spatie middleware aliases (`role`, `permission`, `role_or_permission`) in apps/api/bootstrap/app.php
- [X] T007 [P] Configure Sanctum stateful domains and CORS for the apps/web origin (supports_credentials=true) in apps/api/config/sanctum.php and apps/api/config/cors.php
- [X] T008 [P] Configure activitylog in apps/api/config/activitylog.php (default log name, subject/causer fields)
- [X] T009 Create migration to add `name` (string, nullable for existing rows) and `is_disabled` (boolean, default false) columns to the `users` table in apps/api/database/migrations/2026_08_03_000000_add_name_and_is_disabled_to_users_table.php
- [X] T010 Update User model: add `HasRoles` trait, `$fillable` (`name`, `email`, `password`, `is_disabled`), and `is_disabled` boolean cast in apps/api/app/Models/User.php
- [X] T011 [P] Create RecordsAuthEvents trait (narrative activity log helpers for sign-in / sign-out / failed-sign-in) in apps/api/app/Models/Traits/RecordsAuthEvents.php
- [X] T012 Create RolePermissionSeeder: call `forgetCachedPermissions()`, create `super admin` + `user` roles, create base permissions (`manage users`, `manage roles`, `manage permissions`) and attach to `super admin`, in apps/api/database/seeders/RolePermissionSeeder.php
- [X] T013 [P] Create SuperAdminSeeder: create the initial super-admin account from `SUPER_ADMIN_*` env values and assign `super admin` role, in apps/api/database/seeders/SuperAdminSeeder.php
- [X] T014 Register RolePermissionSeeder and SuperAdminSeeder in apps/api/database/seeders/DatabaseSeeder.php
- [X] T015 Register route files `routes/auth.php` and `routes/admin.php` (web middleware + stateful Sanctum) in apps/api/bootstrap/app.php

### Frontend foundational

- [X] T016 [P] Create API client with Sanctum CSRF-cookie prefetch and `withCredentials` in apps/web/src/lib/api.ts
- [X] T017 [P] Create auth context provider (current user + roles/permissions, login/logout/refresh) in apps/web/src/lib/auth-context.tsx
- [X] T018 [P] Create `use-permission` hook (`hasRole`, `hasPermission`) in apps/web/src/hooks/use-permission.ts
- [X] T019 Extend existing route groups (guest / auth / admin) with client-side guards wired to the auth context in apps/web/src/routes/

**Checkpoint**: Foundation ready — `php artisan migrate:fresh --seed` produces two roles, base permissions, and one super admin; SPA can reach the API with CSRF cookies. User story implementation can now begin.

---

## Phase 3: User Story 1 - Sign In & Session (Priority: P1) 🎯 MVP

**Goal**: A registered user signs in, stays signed in across reloads, and signs out; invalid credentials show a field-agnostic error.

**Independent Test**: Sign in with the seeded super admin, reload to confirm session survival, sign out, then confirm protected routes redirect to login. (quickstart S1)

### Implementation for User Story 1

- [X] T020 [P] [US1] Create LoginRequest (`email` required|email, `password` required|string) in apps/api/app/Http/Requests/Auth/LoginRequest.php
- [X] T021 [US1] Implement AuthService (`login`, `logout`, reject disabled accounts, log success/failed via RecordsAuthEvents) in apps/api/app/Services/AuthService.php
- [X] T022 [US1] Implement AuthController (`login`, `logout`, `me` — returns user + roles + permissions) in apps/api/app/Http/Controllers/Auth/AuthController.php
- [X] T023 [US1] Add login / logout / me routes in apps/api/routes/auth.php
- [X] T024 [P] [US1] Build login page UI (form, friendly field-agnostic error, i18n keys, breadcrumb-free guest page) in apps/web/src/features/auth/pages/login/index.tsx
- [X] T025 [P] [US1] Create `use-auth` hook (call /api/auth/me, expose user + sign-in/out) in apps/web/src/features/auth/hooks/use-auth.ts
- [X] T026 [US1] Wire login form to /api/auth/login (CSRF via api.ts), populate auth context on success, redirect to intended/landing route, in apps/web/src/features/auth/pages/login/index.tsx and apps/web/src/lib/auth-context.tsx
- [X] T027 [US1] Add unauthenticated-redirect + access-denied handling to the auth route guard in apps/web/src/routes/

**Checkpoint**: User Story 1 fully functional and independently testable — this is the MVP slice.

---

## Phase 4: User Story 2 - Self-Registration (Priority: P2)

**Goal**: A visitor self-registers from a public page; new accounts default to the `user` role; duplicate emails are rejected.

**Independent Test**: Register a brand-new account, sign in, and confirm it cannot reach admin areas. (quickstart S2)

### Implementation for User Story 2

- [X] T028 [P] [US2] Create RegisterRequest (`name`, unique `email`, `password` min:8 confirmed) in apps/api/app/Http/Requests/Auth/RegisterRequest.php
- [X] T029 [P] [US2] Implement CreateUserAction (persist user via Eloquent, hash password) in apps/api/app/Actions/CreateUserAction.php
- [X] T030 [P] [US2] Implement AssignRoleAction (assign a role to a user via spatie, log narrative) in apps/api/app/Actions/AssignRoleAction.php
- [X] T031 [US2] Implement RegistrationService (orchestrate CreateUserAction then AssignRoleAction with `user` role, log registration) in apps/api/app/Services/RegistrationService.php
- [X] T032 [US2] Implement RegisteredUserController (`store`) in apps/api/app/Http/Controllers/Auth/RegisteredUserController.php
- [X] T033 [US2] Add register route in apps/api/routes/auth.php
- [X] T034 [P] [US2] Build register page UI (name/email/password/confirmation, duplicate-email friendly error, i18n) in apps/web/src/features/auth/pages/register/index.tsx
- [X] T035 [US2] Wire register form to /api/auth/register, auto sign-in or redirect to login on success, in apps/web/src/features/auth/pages/register/index.tsx

**Checkpoint**: User Stories 1 and 2 both work independently.

---

## Phase 5: User Story 3 - Role-Based Access Control (Priority: P3)

**Goal**: Protected admin areas require `super admin`; regular `user` role is blocked with a friendly access-denied state; exactly two roles exist.

**Independent Test**: Sign in as super admin (admin reachable) and as `user` (admin blocked, access-denied shown). (quickstart S3)

### Implementation for User Story 3

- [X] T036 [US3] Create admin route group with `role:super-admin` middleware in apps/api/routes/admin.php
- [X] T037 [P] [US3] Add a simple admin index endpoint `GET /api/admin` (returns ok + counts) to prove protection in apps/api/app/Http/Controllers/Admin/AdminController.php
- [X] T038 [US3] Add client-side role guard + access-denied page in apps/web/src/routes/ and apps/web/src/features/auth/pages/access-denied/index.tsx
- [X] T039 [US3] Build admin landing page (breadcrumb root→Admin, links to users/roles/permissions) in apps/web/src/features/admin/pages/index.tsx

**Checkpoint**: RBAC enforcement works server-side and client-side for all three stories.

---

## Phase 6: User Story 4 - Super Admin Management UI (Priority: P4)

**Goal**: A super admin manages users (CRUD + disable + role assign/revoke), roles (CRUD + permission attach/detach), and permissions (create/delete) through the UI; regular users are blocked; self-lockout is prevented; every mutation is logged.

**Independent Test**: As super admin, create a role, attach a permission, assign it to a user, confirm access changes; try self-lockout (rejected); as `user`, confirm screens blocked. (quickstart S4)

### Implementation for User Story 4 — Backend

- [X] T040 [P] [US4] Create StoreUserRequest and UpdateUserRequest in apps/api/app/Http/Requests/Auth/Admin/
- [X] T041 [P] [US4] Create StoreRoleRequest, UpdateRoleRequest, and StorePermissionRequest in apps/api/app/Http/Requests/Auth/Admin/
- [X] T042 [P] [US4] Implement DisableUserAction (toggle `is_disabled`, self-lockout guard, narrative log) in apps/api/app/Actions/DisableUserAction.php
- [X] T043 [P] [US4] Implement RevokeRoleAction (remove role from user, self-lockout guard when removing last `super admin` from self, narrative log) in apps/api/app/Actions/RevokeRoleAction.php
- [X] T044 [P] [US4] Implement CreateRoleAction, UpdateRoleAction, DeleteRoleAction (reject delete if in use) in apps/api/app/Actions/
- [X] T045 [P] [US4] Implement CreatePermissionAction, AttachPermissionToRoleAction, DetachPermissionFromRoleAction in apps/api/app/Actions/
- [X] T046 [US4] Implement UserManagementService (list/create/update/disables users, assign/revoke roles via Actions) in apps/api/app/Services/UserManagementService.php
- [X] T047 [US4] Implement RoleManagementService (CRUD roles, sync permissions via Actions) in apps/api/app/Services/RoleManagementService.php
- [X] T048 [US4] Implement PermissionManagementService (list/create/delete permissions via Actions, reject delete if attached) in apps/api/app/Services/PermissionManagementService.php
- [X] T049 [US4] Implement Admin/UserController in apps/api/app/Http/Controllers/Admin/UserController.php
- [X] T050 [US4] Implement Admin/RoleController in apps/api/app/Http/Controllers/Admin/RoleController.php
- [X] T051 [US4] Implement Admin/PermissionController in apps/api/app/Http/Controllers/Admin/PermissionController.php
- [X] T052 [US4] Add admin users / roles / permissions routes in apps/api/routes/admin.php

### Implementation for User Story 4 — Frontend

- [X] T053 [P] [US4] Build admin users page + partials (list with search/role filter, create/edit modal ≤5 fields, role assign, disable toggle, breadcrumb) in apps/web/src/features/admin/pages/users/
- [X] T054 [P] [US4] Build admin roles page + partials (list, create/edit modal, permission attach/detach, breadcrumb) in apps/web/src/features/admin/pages/roles/
- [X] T055 [P] [US4] Build admin permissions page + partials (list, create, delete with in-use guard, breadcrumb) in apps/web/src/features/admin/pages/permissions/
- [X] T056 [US4] Wire admin users/roles/permissions pages to their API endpoints with optimistic refresh + friendly error toasts in apps/web/src/features/admin/pages/

**Checkpoint**: Full management UI operational; RBAC model editable without code.

---

## Phase 7: User Story 5 - Password Recovery (Priority: P5)

**Goal**: A user requests a recovery link by email; the link is time-limited and single-use; resetting sets a new password; non-existent emails get a neutral confirmation.

**Independent Test**: Request a link, follow it, set a new password, confirm it works and the old one fails; reopen the link (invalid); request with a fake email (same neutral confirmation). (quickstart S5)

### Implementation for User Story 5

- [X] T057 [P] [US5] Create PasswordResetLinkRequest and NewPasswordRequest in apps/api/app/Http/Requests/Auth/
- [X] T058 [P] [US5] Customize ResetPassword notification (Indonesian text, link points to the SPA reset page) in apps/api/app/Notifications/ResetPasswordNotification.php
- [X] T059 [US5] Implement PasswordResetService (Laravel broker, send link, reset password, neutral response for unknown email, narrative log) in apps/api/app/Services/PasswordResetService.php
- [X] T060 [US5] Implement PasswordResetController (`store` link request, `store` reset) in apps/api/app/Http/Controllers/Auth/PasswordResetController.php
- [X] T061 [US5] Add forgot-password + reset-password routes in apps/api/routes/auth.php
- [X] T062 [P] [US5] Build forgot-password page UI (email field, neutral confirmation, i18n) in apps/web/src/features/auth/pages/forgot-password/index.tsx
- [X] T063 [P] [US5] Build reset-password page UI (token via route param, new password + confirmation, expired-link state, i18n) in apps/web/src/features/auth/pages/reset-password/index.tsx
- [X] T064 [US5] Wire both pages to /api/forgot-password and /api/reset-password with neutral UX and post-reset redirect to login in apps/web/src/features/auth/pages/

**Checkpoint**: Password recovery works end-to-end.

---

## Phase 8: User Story 6 - Self-Service Profile & Change Password (Priority: P6)

**Goal**: An authenticated user views/edits their profile and changes their password after confirming the current one.

**Independent Test**: Sign in, edit profile (persists on reload), change password with correct current password (succeeds) and wrong current password (rejected). (quickstart S6)

### Implementation for User Story 6

- [X] T065 [P] [US6] Create ProfileUpdateRequest and PasswordChangeRequest (`current_password`, `password` min:8 confirmed) in apps/api/app/Http/Requests/Auth/
- [X] T066 [P] [US6] Implement UpdateProfileAction and ChangePasswordAction (verify current password, hash new, narrative log) in apps/api/app/Actions/
- [X] T067 [US6] Implement ProfileService (view, update profile, change password via Actions) in apps/api/app/Services/ProfileService.php
- [X] T068 [US6] Implement ProfileController (`show`, `update`, `password update`) in apps/api/app/Http/Controllers/Auth/ProfileController.php
- [X] T069 [US6] Add profile routes (GET/PATCH /profile, PATCH /profile/password) in apps/api/routes/auth.php
- [X] T070 [P] [US6] Build profile page + partials (profile edit form, change-password form, breadcrumb root→Profile) in apps/web/src/features/profile/pages/profile/
- [X] T071 [US6] Wire profile page to API with success/error feedback in apps/web/src/features/profile/pages/profile/

**Checkpoint**: All six user stories independently functional.

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Verification and consistency across all stories.

- [X] T072 [P] Run `php -l <file>` syntax check on every new PHP file in apps/api/app and apps/api/database
- [X] T073 [P] Run `npx tsc --noEmit --incremental` in apps/web (type check)
- [X] T074 [P] Run `vendor/bin/pint` in apps/api (formatting)
- [X] T075 Verify breadcrumbs on every inner page (profile + all admin pages) reflect root→active hierarchy
- [X] T076 Verify dark-mode parity (`.dark` variant) on all new surfaces
- [X] T077 Verify all UI text uses i18n keys (English keys, Indonesian values) across auth/profile/admin
- [X] T078 Run the quickstart.md validation scenarios S1–S6 end-to-end and confirm all Success Metrics SC-001…SC-006

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately.
- **Foundational (Phase 2)**: Depends on Setup — BLOCKS all user stories.
- **User Stories (Phases 3–8)**: All depend on Foundational completion.
  - Recommended order: P1 → P2 → P3 → P4 → P5 → P6 (priority order).
  - US3 (RBAC enforcement) should land before US4 (management UI) so the admin area is protected before it is built.
- **Polish (Phase 9)**: Depends on all desired user stories being complete.

### User Story Dependencies

- **US1 (P1)**: After Foundational. No story dependencies. (MVP)
- **US2 (P2)**: After Foundational. Reuses `AssignRoleAction` (created here) — later reused by US4.
- **US3 (P3)**: After Foundational + US1 (needs auth + `me` for client guard). No dependency on US2.
- **US4 (P4)**: After Foundational + US3 (admin route group + guards must exist). Reuses `AssignRoleAction`/`RevokeRoleAction`.
- **US5 (P5)**: After Foundational + US1. Independent of US2–US4.
- **US6 (P6)**: After Foundational + US1. Independent of US2–US5.

### Within Each User Story

- Form Requests and Actions ([P]) before Services.
- Services before Controllers.
- Controllers before route wiring.
- Backend before frontend wiring for the same flow.
- Story complete before moving to next priority.

### Shared-file sequencing (avoid [P] conflicts)

- `routes/auth.php` is edited in US1, US2, US5, US6 — sequence these; do not parallelize across stories on this file.
- `routes/admin.php` is edited in US3 then US4 — sequence US4 after US3.
- `apps/web/src/lib/auth-context.tsx` is touched in Foundational and refined in US1 — sequence US1 after Foundational.
- `bootstrap/app.php` is touched only in Foundational (T006, T015) — no later story edits it.

### Parallel Opportunities

- All Setup tasks marked [P] (T002–T004) run in parallel.
- All Foundational tasks marked [P] (T005–T008, T011, T013, T016–T018) run in parallel within Phase 2.
- Within a story, [P]-marked Form Requests and Actions (different files) run in parallel.
- Across stories, BE and FE for *different* stories can be parallelized by different developers once Foundational is done (mind the shared-file rules above).

---

## Parallel Example: User Story 4 (Backend)

```bash
# Launch all Form Requests together:
Task: "Create StoreUserRequest and UpdateUserRequest in apps/api/app/Http/Requests/Auth/Admin/"
Task: "Create StoreRoleRequest, UpdateRoleRequest, StorePermissionRequest in apps/api/app/Http/Requests/Auth/Admin/"

# Launch all independent Actions together:
Task: "Implement DisableUserAction in apps/api/app/Actions/DisableUserAction.php"
Task: "Implement RevokeRoleAction in apps/api/app/Actions/RevokeRoleAction.php"
Task: "Implement CreateRoleAction, UpdateRoleAction, DeleteRoleAction in apps/api/app/Actions/"
Task: "Implement CreatePermissionAction, AttachPermissionToRoleAction, DetachPermissionFromRoleAction in apps/api/app/Actions/"
```

---

## Implementation Strategy

### MVP First (User Story 1 only)

1. Complete Phase 1: Setup.
2. Complete Phase 2: Foundational (CRITICAL — blocks all stories).
3. Complete Phase 3: User Story 1 (sign in / session / sign out).
4. **STOP and VALIDATE**: run quickstart S1.
5. Demo/deploy if ready.

### Incremental Delivery

1. Setup + Foundational → foundation ready.
2. + US1 (MVP) → validate S1.
3. + US2 (registration) → validate S2.
4. + US3 (RBAC enforcement) → validate S3.
5. + US4 (management UI) → validate S4.
6. + US5 (password recovery) → validate S5.
7. + US6 (profile + change password) → validate S6.
8. Polish (Phase 9) → full quickstart + success criteria.

### Parallel Team Strategy

With multiple developers after Foundational:
- Developer A: US1 → US3 → US4 (auth + admin BE/FE).
- Developer B: US2 → US5 → US6 (registration, recovery, profile).
- Coordinate the shared `routes/auth.php` edits sequentially.

---

## Notes

- [P] tasks = different files, no dependencies on incomplete tasks.
- [Story] label maps a task to its user story for traceability.
- No automated test tasks — verification via `php -l`, `npx tsc --noEmit --incremental`, `vendor/bin/pint`, diff inspection, and `quickstart.md` scenarios.
- Commit after each task or logical group; follow Conventional Commits with no AI attribution.
- Stop at any checkpoint to validate a story independently.