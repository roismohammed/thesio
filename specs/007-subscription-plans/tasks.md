# Tasks: Subscription Plans & Payments

**Input**: Design documents from `/specs/007-subscription-plans/`

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Tidak ada. Project Thesio tidak memakai unit test otomatis (per CLAUDE.md); spec tidak memintanya. Verifikasi via `php -l`, `npx tsc --noEmit --incremental`, inspeksi diff, dan quickstart.md.

**Organization**: Tasks dikelompokkan per user story agar tiap story dapat diimplementasi dan diuji independen.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Bisa jalan paralel (file berbeda, tanpa dependensi task belumlah lengkap)
- **[Story]**: US1–US4 sesuai user story di spec.md

## Path Conventions

- **Backend**: `apps/api/` (Laravel 13, Eloquent, spatie permission + activitylog). Layering Controller → Service → Action.
- **Frontend**: `apps/web/` (React 19 SPA, feature-based, shadcn base-nova, i18n).

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Fondasi environment & config yang dipakai seluruh alur.

- [x] T001 Tambah konfigurasi Duitku di `apps/api/config/duitku.php`: key `merchant_code`, `api_key`, `sandbox`, `endpoints.inquiry` (sandbox/prod), `callback_url`, `return_url` dari env. Tambahkan `DUITKU_MERCHANT_CODE`, `DUITKU_API_KEY`, `DUITKU_SANDBOX` (true/false) ke `apps/api/.env.example` dengan komentar pemakaian.
- [x] T002 [P] Tambah `permissions` menu mahasiswa ke `apps/api/database/seeders/RolePermissionSeeder.php`: `access thesis`, `access supervision`, `access kanban`, `access academic tools` (nama disesuaikan menu aplikasi yang nyata), `findOrCreate` guard `web`, jangan attach ke role (super admin sudah punya hak penuh via role; permission ini dipakai plan).

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Schema, model dasar, resolver akses, dan seeder yang WAJIB ada sebelum US1–US4.

**⚠️ CRITICAL**: Tidak ada user story work yang boleh dimulai sebelum fase ini tuntas.

- [x] T003 [P] Buat migration `apps/api/database/migrations/YYYY_MM_DD_HHMMSS_create_plans_table.php`: kolom `id`, `name` (unique), `description` (nullable), `price` (int unsigned), `is_active` (bool, default true), timestamps.
- [x] T004 [P] Buat migration pivot `..._create_plan_permission_table.php`: kolom `id`, `plan_id` (FK plans, cascade), `permission_id` (FK permissions spatie, cascade), timestamps, unique `(plan_id, permission_id)`.
- [x] T005 [P] Buat migration `..._create_subscriptions_table.php`: `id`, `user_id` (FK users, cascade), `plan_id` (FK plans, nullOnDelete), `type` (enum trial|paid, default trial), `status` (enum active|expired, default active), `starts_at` (datetime), `ends_at` (datetime), timestamps; unique index `(user_id, type)` untuk trial sekali seumur hidup; index `(user_id, status)`, `(ends_at)`.
- [x] T006 [P] Buat migration `..._create_payments_table.php`: `id`, `user_id` (FK cascade), `plan_id` (FK), `subscription_id` (FK nullable, nullOnDelete), `amount` (int unsigned), `status` (enum pending|paid|expired|failed, default pending), `merchant_order_id` (string, **unique**), `reference` (nullable), `payment_method` (nullable), `callback_raw` (json nullable), `paid_at` (datetime nullable), timestamps.
- [x] T007 [P] Buat `apps/api/app/Enums/SubscriptionTypeEnum.php`, `.../SubscriptionStatusEnum.php`, `.../PaymentStatusEnum.php` (backed string enum PHP 8.3).
- [x] T008 [P] Buat `apps/api/app/Models/Plan.php`: `fillable` name/description/price/is_active, casts `is_active` bool; relasi `permissions()` many-to-many ke `Spatie\Permission\Models\Permission` (pivot `plan_permission`), `subscriptions()` hasMany, `payments()` hasMany.
- [x] T009 [P] Buat `apps/api/app/Models/Subscription.php`: `fillable` user_id/plan_id/type/status/starts_at/ends_at, casts status/type/date; relasi `user()`, `plan()`, `payments()`; method bantu `isActive()` (status active && starts_at <= now <= ends_at) dan `isExpired()` (ends_at < now).
- [x] T010 [P] Buat `apps/api/app/Models/Payment.php`: `fillable` user_id/plan_id/subscription_id/amount/status/merchant_order_id/reference/payment_method/callback_raw/paid_at, casts status + callback_raw array + paid_at datetime; relasi `user()`, `plan()`, `subscription()`; scope/helper transition dari pending.
- [x] T011 Buat `apps/api/app/Support/PermissionResolver.php`: method statis `hasActiveAccess(User $user, string $permissionKey): bool` — ambil permissions dari plan pada subscription aktif user (dari data-model.md), union, cek `contains`; dipakai guard akses menu mahasiswa (FR-011, SC-006).
- [x] T012 Buat `apps/api/database/seeders/PlanSeeder.php`: buat 3 plan 25K (25000), 80K (80000), 120K (120000, `is_active=true`, tertinggi); tiap plan `syncPermissions` subset dari permission T002 (120K dapat semua, 80K sebagian, 25K minimal). Register di `database/seeders/DatabaseSeeder.php`.
- [x] T013 Tambah muat route baru di `apps/api/bootstrap/app.php` `then`: `require __DIR__.'/../routes/plan.php';` dan `require __DIR__.'/../routes/webhook.php';` (webhook TANPA session auth — verifikasi signature).

