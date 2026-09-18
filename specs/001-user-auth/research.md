# Research: User Authentication & Role-Based Access Control

**Feature**: 001-user-auth | **Phase**: 0 | **Date**: 2026-08-03

All `NEEDS CLARIFICATION` items were resolved during `/speckit-specify` (open
self-registration + full super-admin management UI). This document records the
technical decisions for each dependency/integration, grounded in the
`spatie/laravel-permission` v7 docs (fetched via Context7) and standard
Laravel/Sanctum practice.

## D1 — Authentication transport: Sanctum SPA cookie sessions

**Decision**: Use `laravel/sanctum` SPA cookie-session authentication
(stateful middleware, CSRF tokens, `withCredentials` on the SPA fetch client).

**Rationale**: `apps/web` (React SPA) and `apps/api` (Laravel) are separate
first-party apps with no shared runtime contract. Sanctum's SPA cookie flow is
the Laravel-native way to give a browser SPA a persistent, CSRF-protected
session that survives reloads — matching FR-002 and SC-001 without managing
bearer tokens in `localStorage` (which is more exposed to XSS).

**Alternatives considered**:
- Sanctum API tokens (bearer): stateless, good for mobile/3rd-party, but
  overkill and less safe for a first-party browser SPA.
- JWT: non-Laravel-native; reinvents session/revocation that Laravel + Sanctum
  already provide.

**Key setup points** (deferred to tasks.md): `config/sanctum.php` `stateful`
domains include the SPA origin; `config/cors.php` allows the SPA origin with
`supports_credentials = true`; SPA calls `/sanctum/csrf-cookie` first, then
posts credentials with `withCredentials`. The `web` guard is the auth guard.

## D2 — Guard strategy: single `web` guard

**Decision**: One guard (`web`) for v1. All spatie roles and permissions are
created with the `web` guard (default). No API-token guard, no multi-guard.

**Rationale**: The SPA authenticates through Sanctum's cookie session, which
uses the `web` guard. There is no second consumer (mobile/3rd-party API) yet,
so a second guard adds complexity without value. FR-005 is satisfied with one
guard.

**Alternatives considered**: separate `api` guard with token-based permissions
— rejected for v1 (out of scope per assumptions).

