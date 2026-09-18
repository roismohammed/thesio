# Data Model: User Authentication & Role-Based Access Control

**Feature**: 001-user-auth | **Phase**: 1 | **Date**: 2026-08-03

Maps the spec's Key Entities to concrete storage. RBAC tables are published by
`spatie/laravel-permission`; the audit table by `spatie/laravel-activitylog`;
`users` and `password_resets` are Laravel defaults, extended for this feature.

## Entities

### User

The authenticated person. Laravel's default `users` table, extended with
`is_disabled` and the `name` column (Laravel 13 skeleton ships without `name`
by default since it targets APIs/tokens — we add it back for profiles).

| Field | Type | Notes / Validation |
|-------|------|--------------------|
| `id` | bigint, PK | auto-increment |
| `name` | string(255) | required, max 255 — `RegisterRequest`, `StoreUserRequest`, `ProfileUpdateRequest` |
| `email` | string(255), unique | required, email format, unique — same requests |
| `email_verified_at` | timestamp, nullable | left in place; verification out of scope for v1 |
| `password` | string(255) | required, min 8, confirmed on register/reset/change — hashed by Laravel |
| `is_disabled` | boolean, default false | toggled by `DisableUserAction`; checked at sign-in |
| `remember_token` | string(100), nullable | Laravel "remember me" |
| `created_at`, `updated_at` | timestamps | — |

**Relationships**:
- `HasRoles` (spatie) → `belongsToMany Role` via `model_has_roles`
- `HasPermissions` (spatie, direct) → `belongsToMany Permission` via `model_has_permissions` (optional; roles are the primary path)
- Many `ActivityLogEntry` as `causer` and as `subject`

**State transitions**:
- `active` → (super admin disables) → `disabled` → (super admin re-enables) → `active`
- A disabled user cannot sign in (FR enforced in `AuthService`).

### Role (spatie)

A named grouping of permissions.

| Field | Type | Notes |
|-------|------|------|
| `id` | bigint, PK | — |
| `name` | string, unique per `guard_name` | required, max 255, unique — `StoreRoleRequest`, `UpdateRoleRequest` |
| `guard_name` | string, default `web` | always `web` for v1 (D2) |
| `created_at`, `updated_at` | timestamps | — |

**Relationships**:
- `belongsToMany Permission` via `role_has_permissions`
- `belongsToMany User` via `model_has_roles`

**Seed instances**: `super admin`, `user` (D4).

### Permission (spatie)

A granular capability granted to a role (and optionally directly to a user).

| Field | Type | Notes |
|-------|------|------|
| `id` | bigint, PK | — |
| `name` | string, unique per `guard_name` | required, max 255, unique — `StorePermissionRequest` |
| `guard_name` | string, default `web` | always `web` for v1 |
| `created_at`, `updated_at` | timestamps | — |

**Relationships**: `belongsToMany Role` via `role_has_permissions`.

**Seed base set** (attached to `super admin`): `manage users`, `manage roles`,
`manage permissions`. The set expands as new features add protected
capabilities.

### spatie pivot tables (published, not hand-authored)

| Table | Purpose |
|-------|---------|
| `model_has_roles` | user ↔ role (polymorphic `model_type`/`model_id`, here `User`) |
| `role_has_permissions` | role ↔ permission |
| `model_has_permissions` | user ↔ direct permission (polymorphic; optional path) |

### PasswordReset (Laravel `password_resets`)

| Field | Type | Notes |
|-------|------|------|
| `email` | string, index | — |
| `token` | string | hashed reset token |
| `created_at` | timestamp | used to compute 60-min expiry |

**State transitions**: `issued` → (`used` on successful reset | `expired` after 60 min | invalid). Single-use (FR-011).

### ActivityLogEntry (spatie `activity_log`)

| Field | Type | Notes |
|-------|------|------|
| `id` | bigint, PK | — |
| `log_name` | string, nullable | grouped log name, e.g. `auth`, `rbac` |
| `description` | text | narrative Indonesian description (D7) |
| `subject_type`, `subject_id` | string, bigint, nullable | the affected model (e.g. User, Role) |
| `causer_type`, `causer_id` | string, bigint, nullable | the acting user |
| `properties` | json | before/after values where meaningful |
| `created_at`, `updated_at` | timestamps | — |

## Validation rules summary (by Form Request)

| Form Request | Rules |
|--------------|-------|
| `LoginRequest` | `email` required|email, `password` required|string |
| `RegisterRequest` | `name` required|string|max:255, `email` required|email|unique:users,email, `password` required|string|min:8|confirmed |
| `ProfileUpdateRequest` | `name` required|string|max:255, `email` required|email|unique:users,email,{id} |
| `PasswordChangeRequest` | `current_password` required|string, `password` required|string|min:8|confirmed |
| `PasswordResetLinkRequest` | `email` required|email |
| `NewPasswordRequest` | `token` required|string, `email` required|email, `password` required|string|min:8|confirmed |
| `StoreUserRequest` | `name`, `email` (unique), `password` (min:8, confirmed), `roles` array|in:super-admin,user |
| `UpdateUserRequest` | `name`, `email` (unique ignoring self), `is_disabled` boolean, `roles` array |
| `StoreRoleRequest` | `name` required|string|max:255|unique:roles,name, `permissions` array |
| `UpdateRoleRequest` | `name` required|string|max:255|unique:roles,name,{id}, `permissions` array |
| `StorePermissionRequest` | `name` required|string|max:255|unique:permissions,name |

> Role/permission name normalization (e.g. kebab-case `super-admin` vs display
> `super admin`) is a tasks.md implementation detail; the canonical stored
> form will be decided there and applied consistently in seeders + UI.