**Checkpoint**: Foundation siap — implementasi user story dapat dimulai paralel.

---

## Phase 3: User Story 1 - Admin kelola paket & permission (Priority: P1) 🎯 MVP

**Goal**: Super admin membuat/mengubah/menonaktifkan/menghapus paket, dan menyetel permission tiap paket (FR-001, FR-002, FR-012).

**Independent Test**: Super admin login, buka halaman kelola paket, buat paket "Standar" 80.000 + set permission, lihat muncul di daftar; ubah permission paket; usaha hapus paket yang masih dipakai → ditolak.

### Implementation for User Story 1

- [x] T014 [P] [US1] Buat `apps/api/app/Http/Requests/Admin/StorePlanRequest.php`: validate `name` (required, string, max, unique:plans,name), `description` (nullable), `price` (required, integer, min:0), `is_active` (boolean), `permission_ids` (array, exists permissions id, guard web, bisa nullable).
- [x] T015 [P] [US1] Buat `apps/api/app/Http/Requests/Admin/UpdatePlanRequest.php`: seperti Store + `rule('unique')->ignore(route('plans.plan'))` untuk name.
- [x] T016 [P] [US1] Buat model relation tidak duplikat: pastikan `Plan` sudah punya `permissions()` (T008) — skip bila ada; catat. (Jika file ini redundant, hapus dan tandai T016 selesai via T008.)
- [x] T017 [US1] Buat `apps/api/app/Services/PlanService.php`: orchestrate `listPlans()`, `create(array)`, `update(Plan, array)`, `delete(Plan)`; di dalamnya memanggil Actions T018–T020; log activity naratif per operasi (FR-013).
- [x] T018 [P] [US1] Buat `apps/api/app/Actions/Plan/CreatePlanAction.php`: satu unit kerja — simpan Plan + `syncPermissions`; Eloquent; activity log naratif (contoh: "Membuat paket {name} sebesar Rp {price} dengan {n} menu diizinkan.").
- [x] T019 [P] [US1] Buat `apps/api/app/Actions/Plan/UpdatePlanAction.php`: perbarui field + `syncPermissions` bila `permission_ids` disediakan; log naratif mencakup perubahan nilai yang relevan (FR-013).
- [x] T020 [P] [US1] Buat `apps/api/app/Actions/Plan/DeletePlanAction.php`: tolak bila ada `Subscription` aktif (status active, ends_at masa datang) terhadap plan → throw/return error bernarasi (FR-012); selain itu `delete` + log naratif.
- [x] T021 [US1] Buat `apps/api/app/Http/Controllers/Admin/PlanController.php`: index/store/show/update/destroy memakai Store/UpdatePlanRequest + PlanService; pastikan respons JSON menyertakan `permissions` (id+name). (Controller → Service → Action; tanpa logika DB di controller.)
- [x] T022 [US1] Daftarkan rute pada `apps/api/routes/admin.php` di dalam grup `['web','auth','role:super admin']` prefix `api/admin`: `Route::apiResource('plans', PlanController::class)` + konfirmasi `apiResource('plans')` terdaftar.
- [x] T023 [P] [US1] Buat halaman frontend `apps/web/src/features/admin/pages/plans/index.tsx`: daftar paket (datatable) — nama, harga, status, jumlah menu; breadcrumb "Dashboard / Kelola Paket".
- [x] T024 [P] [US1] Buat partials di `apps/web/src/features/admin/pages/plans/partials/`: `plan-dialog.tsx` (form buat/ubah plan — >5 field → halaman terpisah? hitung: name, description, price, is_active, permission checkbox = >5 → pakai halaman terpisah `plan-form-page.tsx` bila perlu sesuai V. Frontend Design Craft), `permission-form.tsx` (checkbox/toggle set permission yang ada). Form react-hook-form; i18n label Indonesia.
- [x] T025 [US1] Wire frontend: `apps/web/src/App.tsx` — tambah route `/admin/plans` (+ detail/form bila ada) dengan guard super admin; navigasi admin menunjuk halaman ini.

