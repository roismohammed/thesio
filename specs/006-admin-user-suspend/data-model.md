# Data Model: Admin User Suspend

**Feature**: `006-admin-user-suspend` | **Date**: 2026-08-30

## Entity: User (modified)

Tabel `users` — menambah satu kolom. Kolom & relasi eksisting tidak diubah.

### Fields (terkait fitur)

| Column | Type | Nullable | Default | Change | Validation |
|--------|------|----------|---------|--------|------------|
| `id` | bigint PK | no | — | existing | — |
| `name` | string | no | — | existing | — |
| `email` | string unique | no | — | existing | — |
| `is_disabled` | boolean | no | `false` | existing | — |
| `disabled_reason` | text | **yes** | `NULL` | **BARU** | required saat suspend, `string` max 500; `NULL` saat aktif |
| `password` | string hidden | no | — | existing | — |
| `remember_token` | string hidden | no | — | existing | — |
| (timestamps, email_verified_at) | | | | existing | — |

### Relations (unchanged)

- `roles` — spatie/laravel-permission (morphToMany, via `HasRoles`).
- `activities` — spatie/activitylog (`performedOn` target; event `rbac`).

### Migration

`2026_08_30_000001_add_disabled_reason_to_users_table.php` — guard `Schema::hasColumn` mengikuti pola `2026_08_03_000000_add_name_and_is_disabled_to_users_table.php`:

- `up()`: tambahkan `$table->text('disabled_reason')->nullable()` setelah `is_disabled`.
- `down()`: `dropColumn('disabled_reason')` dengan guard `Schema::hasColumn`.

### Model changes (`app/Models/User.php`)

- Attribute `#[Fillable([...])]` tambah `'disabled_reason'`.
- `casts()` — sudah cukup: string plain, tidak perlu cast.

## State Transitions

```
                suspend (alasan wajib, bukan self)
   [Aktif: is_disabled=false, disabled_reason=NULL]
     │                    ▲
     │                    │ unsuspend (tanpa input)
     ▼                    │  → is_disabled=false, disabled_reason=NULL → NULL dihapus
   [Nonaktif: is_disabled=true, disabled_reason=<text>]
```

| From | Event | To | Side effects |
|------|-------|----|--------------|
| Aktif | `POST users/{id}/suspend` (actor ≠ target) | Nonaktif | `is_disabled=true`, `disabled_reason=reason`; activity log "Menonaktifkan pengguna {name} ({email}) — alasan: {reason}." |
| Aktif | `POST users/{id}/suspend` (actor = target) | Tetap Aktif | Ditolak 422 "Anda tidak dapat menonaktifkan akun Anda sendiri."; tidak ada mutasi |
| Nonaktif | `POST users/{id}/unsuspend` | Aktif | `is_disabled=false`, `disabled_reason=NULL` (hapus alasan, FR-006); activity log "Mengaktifkan kembali pengguna {name} ({email}) — alasan penonaktifan dihapus." |
| Nonaktif | request apa pun dari sesinya (middleware) | Tetap Nonaktif | Ditolak 403; session tidak dihapus server-side, FE redirect login |
| Aktif | login | Aktif (session dibuat) | Normal |
| Nonaktif | login | Tetap Nonaktif (tanpa session) | 403 "Akun ini telah dinonaktifkan. Hubungi administrator." (eksisting) |
| Aktif/Nonaktif | `DELETE users/{id}` (actor ≠ target) | Terhapus | Alasan ikut hilang bersama baris; logout korban via middleware |

Idempotensi: suspend berulang → `disabled_reason` terakhir menimpa (Edge Case "alasan terakhir yang tersimpan"); unsuspend berulang → tidak berubah, tetap Aktif.

## Validation Rules Summary

- `SuspendUserRequest`: `reason` → `required|string|min:1|max:500` (FR-004 + Edge Case 500+ dikembalikan dengan error field).
- Pesan error validasi Indonesia (konvensi project): `reason.required => 'Alasan penonaktifan wajib diisi.'`, `reason.max => 'Alasan penonaktifan maksimal 500 karakter.'`.
- Guard self-suspend di Action (bukan Form Request) karena butuh `request()->user()` vs target.

## Audit Trail Mapping (FR-009)

| Aksi | Event | Log narrative |
|------|-------|---------------|
| Suspend | `rbac` | `"Menonaktifkan pengguna {name} ({email}) — alasan: {reason}."` |
| Unsuspend | `rbac` | `"Mengaktifkan kembali pengguna {name} ({email}) — alasan penonaktifan dihapus."` |
| Login ditolak (nonaktif) | `auth` | `"Percobaan masuk ditolak untuk akun {email} (akun dinonaktifkan)."` (eksisting) |
| Self-suspend ditolak | — | Tidak ada mutasi → tidak wajib log (opsional) |