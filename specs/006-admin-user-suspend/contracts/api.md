# API Contract: Admin User Suspend

**Feature**: `006-admin-user-suspend` | **Base**: `/api/admin` (middleware `web + auth + role:super admin`)

Semua request memakai cookie session Sanctum + header `X-XSRF-TOKEN` (mutasi). FE memanggil via `api()` wrapper (`apps/web/src/lib/api.ts`).

## Endpoint Baru

### POST /api/admin/users/{user}/suspend

Menonaktifkan pengguna dengan alasan.

**Request**:

```json
{ "reason": "Melanggar ketentuan penggunaan aplikasi." }
```

**Validation** (422 bila gagal):

| Field | Rules | Pesan |
|-------|-------|-------|
| `reason` | required, string, max:500 | `"Alasan penonaktifan wajib diisi."` / `"Alasan penonaktifan maksimal 500 karakter."` |

**Responses**:

- `200` — sukses (termasuk idempoten re-suspend dengan alasan baru; alasan terakhir yang tersimpan):

```json
{ "data": { "id": 7, "name": "Budi", "email": "budi@example.com", "is_disabled": true, "disabled_reason": "Melanggar ketentuan penggunaan aplikasi.", "roles": ["student"] } }
```

- `422` — self-suspend (guard authoritative di Action):

```json
{ "message": "Anda tidak dapat menonaktifkan akun Anda sendiri.", "errors": { "user": ["Anda tidak dapat menonaktifkan akun Anda sendiri."] } }
```

- `422` — validasi gagal (format Laravel standar `errors` per field).
- `403` — bukan super admin (middleware role, eksisting).

### POST /api/admin/users/{user}/unsuspend

Mengaktifkan kembali; menghapus alasan.

**Request**: body kosong (tanpa field).

**Responses**:

- `200` — sukses: `data` sama bentuknya, `is_disabled: false`, `disabled_reason: null` (FR-006).
- Idempoten: unsuspend pada user aktif tetap `200`.

## Endpoint Dimodifikasi

### GET /api/admin/users (existing)

Query: `search`, `role`, `disabled`, `page` — tidak berubah.

**Response `data[]` bertambah satu field**:

```json
{ "id": 7, "name": "Budi", "email": "budi@example.com", "is_disabled": true, "disabled_reason": "…|null", "roles": ["student"] }
```

`disabled_reason` hanya non-null saat `is_disabled: true` (invariant dijaga Action).

### PATCH /api/admin/users/{user} (existing — narrowed)

Field `is_disabled` **dihapus** dari validated fields → satu-satunya jalur ubah status akses adalah suspend/unsuspend (FR-010, no bypass). Update `name/email/password/roles` tidak berubah.

## Middleware Global (behavior contract, bukan endpoint)

`EnsureUserIsEnabled` (append ke grup `web` di `bootstrap/app.php`):

- User terautentikasi + `is_disabled` → **403** pada SETIAP request dari sesinya (GET maupun POST):

```json
{ "message": "Akun Anda telah dinonaktifkan. Hubungi administrator." }
```

- Termasuk `/api/auth/me` → FE `auth-context.refresh()` menangkap error, `user=null`, router redirect `/login` (FR-011, redirect rapi bukan error mentah).

## FE Contract (page-local)

`apps/web/src/features/admin/pages/users/`:

- `types.ts` — `AdminUser { id, name, email, is_disabled, disabled_reason: string | null, roles }`, `PaginationMeta`, `UserListResponse`.
- `partials/suspend-dialog.tsx` — dua mode via props:
  - Suspend: `Title "Nonaktifkan Pengguna"`, body `{name}`, `Textarea "Alasan penonaktifan"` wajib + counter `N/500`, tombol submit `Destructive` label "Nonaktifkan", **disabled sampai `reason.trim()` tidak kosong** (FR-004); char count 500 limit.
  - Unsuspend: `Title "Aktifkan Kembali Pengguna"`, tanpa input, tombol "Aktifkan Kembali".
  - Sukses → toast + reload list (`onSaved()`).
- `index.tsx` — hapus `Switch`; dropdown action dinamis per status: disabled user → "Aktifkan Kembali" (unsuspend dialog), aktif → "Nonaktifkan" (suspend dialog); "Hapus" membuka AlertDialog konfirmasi; badge Nonaktif punya Tooltip berisi `disabled_reason` (FR-003).

## Error Semantics

- Semua error JSON memakai field `message` (top-level) — FE `api()` wrapper menampilkan sebagai toast/error text apa adanya (bahasa Indonesia).
- 419 CSRF, 401 Unauthenticated, 403 role — behavior eksisting tak berubah.