**Checkpoint**: US1 berfungsi penuh & dapat diuji independen (CRUD + permission + proteksi hapus).

---

## Phase 4: User Story 2 - Mahasiswa baru otomatis trial paket tertinggi (Priority: P1)

**Goal**: Saat registrasi mahasiswa selesai, sistem otomatis memberi subscription trial paket tertinggi (120K) 14 hari, sekali seumur hidup (FR-004, FR-011).

**Independent Test**: Register akun mahasiswa baru → `GET api/my/subscription` menampilkan trial aktif paket 120K, `ends_at = starts_at + 14 hari`; coba lagi untuk akun sama → tidak ada trial kedua.

### Implementation for User Story 2

- [x] T026 [P] [US2] Buat `apps/api/app/Actions/Subscription/CreateTrialSubscriptionAction.php`: satu unit kerja — cari plan tertinggi aktif (`Plan::where('is_active',true)->orderByDesc('price')->first()`); bila tidak ada, lewati diam-diam (edge seeder belum jalan); buat Subscription type `trial`, status `active`, `starts_at=now`, `ends_at=now+14 days` untuk user; idempoten via unique `(user_id,type)` (FR-004, SC-001); activity log naratif.
- [x] T027 [US2] Buat `apps/api/app/Http/Controllers/Auth/RegisteredUserController.php` (modifikasi): setelah registrasi sukses, panggil `CreateTrialSubscriptionAction` untuk user baru (US1 tidak perlu, tapi US2 menggantung P1/F2). Sesuaikan agar error trial tidak memblokir registrasi.
- [x] T028 [US2] Buat `apps/api/app/Http/Controllers/SubscriptionController.php`: method `mySubscription()` → kembalikan subscription aktif terkini + daftar payments user (FR-005/status, dipakai frontend).
- [x] T029 [US2] Daftarkan di `apps/api/routes/plan.php` (muat via bootstrap T013): `GET api/my/subscription` (middleware `auth`) → `SubscriptionController@mySubscription`.
- [x] T030 [P] [US2] Buat halaman `apps/web/src/features/plan/pages/my-subscription/index.tsx`: menampilkan paket aktif (trial/paid), `ends_at`, status; tombol "Lihat Paket"/"Upgrade" menuju daftar paket (US3); breadcrumb; i18n Indonesia.
- [x] T031 [US2] Wire frontend: route `/my-subscription` di `apps/web/src/App.tsx` (guard auth), nav mahasiswa menunjuk ke sana.

**Checkpoint**: Mahasiswa baru otomatis trial 120K 14 hari tanpa langkah tambahan (SC-001).

---

## Phase 5: User Story 3 - Mahasiswa berlangganan paket via Duitku (Priority: P2)

