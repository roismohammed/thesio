# API Contracts: User Authentication & Role-Based Access Control

**Feature**: 001-user-auth | **Phase**: 1 | **Date**: 2026-08-03

The `apps/api` Laravel service exposes a REST/JSON API consumed by the
`apps/web` React SPA. All auth uses Sanctum SPA cookie sessions (D1):
- The SPA first calls `GET /sanctum/csrf-cookie` and then sends credentials
  with `withCredentials`.
- Protected routes require an authenticated `web`-guard session.
- Admin routes additionally require the `super admin` role
  (`role:super-admin` middleware).
- Server-side middleware is authoritative; client-side guards are UX only (D10).

Responses are JSON. Errors use Laravel's standard validation envelope
(`message`, `errors`); authorization failures return `403` with a friendly
Indonesian message; unauthenticated calls return `401`.

## Auth & session

### POST `/api/auth/register` — guest
Create a new account (open self-registration). New account defaults to the
`user` role (FR-017/018).
- Body: `{ name, email, password, password_confirmation }`
- 201: `{ data: { id, name, email, roles: ["user"] } }`
- 422: email already in use / validation errors (FR-019)
- Side effect: activity log "Mendaftarkan pengguna baru {name} ({email})."

### POST `/api/auth/login` — guest
- Body: `{ email, password }`
- 200: `{ data: { id, name, email, roles, permissions } }`
- 422: invalid credentials (generic, field-agnostic message)
- 403: account disabled (friendly message)
- Side effect: activity log "Pengguna {name} ({email}) berhasil masuk." (or
  failed-sign-in entry on bad credentials)

### POST `/api/auth/logout` — auth
- Body: none
- 204: session terminated (FR-003)
- Side effect: activity log "Pengguna {name} ({email}) keluar."

### GET `/api/auth/me` — auth
- 200: `{ data: { id, name, email, roles, permissions, is_disabled } }`
- Drives the SPA `auth-context` and `use-permission` hook (D10).

## Profile (self-service)

### GET `/api/profile` — auth
- 200: `{ data: { id, name, email } }`

### PATCH `/api/profile` — auth
- Body: `{ name, email }`
- 200: updated profile (FR-013)
- 422: email conflict / validation
- Side effect: activity log narrative for profile update.

### PATCH `/api/profile/password` — auth
- Body: `{ current_password, password, password_confirmation }`
- 200: password changed (FR-014)
- 422: current password wrong / new password invalid
- Side effect: activity log "Mengganti sandi akun sendiri."

## Password recovery (guest)

### POST `/api/forgot-password` — guest
- Body: `{ email }`
- 200: always a neutral confirmation regardless of whether the email exists
  (FR-016): `{ message: "Jika email terdaftar, tautan pemulihan telah dikirim." }`
- Side effect (only if account exists): emails a time-limited, single-use
  reset link (FR-010/011).

### POST `/api/reset-password` — guest
- Body: `{ token, email, password, password_confirmation }`
- 200: password updated (FR-012)
- 422: invalid/expired/used token, or validation error
- Side effect: activity log "Mengganti sandi lewat alur pemulihan untuk akun {email}."

## Admin — Users (auth + `role:super-admin`)

### GET `/api/admin/users` — list
- Query: `?search=&role=&disabled=&page=`
- 200: `{ data: [ { id, name, email, is_disabled, roles: [...] } ], meta: { pagination } }`

### POST `/api/admin/users` — create
- Body: `{ name, email, password, password_confirmation, roles: ["user"] }`
- 201: created user (FR-020)
- Side effect: activity log "Membuat pengguna {name} ({email}) dengan peran {roles}."

### GET `/api/admin/users/{id}` — view (FR-020)
- 200: `{ data: { id, name, email, is_disabled, roles, created_at } }`

### PATCH `/api/admin/users/{id}` — update
- Body: `{ name?, email?, password?, password_confirmation?, is_disabled?, roles? }`
- 200: updated user (FR-020, FR-021)
- 403: if the change would remove the last `super admin` role from the acting
  super admin's own account (self-lockout guard, FR-024)
- Side effect: activity log narrative (before/after for roles, disable/enable).

### DELETE `/api/admin/users/{id}` — delete (optional; disable is preferred)
- 403: if target is the acting super admin's own account (FR-024)
- 204: deleted
- Side effect: activity log "Menghapus pengguna {name} ({email})."

## Admin — Roles (auth + `role:super-admin`)

### GET `/api/admin/roles`
- 200: `{ data: [ { id, name, guard_name, permissions: [...] } ] }`

### POST `/api/admin/roles`
- Body: `{ name, permissions?: ["..."] }`
- 201: created role (FR-022)
- Side effect: activity log "Membuat peran '{name}'."

### GET `/api/admin/roles/{id}`
- 200: role detail with permissions

### PATCH `/api/admin/roles/{id}`
- Body: `{ name?, permissions?: ["..."] }` (permissions synced via
  `syncPermissions`)
- 200: updated role (FR-022)
- Side effect: activity log narrative; spatie auto-resets permission cache.

### DELETE `/api/admin/roles/{id}`
- 409: if any user still has the role (edge case — reject with friendly message)
- 204: deleted (FR-022)
- Side effect: activity log "Menghapus peran '{name}'."

## Admin — Permissions (auth + `role:super-admin`)

### GET `/api/admin/permissions`
- 200: `{ data: [ { id, name, guard_name } ] }`

### POST `/api/admin/permissions`
- Body: `{ name }`
- 201: created permission (FR-022)
- Side effect: activity log "Membuat izin '{name}'."

### DELETE `/api/admin/permissions/{id}`
- 409: if attached to any role (reject with friendly message)
- 204: deleted (FR-022)
- Side effect: activity log "Menghapus izin '{name}'."

## Cross-cutting behaviors

- **Activity log**: every mutating endpoint above records a narrative entry
  (Constitution Principle III, D7).
- **RBAC enforcement**: all `/api/admin/*` routes carry `role:super-admin`;
  a regular `user` gets `403` (FR-007/023).
- **Self-lockout guard**: revoking `super admin` from or disabling/deleting
  one's own account is rejected server-side (FR-024, D6).
- **Neutral recovery**: `/api/forgot-password` never reveals whether an email
  exists (FR-016).
- **Disabled account**: disabled users cannot log in (FR via `is_disabled`,
  D9).