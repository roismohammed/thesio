# Implementation Plan: Admin User Suspend

**Branch**: `006-admin-user-suspend` | **Date**: 2026-08-30 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/006-admin-user-suspend/spec.md`

## Summary

Melengkapi manajemen pengguna super admin yang sudah ada: kolom alasan penonaktifan (`disabled_reason`) pada tabel `users`, pemblokiran sesi aktif via middleware global (semua request API user `is_disabled` ditolak 403 dengan pesan konsisten), dialog konfirmasi suspend (alasan wajib, maks 500 karakter) menggantikan toggle langsung, dialog unsuspend tanpa input yang menghapus alasan, akses API ditolak untuk self-suspend, jejak audit narrative via activity log (sudah ada, diperkaya alasan). Login sudah ditolak untuk akun disabled (FR-012 sudah terpenuhi); pekerjaan utama adalah session-revocation dan UI.

## Technical Context

**Language/Version**: PHP 8.3 (Laravel 13, `apps/api`); TypeScript 5.x (React 19 + Vite 8, `apps/web`)

**Primary Dependencies**: Laravel 13 (Eloquent, Sanctum cookie sessions, spatie/laravel-permission, spatie/laravel-activitylog), React 19 (React Compiler aktif), shadcn base-nova pada `@base-ui/react`, Tailwind v4, @hugeicons/react, react-i18next

**Storage**: SQLite (dev/test default)

**Testing**: Tidak ada unit test dalam pengerjaan project. Verifikasi via `php -l`, `npx tsc --noEmit --incremental`, dan inspeksi diff. Validasi alur end-to-end manual lewat `quickstart.md`.

**Target Platform**: Web (SPA + Laravel API), browser modern

**Project Type**: Web application (monorepo: `apps/web` SPA + `apps/api` Laravel)

**Performance Goals**: Daftar pengguna terpaginasi (15/halaman) tampil < 1 s pada skala ratusan pengguna; penolakan sesi pada request pertama setelah suspend (SC-002)

**Constraints**: Suspend/unsuspend idempoten untuk hasil akhir; tanpa notifikasi email; alasan maksimal 500 karakter; seluruh aksi destruktif wajib lewat dialog konfirmasi

**Scale/Scope**: 4 perubahan kolom/migration, 2 endpoint baru (suspend/unsuspend), 1 middleware global, 3 dialog di halaman users + refactor partials

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Layered HTTP Architecture | PASS | Endpoint baru: `UserController` → `UserManagementService` → `SuspendUserAction`/`UnsuspendUserAction`. Validasi via Form Request (`SuspendUserRequest`). Middleware hanya gate transport, bukan business logic. |
| II. Action Single Responsibility & DB Execution | PASS | Mutasi DB lewat Action (`SuspendUserAction`, `UnsuspendUserAction`). Eloquent ORM, tanpa raw SQL. Satu Action = satu unit kerja. |
| III. Narrative Activity Logging | PASS | Setiap suspend/unsuspend mencatat activity log narrative berbahasa Indonesia dengan alasan (extend pattern `DisableUserAction`). Self-suspend ditolak sebelum mutasi. |
| IV. Productivity-App Design Language | PASS | Dialog memakai komponen `components/ui/*` yang ada (`dialog`, `textarea`, `alert-dialog`, `button`); tanpa style ad-hoc. |
| V. Frontend Design Craft | PASS | Breadcrumb sudah ada dan tetap. UI text Indonesia semi-formal. Suspend dialog > modal policy check: 1 field textarea + confirm → modal sesuai aturan ≤5 field. `users/index.tsx` >300 baris → dipecah ke `partials/`. Tipe dibagi → file `types.ts`. |

## Project Structure

### Documentation (this feature)

```text
specs/006-admin-user-suspend/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
│   └── api.md           #   REST contract: suspend/unsuspend + payload users
└── tasks.md             # Phase 2 output (/speckit-tasks — NOT created here)
```

### Source Code (repository root)

```text
apps/api/
├── app/
│   ├── Actions/
│   │   ├── SuspendUserAction.php          # BARU: set is_disabled + disabled_reason + audit
│   │   └── UnsuspendUserAction.php        # BARU: clear disabled_reason + audit
│   ├── Http/
│   │   ├── Controllers/Admin/UserController.php   # + suspend()/unsuspend()
│   │   ├── Middleware/EnsureUserIsEnabled.php     # BARU: blokir sesi aktif user disabled
│   │   └── Requests/Auth/Admin/SuspendUserRequest.php  # BARU: alasan wajib, maks 500
│   ├── Models/User.php                    # + disabled_reason (fillable)
│   └── Services/UserManagementService.php # + suspend()/unsuspend() delegasi
├── bootstrap/app.php                      # append middleware EnsureUserIsEnabled (web+api group)
├── database/migrations/2026_08_30_..._add_disabled_reason_to_users_table.php  # BARU
└── routes/admin.php                       # + POST users/{user}/suspend, /unsuspend

apps/web/
└── src/features/admin/pages/users/
    ├── index.tsx                          # refactor <300 baris; hapus Switch, pakai dialog; tampilkan alasan
    ├── partials/
    │   ├── user-dialog.tsx                # DIPINDAH (create/edit) dari index.tsx
    │   └── suspend-dialog.tsx             # BARU: alasan wajib + counter 500
    └── types.ts                           # BARU: tipe AdminUser, list response (dipakai >1 file)
```

**Structure Decision**: Monorepo dua app. BE mengikuti struktur Controller → Service → Action eksisting (`apps/api`); FE mengikuti feature-based `features/admin/pages/users/` eksisting dengan `partials/` sesuai Prinsip V. Tidak ada folder baru di luar pola yang sudah ada.

## Complexity Tracking

> Tidak ada pelanggaran constitution yang perlu dijustifikasi.