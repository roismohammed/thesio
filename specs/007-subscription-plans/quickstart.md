# Quickstart: Subscription Plans & Payments

**Branch**: `007-subscription-plans` | **Date**: 2026-08-31

Panduan validasi end-to-end. Detail entitas & API → [data-model.md](./data-model.md) & [contracts.md](./contracts/contracts.md). Bukan panduan implementasi (itu ada di `tasks.md`).

## Prasyarat

- `apps/api` siap jalan (Laravel 13, SQLite, Sanctum). Jalankan dari `apps/api`:
  - `composer install`
  - salin `.env` & isi kredensial Duitku (lihat [contracts.md](./contracts/contracts.md) → Kredensial): `DUITKU_MERCHANT_CODE`, `DUITKU_API_KEY`, `DUITKU_SANDBOX=true`.
  - `php artisan key:generate`
  - `php artisan migrate --seed` (membuat tabel plan/subscription/payment + seeder role/permission + `PlanSeeder` 25K/80K/120K)
  - `php artisan serve`
- `apps/web` dev server dari `apps/web`: `bun install && bun run dev`.

> Sesuai kebijakan project: tidak ada test suite otomatis. Verifikasi lewat `php -l`, `npx tsc --noEmit --incremental`, `vendor/bin/pint --test` (format), dan langkah manual di bawah.

## Skema Verifikasi End-to-End

### S1. Seeder paket ada (FR-003)

**Langkah**: `php artisan migrate:fresh --seed` lalu `php artisan tinker` → `App\Models\Plan::orderByDesc('price')->get()`.

**Expected**: muncul 3 plan — nama 25K, 80K, 120K; 120K memiliki `price` tertinggi dan `is_active=true`; tiap plan punya permission set sesuai seeder.

### S2. Trial otomatis paket tertinggi 14 hari, sekali seumur hidup (FR-004)

**Langkah** (di SPA): register akun mahasiswa baru → buka `GET api/my/subscription`.

**Expected**: `current.status=active`, `current.type=trial`, `current.plan` = paket tertinggi (120K), `ends_at` = `starts_at` + 14 hari. **Periksa idempoten**: panggil ulang proses registrasi/trial untuk akun sama → tidak ada subscription trial kedua (unik `user_id,type`).

### S3. Akses menu mengikuti permission plan aktif (FR-011, SC-006)

**Langkah**: Login akun trial, akses menu yang ada di permission 120K → boleh; akses menu di luar permission 120K → ditolak. Ubah permission 120K via admin (S4) → cek akses berubah seketika tanpa login ulang.

**Expected**: resolusi permission union dari plan aktif; perubahan plan langsung terlihat.

### S4. Admin CRUD + permission (FR-001/002, SC-002)

**Langkah**: Login akun `super admin` → buka `apps/web/src/features/admin/pages/plans` (halaman kelola plan) → buat plan baru (nama, harga, set permission), ubah, nonaktifkan.

**Expected**: plan baru muncul; permission boleh diubah & tersimpan. Usaha hapus plan yang masih dipakai subscription aktif → ditolak dengan pesan (FR-012).

### S5. Pembayaran via Duitku — checkout → callback → aktivasi (FR-005/006/007, SC-003/004)

**Langkah**: (dengan `DUITKU_SANDBOX=true`) mahasiswa memilih paket berbayar → `POST api/subscriptions` → respon berisi `redirect_url`. Redirect ke halaman bayar Duitku sandbox → selesaikan pembayaran (metode sandbox) → Duitku POST callback → kembali di `returnUrl`.

**Periksa**:
- `Payment` berubah `pending → paid`, `subscription_id` terisi, langganan berbayar aktif (FR-006).
- Kirim ulang payload callback yang sama → no-op, tidak ada subscription ganda (SC-004).
- Kirim callback dengan `signature` salah → ditolak, status/Payment tidak berubah (FR-008, SC-003).

### S6. Halaman monitoring admin (FR-009/010)

**Langkah**: super admin buka `apps/web/src/features/admin/pages/users` (yang menyertakan kolom paket/langganan) + detail user → lihat riwayat pembayaran. Gunakan filter plan/status.

**Expected**: daftar lengkap mahasiswa + paket aktif + status; detail menampilkan riwayat pembayaran; filter bekerja (SC-005).

## Checklist Kepatuhan

- [ ] Semua mutation DB memakai Eloquent via **Action** (tanpa raw SQL untuk CRUD tunggal).
- [ ] Activity log naratif tercatat untuk tiap create/update/delete plan, subscription, payment.
- [ ] PHP `php -l` bersih; TS `npx tsc --noEmit --incremental` bersih; Pint ok.
- [ ] Naming English + case per ekosistem; UI semi-formal Indonesia; breadcrumb tiap inner page.
