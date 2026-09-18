# Data Model: Subscription Plans & Payments

**Branch**: `007-subscription-plans` | **Date**: 2026-08-31 | **Spec**: [spec.md](./spec.md) | **Research**: [research.md](./research.md)

Entitas memakai konvensi Eloquent (snake_case tabel/kolom). Semua mutation DB via Action (konstitusi P-II). Relasi permission memakai tabel spatie `permissions` yang sudah ada (guard `web`).

## Entity: Plan

Mewakili satu paket langganan (25K / 80K / 120K, atau buatan admin).

| Field | Type | Rules / Notes |
|-------|------|---------------|
| `id` | bigint PK | |
| `name` | string | unique, required, English-ish display name (label Indonesia dipakai utk UI) |
| `description` | text nullable | |
| `price` | integer (decimal/rupiah) | required, non-negative; paket tertinggi diurutkan descending |
| `is_active` | boolean default true | nonaktif = tidak muncul di daftar beli & untuk trial |
| `timestamps` | | |

**Relasi**:
- `permissions()` — many-to-many → `Spatie\Permission\Models\Permission` (guard `web`), pivot `plan_permission`. **Set permission diatur super admin** (FR-002).
- `subscriptions()` — hasMany → `Subscription`.
- `payments()` — hasMany → `Payment`.

**Validasi (StorePlanRequest / UpdatePlanRequest)**:
- `name` required, string, max, unique (abaikan sendiri saat update).
- `price` required, integer ≥ 0.
- `is_active` boolean.
- `permissions` (untuk sync) array of permission ids/keys valid guard `web`.

**Constraint penghapusan (FR-012)**: Jangan hapus plan yang masih dipakai oleh minimal satu `Subscription` aktif. Cek di sisi logika Action/Service saat `destroy`; bila aktif, tolak. Nonaktifkan (`is_active=false`) sebagai alternatif yang aman.

## Entity: Subscription

Langganan seorang user terhadap satu plan dalam satu periode.

| Field | Type | Rules / Notes |
|-------|------|---------------|
| `id` | bigint PK | |
| `user_id` | FK users | required, onDelete cascade |
| `plan_id` | FK plans | required, nullable on delete (plan dinonaktifkan, subscription tersisa) — pakai `nullOnDelete` atau soft-guard |
| `type` | enum (`trial`|`paid`) | default `trial` |
| `status` | enum (`active`|`expired`) default `active` | transisi `active→expired` ketika `ends_at` lewat |
| `starts_at` | datetime | saat begini |
| `ends_at` | datetime | saat berakhir |
| `timestamps` | | |

**Relasi**:
- `user()` belongsTo `User`.
- `plan()` belongsTo `Plan`.
- `payments()` hasMany `Payment` (langganan berbayar yang mengasalkannya, bila ada).

**Constraint & transisi**:
- **Unik trial sekali seumur hidup (FR-004)**: unique index `(user_id, type)` — sehingga tiap user hanya punya satu baris tipe `trial`.
- **Transisi status**:
  - `active` → `expired`: otomatis ketika `ends_at < now`. `PermissionResolver` menganggap hanya `status=active` dan `starts_at ≤ now ≤ ends_at` sebagai aktif — expiry dievaluasi on-the-fly, bukan menunggu job. Opsional job `subscriptions:expire` untuk menandai status `expired` secara batch (ke-akuratan resolusi tidak bergantung padanya).
- **Renewal (berbayar)**: subscription berbayar baru untuk paket yang sama aktif setelan `ends_at` subscription aktif sebelumnya (`new ends_at = max(now, lastActiveEndsAt) + 30 hari`), sehingga perpanjangan tidak memangkas masa tersisa (D6).

## Entity: Payment

Pesanan/transaksi pembayaran langganan melalui Duitku.

| Field | Type | Rules / Notes |
|-------|------|---------------|
| `id` | bigint PK | |
| `user_id` | FK users | required, onDelete cascade |
| `plan_id` | FK plans | required |
| `subscription_id` | FK subscriptions nullable | diisi saat aktivasi (langganan berbayar hasil pesanan ini) |
| `amount` | integer (rupiah) | required |
| `status` | enum (`pending`|`paid`|`expired`|`failed`) default `pending` | transisi |
| `merchant_order_id` | string | **unique** — referensi pesanan unik yang dikirim ke Duitku & dipakai cek idempoten (D4) |
| `reference` | string nullable | referensi / VA number dari Duitku |
| `payment_method` | string nullable | method yang dipakai bayar |
| `callback_raw` | json nullable | payload callback asli untuk audit |
| `paid_at` | datetime nullable | saat aktivasi |
| `timestamps` | | |

**Relasi**:
- `user()`, `plan()`, `subscription()`.

**Status transisi**:
- `pending` → `paid` (callback valid + aktivasi sukses; tulis `paid_at`, `reference`, `subscription_id`).
- `pending` → `expired` (pesanan melewati batas waktu bayar).
- `pending` → `failed` (callback menandakan gagal/batal — resultCode selain `00` saat status aktif).
- **Idempoten (FR-007)**: update hanya dari `pending`; callback pada `paid` → no-op. Unique `merchant_order_id` mencegah duplikat baris.

> Detail field lain yang bersumber API Duitku (productDetail, paymentMethod, settlementDate, dsb) dipertahankan mentah di `callback_raw` untuk audit, tanpa meledakkan skema.

## Pivot: plan_permission

| Column | Type | Notes |
|--------|------|-------|
| `plan_id` | FK plans | |
| `permission_id` | FK permissions (spatie) | |

Unique `(plan_id, permission_id)`. Many-to-many Plan ↔ Permission.

## Entity: Permission (spatie, reuse)

`spatie/laravel-permission` `permissions` tabel (guard `web`). Katalog menu aplikasi yang dapat dimiliki plan. Super admin sudah mengelola CRUD permission lewat `routes/admin.php` (`PermissionController`). Plan menyimpan subset-nya. Contoh permission untuk v1 menu mahasiswa (perlu ditetapkan saat tasks): `access thesis`, `access supervision`, `access kanban`, `access academic tools`, dst. — disarankan diselaraskan dengan route/menu aplikasi yang sudah ada.

## Alur akses (resolusi menu)

`PermissionResolver::hasActiveAccess(user, permissionKey)`:
1. Ambil plan id terpilih dari `Subscription` milik user di mana `status='active'` DAN `starts_at <= now <= ends_at`.
2. Ambil union set permission dari plan-plan tersebut.
3. Kembalikan `in_array(permissionKey, merged)`.

Super admin tetap diotorisasi via role `super admin` (spatie), terpisah dari resolusi plan ini.
