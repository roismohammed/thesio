# Quickstart: User Authentication & Role-Based Access Control

**Feature**: 001-user-auth | **Phase**: 1 | **Date**: 2026-08-03

A manual end-to-end validation guide (no automated test suite — project
policy). Each scenario maps to a spec user story and the contracts in
`contracts/api-contracts.md`. Run these after the implementation tasks are
complete to prove the feature works.

## Prerequisites

- PHP 8.3, Composer, Bun, Node — installed.
- `apps/api/.env` copied from `.env.example`, `APP_KEY` generated, `APP_URL`
  set, `SANCTUM_STATEFUL_DOMAINS` and `CORS` allowing the SPA origin, mail
  configured (for password recovery), and `SUPER_ADMIN_*` env values set for
  the initial super admin.
- `apps/web` env points `VITE_API_URL` at the API origin.

## Setup commands (run yourself; agents do not auto-run dev servers)

```bash
# Backend
cd apps/api
composer install
cp .env.example .env          # then edit SANCTUM_STATEFUL_DOMAINS / mail / SUPER_ADMIN_*
php artisan key:generate
php artisan migrate:fresh --seed   # runs RolePermissionSeeder + SuperAdminSeeder
vendor/bin/pint                  # formatting check
php -l app/Models/User.php       # representative syntax check (do for each new file)

# Frontend
cd ../web
bun install
npx tsc --noEmit --incremental   # TS type check
bun run dev                       # start the SPA (run yourself)
```

Expected after seed: `roles` table has `super admin` and `user`; one super
admin account exists matching `SUPER_ADMIN_*` env; base permissions
(`manage users`, `manage roles`, `manage permissions`) are attached to
`super admin`.

## Validation scenarios

### S1 — Sign in & session (Story 1 / P1)
1. Open the SPA, navigate to the login page.
2. Sign in with the seeded super admin credentials.
3. **Expect**: redirected to the authenticated landing page.
4. Reload the page.
5. **Expect**: still signed in (session persists, FR-002).
6. Sign out.
7. **Expect**: session ended; protected routes redirect to login (FR-003).
8. Sign in with a wrong password.
9. **Expect**: generic, field-agnostic error (FR-001, edge case).

### S2 — Self-registration (Story 2 / P2)
1. As a logged-out visitor, go to the register page.
2. Submit name, a new email, password + confirmation.
3. **Expect**: account created and signed in with the `user` role (FR-017/018).
4. Try registering again with the same email.
5. **Expect**: friendly "email already in use" rejection (FR-019).
6. As this new `user`, attempt to open an admin URL directly.
7. **Expect**: access denied (FR-007).

### S3 — Role-based access control (Story 3 / P3)
1. Sign in as super admin → reach the admin area. **Expect**: access granted.
2. Sign in as the self-registered `user` → reach the admin area.
   **Expect**: blocked with a friendly "access denied" (FR-006/007).
3. **Expect**: exactly two roles exist in the admin role list (FR-004).

### S4 — Super admin management UI (Story 4 / P4)
1. As super admin, open User management: list/create/edit/disable users.
   **Expect** all operations work and an activity-log entry is written (FR-020).
2. Assign/revoke a role on a user → **Expect** that user's access changes
   immediately (FR-021) and a narrative log entry appears.
3. Create a new role, attach a permission, assign it to a user → **Expect** the
   user gains that permission (FR-022).
4. Try to remove `super admin` from your own account (or disable it).
   **Expect**: rejected with a friendly self-lockout message (FR-024).
5. Sign in as a regular `user` and try to open any management screen.
   **Expect**: blocked (FR-023).

### S5 — Password recovery (Story 5 / P5)
1. From the login page, choose "forgot password", enter an existing email.
2. **Expect**: neutral confirmation shown (FR-016); a reset link email arrives.
3. Open the link, set a new password.
4. **Expect**: sign in succeeds with the new password; old password fails
   (FR-010/011/012).
5. Reopen the same link.
6. **Expect**: "link no longer valid" (FR-011, single-use).
7. Submit `forgot-password` with a non-existent email.
8. **Expect**: same neutral confirmation (FR-016, no email enumeration).

### S6 — Self-service profile & change password (Story 6 / P6)
1. Sign in as any user, open Profile.
2. Edit `name`, save → **Expect** change persists across reload (FR-013).
3. Change password with the correct `current_password` → **Expect** success
   (FR-014).
4. Change password with a wrong `current_password` → **Expect** friendly
   rejection (FR-014).

## Objective checks (run after implementation)

- `php -l <file>` for every new PHP class (syntax).
- `npx tsc --noEmit --incremental` in `apps/web` (types).
- `vendor/bin/pint` in `apps/api` (formatting).
- Diff inspection against the plan's Constitution Check (Controller → Service →
  Action layering, size limits, narrative activity logs, feature-based FE
  placement, breadcrumbs, Indonesian UI text).

## Expected outcomes (mapped to Success Criteria)

- SC-001: sign-in completes in under 10s (S1).
- SC-002: valid sign-ins succeed first try (S1).
- SC-003: unauthorized admin access blocked 100% (S2 step 6, S3, S5 of S4).
- SC-004: password recovery regained in under 5 min (S5).
- SC-005: zero privilege leakage between `super admin` and `user` (S3, S4).
- SC-006: every security-relevant event logged narratively (S1, S4, S5, S6).