**spatie implication**: when creating roles/permissions in seeders and the
management UI, omit `guard_name` so they bind to the default `web` guard (per
spatie v7 docs: "If no guard is specified, the first guard in `auth.guards`
config will be used").

## D3 — Middleware aliases: register in `bootstrap/app.php`

**Decision**: Register spatie's middleware aliases in `bootstrap/app.php`
(Laravel 11+ bootstrap style, used by Laravel 13):

```php
->withMiddleware(function (Middleware $middleware) {
    $middleware->alias([
        'role' => \Spatie\Permission\Middleware\RoleMiddleware::class,
        'permission' => \Spatie\Permission\Middleware\PermissionMiddleware::class,
        'role_or_permission' => \Spatie\Permission\Middleware\RoleOrPermissionMiddleware::class,
    ]);
})
```

**Rationale**: Direct from spatie v7 docs. Protects admin routes via
`role:super-admin` (FR-006/007/023). Middleware is the server-side source of
truth; client-side guards are a UX layer only.

## D4 — Seeding roles, permissions, and the initial super admin

**Decision**: Two seeders run at setup:
1. `RolePermissionSeeder` — creates the `super admin` and `user` roles plus a
   minimal base permission set (e.g. `manage users`, `manage roles`,
   `manage permissions` attached to `super admin`).
2. `SuperAdminSeeder` — creates the initial super-admin account from env
   credentials (`SUPER_ADMIN_NAME`, `SUPER_ADMIN_EMAIL`,
   `SUPER_ADMIN_PASSWORD`) and assigns the `super admin` role.

**Rationale**: The system must never start role-less or admin-less (assumption
in spec). The seeder is the bootstrap path; everything afterwards is managed
via the UI or self-registration.

**spatie cache note**: the seeder MUST call
`app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions()`
before creating roles/permissions, per spatie v7 docs, to avoid stale-cache
seeding bugs.

## D5 — Open self-registration default role

**Decision**: `RegistrationService` orchestrates: `CreateUserAction` persists
the user, then `AssignRoleAction` assigns the `user` role. No self-registered
account ever receives `super admin`.

**Rationale**: FR-018 — new accounts default to `user`, so they cannot reach
administrative areas. Splitting create + assign as two Actions keeps each
single-responsibility and lets the management UI reuse `AssignRoleAction`.

## D6 — Self-lockout guard for the super admin

**Decision**: The super admin cannot remove their own `super admin` role or
disable their own account (FR-024). Enforced in `RevokeRoleAction` and
`DisableUserAction` (and the corresponding services) by comparing the target
user id with the authenticated user id when the target's only `super admin`
role would be removed.

**Rationale**: Prevents the last super admin from locking themselves out and
stranding the system without any administrator. The check lives in the
Action/Service (not just the UI) so API-direct calls cannot bypass it.

## D7 — Narrative activity logging

**Decision**: Use `spatie/laravel-activitylog` `activity()` helper. Auth
events (sign-in, sign-out, failed sign-in, password change, password reset)
and every management mutation (create/update/disable user, assign/revoke role,
create/update/delete role, create permission, attach/detach permission) record
a narrative Indonesian description with causer, action, subject, and
before/after values where meaningful.

**Examples**:
- "Pengguna Budi (budi@example.com) berhasil masuk."
- "Menambahkan peran 'editor' kepada pengguna Sari (id: 7)."
- "Menghapus peran 'editor' dari pengguna Sari (id: 7)."
- "Mengganti sandi lewat alur pemulihan untuk akun budi@example.com."

**Rationale**: Constitution Principle III. Activity logs are read by humans;
narrative entries keep the audit trail legible.

## D8 — Password recovery via Sanctum stateful SPA

**Decision**: Use Laravel's built-in password broker + `ResetPassword`
notification, exposed through two API endpoints (request link, submit reset).
The reset link is the standard signed, time-limited, single-use token link
(default 60-minute expiry). Recovery requests return a neutral confirmation
regardless of whether the email exists (FR-016).

**Rationale**: Reuses hardened Laravel primitives (FR-010/011/012). Mail
transport must be configured in the deployment environment (assumption).

## D9 — Disabled-account flag

**Decision**: Add an `is_disabled` boolean column to `users` (default false).
`AuthService` rejects sign-in for disabled accounts with a friendly message.
The super admin toggles it via `DisableUserAction` (a re-enable is the same
flag flipped).

**Rationale**: Covers the "disabled/deactivated account attempts to sign in"
edge case without deleting accounts (preserves audit history).

## D10 — Client-side permission helpers

**Decision**: `apps/web` keeps an `auth-context` with the current user's
roles/permissions (fetched from a `/api/me`-style endpoint, refreshed on
login/logout). A `use-permission` hook exposes `hasRole` / `hasPermission`
for hiding UI; route groups use a client-side guard that redirects to an
access-denied state. Server-side `role`/`permission` middleware remains the
authoritative enforcement.

**Rationale**: Hiding unauthorized UI reduces friction (SC-003 "friendly
access-denied"), but client checks are never the security boundary — the
middleware is.

## D11 — Role/permission management CRUD via spatie API

**Decision**: The admin UI calls endpoints that map to spatie's API:
`Role::create`/`update`/`delete`, `Permission::create`/`delete`,
`$role->givePermissionTo()` / `syncPermissions()`, `$user->assignRole()` /
`$user->removeRole()`. Each mutation is wrapped in an Action (one use case =
one Action) and logged (D7). spatie auto-resets its permission cache on these
operations (per v7 docs), so no manual `permission:cache-reset` is needed for
runtime mutations.

**Rationale**: Reuses spatie's tested CRUD rather than reimplementing RBAC
logic, while keeping the constitution's Action layering and audit trail.

## D12 — Verification approach (no automated tests)

**Decision**: Per project policy, no PHPUnit/vitest suites are authored.
Objective checks: `php -l <file>` for every new PHP file, `npx tsc
--noEmit --incremental` for the SPA, `vendor/bin/pint` for formatting, plus the
manual end-to-end scenarios in `quickstart.md`.

**Rationale**: Constitution + `CLAUDE.md` explicitly prohibit authoring
automated tests unless the user asks. `quickstart.md` is the validation guide.