**Goal**: Mahasiswa memilih paket berbayar → checkout Duitku → callback diverifikasi → aktivasi langganan berbayar, idempoten & anti-duplikat (FR-005, FR-006, FR-007, FR-008).

**Independent Test**: (sandbox) pilih paket → `POST api/subscriptions` → redirect ke `paymentUrl`; bayar di sandbox → callback → Payment `pending→paid`, subscription aktif; kirim callback sama dua kali → no-op; callback signature salah → ditolak, status tak berubah.

### Implementation for User Story 3

- [x] T032 [P] [US3] Buat `apps/api/app/Http/Requests/SubscribeToPlanRequest.php`: validate `plan_id` exists plans, harus `is_active`; rule untuk memastikan user punya akses (auth; plan aktif).
- [x] T033 [P] [US3] Buat `apps/api/app/Actions/Payment/CreatePaymentTransactionAction.php`: satu unit kerja — buat Payment `pending`, `merchant_order_id` unik (format deterministik, mis. `TH-{user_id}-{timestamp}`), `amount` = plan price; kembalikan Payment. Eloquent; log naratif.
- [x] T034 [P] [US3] Buat `apps/api/app/Services/DuitkuPaymentService.php`: pakai `Http` facade — method `createTransaction(Payment, Plan, User): string redirectUrl` memanggil endpoint `config('duitku.endpoints.inquiry')` (sandbox bila `DUITKU_SANDBOX`), kirim payload per contracts.md B1 (clientRequest: merchantCode, paymentAmount, paymentMethod="", merchantOrderId, productDetails, customerVaName=user name, merchantUserId=user email, signature, callbackUrl, returnUrl); parsing `paymentUrl` dari respons; validasi respons error.
- [x] T035 [US3] Buat `apps/api/app/Actions/Payment/VerifyPaymentCallbackAction.php`: validasi field wajib (merchantCode, amount, merchantOrderId, signature) ada → hitung `calcSignature = hash_hmac('sha256', merchantCode.amount.merchantOrderId, config('duitku.api_key'))` → cocokkan dengan signature masuk → kembalikan status valid/tidak (FR-008, D3).
- [x] T036 [US3] Buat `apps/api/app/Actions/Payment/ActivatePaidSubscriptionAction.php`: satu unit kerja — transition Payment `pending→paid` (idempoten: hanya jika masih pending; bila sudah paid → no-op, FR-007/SC-004), tulis `paid_at`, `reference`, `payment_method`, `callback_raw`; temukan/ciptakan Subscription `paid` untuk plan (renewal: `ends_at = max(now, lastActiveEndsAt)+30 hari` per research D6), `starts_at`, hubungkan `subscription_id`; log naratif; return sukses/gagal.
- [x] T038 [US3] Buat `apps/api/app/Http/Controllers/Webhook/DuitkuCallbackController.php`: terima POST form → `VerifyPaymentCallbackAction`; bila valid & `resultCode == "00"` → `ActivatePaidSubscriptionAction`; respons teks `Success` (HTTP 200) hanya setelah aktivasi sukses; signature invalid → error 4xx (FR-008, SC-003).
- [x] T039 [US3] Daftarkan di `apps/api/routes/webhook.php` (muat via bootstrap T013): `POST api/duitku/callback` TANPA middleware `auth`/CSRF (session) — hanya verifikasi signature; di bootstrap pastikan webhook dikecualikan dari middleware yang memerlukan session.
- [x] T040 [US3] Buat `apps/api/app/Http/Controllers/SubscriptionController.php` (tambah): method `subscribe(SubscribeToPlanRequest)` → `CreatePaymentTransactionAction` → `DuitkuPaymentService::createTransaction` → respons JSON `{ payment: {id}, redirect_url }`.
- [x] T041 [US3] Daftarkan di `apps/api/routes/plan.php`: `POST api/subscriptions` (middleware `auth`) → subscribe.
- [x] T042 [P] [US3] Buat halaman `apps/web/src/features/plan/pages/subscriptions/index.tsx`: daftar paket aktif + tombol pilih/tombol lanjut bayar; panggil `POST api/subscriptions` lalu `window.location`/navigate ke `redirect_url`; breadcrumb; i18n Indonesia.
- [x] T043 [P] [US3] Buat halaman `apps/web/src/features/plan/pages/subscriptions/partials/plan-card.tsx` (atau gunakan datatable) menampilkan nama, harga, daftar fitur/menu, tombol; responsif.
- [x] T044 [US3] Wire frontend: route `/plans` (daftar paket) di `apps/web/src/App.tsx` (guard auth); tombol upgrade dari US2 (`my-subscription`) menuju `POST api/subscriptions`.
- [x] T045 [US3] Tambah helper/state `apps/web/src/features/plan/types.ts`: tipe `Plan`, `Subscription`, `Payment`, `MySubscriptionResponse` (shared, ≥2 tempat) sesuai naming English.

