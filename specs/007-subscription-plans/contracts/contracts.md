# Contracts: Subscription Plans & Payments

**Branch**: `007-subscription-plans` | **Date**: 2026-08-31

Kontrak dibagi dua: (A) endpoint aplikasi (Laravel API, dipakai SPA frontend) dan (B) integrasi payment gateway Duitku (checkout ke Duitku + callback dari Duitku). Semua respon API aplikasi JSON. Auth memakai session cookie Sanctum (guard `web`), middleware `role:super admin` untuk sisi admin.

## A. Endpoint Aplikasi

### A1. Admin — CRUD Plan

Base: `web` + `auth` + `role:super admin`, prefix `api/admin`. Berlaku `PlanController`.

| Method | Path | Purpose |
|--------|------|---------|
| GET | `api/admin/plans` | Daftar plan (dengan permission) |
| POST | `api/admin/plans` | Buat plan + sync permission (FR-001/002) |
| GET | `api/admin/plans/{plan}` | Detail |
| PUT/PATCH | `api/admin/plans/{plan}` | Ubah field + sync permission |
| DELETE | `api/admin/plans/{plan}` | Hapus (ditolak jika punya subscription aktif — FR-012) |

**Payload store/update** (validasi Store/UpdatePlanRequest):
```json
{
  "name": "Paket Premium 120K",
  "description": "Fitur penuh selama 1 bulan",
  "price": 120000,
  "is_active": true,
  "permission_ids": [1, 2, 3]
}
```

**Respon plan (index/detail)**:
```json
{
  "id": 1,
  "name": "Paket Premium",
  "description": "...",
  "price": 120000,
  "is_active": true,
  "permissions": [{ "id": 1, "name": "access thesis" }]
}
```

### A2. Mahasiswa — langganan & status

Base: `web` + `auth`.

| Method | Path | Purpose |
|--------|------|---------|
| GET | `api/plans` | Daftar plan aktif untuk dibeli (tampilkan harga, deskripsi, fitur) |
| POST | `api/subscriptions` | Mulai beli paket → buat Payment pending → kembalikan `redirect_url` Duitku (FR-005) |
| GET | `api/my/subscription` | Status langganan aktif user + riwayat pembayaran (untuk halaman "My Subscription") |

**Payload `POST api/subscriptions`**:
```json
{ "plan_id": 4 }
```

**Respon**:
```json
{ "payment": { "id": 9 }, "redirect_url": "https://app.duitku.com/payment/..." }
```
Frontend mengarahkan browser ke `redirect_url`. Status final di-refresh dari `GET api/my/subscription`.

**Respon `GET api/my/subscription`**:
```json
{
  "current": {
    "type": "trial",
    "status": "active",
    "plan": { "id": 1, "name": "Paket Premium" },
    "starts_at": "2026-08-31T00:00:00Z",
    "ends_at": "2026-09-14T00:00:00Z"
  },
  "payments": [
    { "id": 9, "status": "paid", "amount": 120000, "paid_at": "...", "plan": { "id": 4 } }
  ]
}
```

### A3. Admin — monitoring mahasiswa

Base: `web` + `auth` + `role:super admin`, prefix `api/admin`. Berlaku `UserMonitoringController`.

| Method | Path | Purpose |
|--------|------|---------|
| GET | `api/admin/monitoring/users` | Daftar mahasiswa + paket aktif + status (FR-009, SC-005) |
| GET | `api/admin/monitoring/users/{user}` | Detail satu mahasiswa + riwayat pembayaran (FR-010) |
| GET | `api/admin/monitoring/users?plan_id=&status=` | Filter by plan / status (FR-009 acceptance 3) |

**Respon daftar**:
```json
{
  "users": [
    {
      "id": 7,
      "name": "Budi Santoso",
      "email": "budi@mail.com",
      "subscription": {
        "type": "trial", "status": "active",
        "plan": { "id": 1, "name": "Paket Premium" },
        "ends_at": "2026-09-14T00:00:00Z"
      }
    }
  ],
  "meta": { "total": 120, "page": 1 }
}
```

**Respon detail** — di atas + `payments: [{ id, status, amount, plan, paid_at }]`.

### A4. Webhook callback Duitku

Route terpisah (tanpa session auth) — `routes/webhook.php`, prefix `api`. No CSRF/auth; keamanan via signature.

| Method | Path | Purpose |
|--------|------|---------|
| POST | `api/duitku/callback` | Terima notifikasi Duitku, verifikasi signature, aktivasi (FR-006/007/008) |

**Request (form-urlencoded POST dari Duitku)**: `merchantCode`, `amount`, `merchantOrderId`, `productDetail?`, `paymentMethod`, `resultCode`, `merchantUserId`, `reference`, `signature`, dst.

**Kontrak respon**: teks `Success` (HTTP 200) hanya jika signature valid. Jika signature tidak valid → HTTP 4xx/teks error.

**Verifikasi (dari research D3)**:
- Field wajib ada: `merchantCode`, `amount`, `merchantOrderId`, `signature`.
- `calcSignature = hash_hmac('sha256', merchantCode . amount . merchantOrderId, config('duitku.api_key'))`.
- Valid hanya jika `calcSignature === signature`.
- Jika `resultCode === "00"` dan status Payment `pending` → aktivasi (ActivatePaidSubscriptionAction). `paid` → no-op.

## B. Integrasi Duitku

### B1. Checkout

`DuitkuPaymentService` via `Http` facade.

- Endpoint: prod `https://api.duitku.com/api/v2/merchant/inquiry`; sandbox `https://sandbox.duitku.com/api/v2/merchant/inquiry` (nilai dari `config('duitku.sandbox')`).
- Request JSON:
```json
{
  "merchantCode": "D9999",
  "paymentAmount": 120000,
  "paymentMethod": "",
  "merchantOrderId": "<unique ref>",
  "productDetails": "Langganan Paket Premium Thesio - 1 bulan",
  "customerVaName": "<user name>",
  "merchantUserId": "<user email>",
  "additionalParam": "",
  "signature": "sha256(merchantCode + paymentAmount + merchantOrderId + apiKey)",
  "callbackUrl": "https://.../api/duitku/callback",
  "returnUrl": "https://.../my-subscription?payment=9"
}
```
- Respon sukses → ambil `paymentUrl` untuk redirect.

### B2. Notifikasi callback masuk

Dijelaskan di A4. Respon `Success` teks. Kegagalan signature/verifikasi tidak pernah mengaktifkan langganan (FR-008, SC-003).

## Kredensial & konfigurasi

- `config/duitku.php`: `merchant_code`, `api_key`, `sandbox` (bool), `endpoints` (inquiry), `callback_url`, `return_url`. Nilai dari env `DUITKU_*` ditambahkan ke `.env.example`.
- Tidak ada secret dikomit. Kredensial sandbox diisi saat integrasi.