**Checkpoint**: Alur bayar Duitku utuh — checkout, verifikasi callback, aktivasi idempoten, anti-duplikat (SC-003, SC-004).

> Catatan: tidak ada T037 (di-skip untuk penomoran bersih); ID T033–T045 berurutan tanpa gap yang dibutuhkan.

---

## Phase 6: User Story 4 - Super admin memantau mahasiswa, paket, pembayaran (Priority: P3)

**Goal**: Super admin melihat seluruh mahasiswa beserta paket aktif/status dan riwayat pembayaran, dengan filter (FR-009, FR-010, SC-005).

**Independent Test**: Super admin buka daftar mahasiswa → lihat paket aktif + status; buka detail → riwayat pembayaran; filter by plan/status bekerja.

### Implementation for User Story 4

- [x] T046 [P] [US4] Buat `apps/api/app/Http/Controllers/Admin/UserMonitoringController.php`: `index()` — daftar user + subscription aktif (pakai eager load, paginate; dukung query `plan_id`, `status`, `search`), `show(User)` — tambah payments user (FR-010); respons JSON sesuai contracts.md A3; pastikan hanya super admin.
- [x] T047 [US4] Daftarkan di `apps/api/routes/admin.php` grup `role:super admin` prefix `api/admin`: `GET monitoring/users`, `GET monitoring/users/{user}`.
- [x] T048 [P] [US4] Frontend: perbarui halaman admin existing `apps/web/src/features/admin/pages/users/index.tsx` — tambah kolom "Paket" (nama plan + status) yang diambil dari monitoring; filter plan/status; breadcrumb "Dashboard / Data Mahasiswa".
- [x] T049 [P] [US4] Buat partial detail `apps/web/src/features/admin/pages/users/partials/user-subscription-dialog.tsx` (atau integrate di halaman detail existing): tampilkan status langganan + daftar riwayat pembayaran (tanggal, nominal, method, status) — pakai datatable; i18n Indonesia.

**Checkpoint**: Super admin punya visibilitas penuh atas paket aktif & pembayaran tiap mahasiswa (SC-005).

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Penyempurnaan lintas story & validation.

- [x] T050 [P] Verifikasi layering & konstitusi: pastikan tidak ada query/DB di Controller, semua mutation Eloquent via Action, semua operasi data diberi activity log naratif (FR-013) — cek `php -l` tiap file PHP (`apps/api/**`).
- [x] T051 [P] Type-check frontend: `npx tsc --noEmit --incremental` di `apps/web` — pastikan tidak ada unused/type error (noUnusedLocals/Parameters aktif).
- [x] T052 [P] Format PHP: `vendor/bin/pint` di `apps/api` untuk file baru (tanpa mengubah file tak terkait).
- [x] T053 [P] Jalankan validasi end-to-end mengikuti `specs/007-subscription-plans/quickstart.md` (S1–S6): seeder plan, trial otomatis sekali seumur hidup, akses permission dinamis, admin CRUD+permission, alur Duitku sandbox + idempotensi, halaman monitoring.
- [x] T054 Security hardening: pastikan endpoint admin hanya `role:super admin`; webhook hanya mengandalkan signature (tanpa session); tidak ada secret Duitku ter-commit (cek `.env.example` hanya placeholder).
- [x] T055 Dokumentasi: tambah catatan konfigurasi Duitku (environment) bila belum ada di README/`apps/api` docs.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — dulu.
- **Foundational (Phase 2)**: Bergantung Phase 1 — **BLOCKS semua user story** (T003–T013 wajib sebelum US1–US4).
- **User Stories (Phase 3+)**: Bergantung Phase 2 selesai.
  - US1 (Phase 3) independen — jalan duluan sebagai MVP.
  - US2 (Phase 4) independen dari US1 (menggantung plan yang tersedia; plan sudah ada di Phase 2 via seeder).
  - US3 (Phase 5) menggantung permission/durasi (Plan) dan `Subscription`/`Payment` (Phase 2); dapat dijalankan setelah Phase 2, paralel dengan US1/US2.
  - US4 (Phase 6) menggantung data subscription/payment (muncul dari US2/US3); bisa paralel membaca data yang belum ada, tapi paling bermakna setelah US2/US3.
- **Polish (Final)**: Menggantung semua desired user story.

### User Story Dependencies

- **User Story 1 (P1)**: Setelah Phase 2. Independen — MVP.
- **User Story 2 (P1)**: Setelah Phase 2. Independen dari US1; butuh `PlanSeeder` (T012) & `PermissionResolver` (T011).
- **User Story 3 (P2)**: Setelah Phase 2. Menggantung `Plan` & model `Payment`/`Subscription`; butuh webhook route (T013) & config Duitku (T001).
- **User Story 4 (P3)**: Setelah Phase 2. Data subscription/payment datang dari US2/US3.

### Within Each User Story

- Models sebelum services; services sebelum endpoints; endpoint sebelum integration frontend.
- Core implementation sebelum integration.
- Story selesai sebelum pindah ke prioritas berikut (untuk incremental single-dev).

### Parallel Opportunities

- Phase 1: T001 & T002 paralel [P].
- Phase 2: T003–T006 (migrasi) paralel; T007–T011 (enum/model/resolver) paralel setelah/bersamaan; T012 (seeder) setelah model; T013 (routing bootstrap) independen.
- US1, US2, US3, US4 dapat dibangun paralel oleh developer berbeda setelah Phase 2 tuntas (masing-masing file terpisah).
- Dalam tiap story: task bertanda [P] (partials, request, action terpisah) paralel.

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Phase 1: Setup (T001–T002).
2. Phase 2: Foundational (T003–T013) — CRITICAL, blocks semua.
3. Phase 3: User Story 1 (T014–T025).
4. **STOP & VALIDATE**: US1 — super admin bisa CRUD paket + set permission + proteksi hapus.
5. Deploy/demo bila siap.

### Incremental Delivery

1. Setup + Foundational → Foundation ready.
2. US1 → test independen (kelola paket). MVP.
3. US2 → test independen (trial otomatis). Tambah nilai tanpa merusak US1.
4. US3 → test independen (bayar Duitku + aktivasi).
5. US4 → test independen (monitoring).
6. Setiap story menambah nilai tanpa merusak story sebelumnya.

### Parallel Team Strategy

1. Tim selesaikan Setup + Foundational bersama.
2. Setelah Foundational:
   - Developer A: US1, Developer B: US2, Developer C: US3.
3. US4 setelah US2/US3 menghasilkan data (atau paralel membaca data kosong dahulu).
4. Story selesai & integrasi independen.

---

## Notes

- [P] task = file berbeda, tanpa dependensi pada task yang belum selesai.
- [Story] label memetakan task ke user story spesifik.
- Tiap user story independen & dapat diuji sendiri.
- Verifikasi: proyek tanpa unit test — gunakan `php -l`, `npx tsc --noEmit --incremental`, inspeksi diff, dan quickstart.md.
- Commit setelah tiap task/kelompok logis.
- Berhenti di checkpoint untuk validasi story independen.
- Hindari: task samar, konflik file yang sama, dependensi lintas story yang merusak independensi.
- Semua mutation DB lewat Action + Eloquent (konstitusi P-II); activity log naratif (P-III); naming English + case per ekosistem; UI Indonesia semi-formal; breadcrumb tiap inner page (P-V).
