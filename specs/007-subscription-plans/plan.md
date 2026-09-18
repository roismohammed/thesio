# Implementation Plan: Subscription Plans & Payments

**Branch**: `007-subscription-plans` | **Date**: 2026-08-31 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/007-subscription-plans/spec.md`

## Summary

Menambahkan sistem langganan paket (plan) untuk mahasiswa: admin (super admin) mengelola CRUD paket + permission per plan; mahasiswa baru otomatis mendapat trial paket tertinggi (120K) 14 hari sekali seumur hidup; mahasiswa bisa berlangganan paket berbayar via Duitku (checkout → callback diverifikasi → aktivasi); admin memantau mahasiswa beserta paket & riwayat pembayaran.

Pendekatan teknis: memanfaatkan `spatie/laravel-permission` (role `super admin` sudah ada) + `spatie/activitylog`. Plan memiliki set permission (many-to-many ke Permission spatie, guard `web`). Hak akses menu user dihitung dari permission kumpulan plan pada subscription aktif — bukan attach langsung ke user. Alur Duitku mengikuti API Duitku: `POST /transaction` (checkout → paymentUrl), callback diverifikasi via signature HMAC-SHA256 (`merchantCode . amount . merchantOrderId`), `returnUrl` untuk redirect kembali. Aktivasi langganan idempoten (guard duplikat callback) via referensi pesanan unik.

## Technical Context

**Language/Version**: PHP 8.3 / Laravel 13 (apps/api); TypeScript / React 19 / Vite 8 (apps/web)

**Primary Dependencies**: `spatie/laravel-permission` (sudah ada), `spatie/laravel-activitylog` (sudah ada), `laravel/sanctum` (sudah ada). Duitku via HTTP `Illuminate\Http\Client` (Http facade) — SDK Duitku PHP bersifat opsional; pilih HttpClient agar minim dependency baru. Frontend: `@tanstack/react-table` (datatable), `react-hook-form`, i18n (`react-i18next`), shadcn base-nova, lucide icons (semua sudah terpasang).

**Storage**: SQLite default (production sesuai env); Eloquent ORM, tanpa raw SQL untuk single CRUD. `plan_permission` tabel pivot.

**Testing**: Tidak ada unit test otomatis dalam project (sesuai CLAUDE.md). Verifikasi via `php -l`, `npx tsc --noEmit --incremental`, inspeksi diff; Duitku callback diuji lewat stub/simulasi manual (belum ada sandbox Duitku).

**Target Platform**: Web — SPA React (apps/web) + Laravel API (apps/api).

**Project Type**: Aplikasi web full-stack (monorepo, dua app independen: frontend SPA + backend Laravel).

**Performance Goals**: Muat halaman admin (daftar mahasiswa + riwayat) < 3 detik untuk ratusan mahasiswa (SC-005). Tidak ada tekanan throughput tinggi.

**Constraints**: Layered `Controller → Service → Action` (konstitusi P-I/II). PHP class ≤ 300 baris, method ≤ 100 baris. React file ≤ 300 baris. Naming English + case per ekosistem. UI Indonesia semi-formal. Activity log naratif wajib. Tanpa raw SQL untuk CRUD tunggal.

**Scale/Scope**: Pemisahan admin vs mahasiswa existing (role `super admin` / `user`). Perkiraan awal ratusan mahasiswa; bukan skala enterprise. Duitku adalah penyedia pembayaran tunggal di v1.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **P-I Layered architecture**: Baru — Controller → Service → Action; validasi lewat Form Request. ✅ desain mematuhi (Service orchestrate, Action eksekusi DB, Action tidak inject Service).
- **P-II Action single responsibility & DB execution**: Semua mutation DB lewat Action; Eloquent ORM. ✅
- **P-III Narrative activity logging**: Setiap create/update/delete paket, subscription, payment dicatat naratif via activitylog. ✅
- **P-IV Productivity-app design**: Sisi admin pakai komponen datatable/shared existing, konsisten. ✅
- **P-V Frontend craft**: Breadcrumb di tiap inner page; form > 5 field pakai halaman terpisah (form plan). Permission assignment (checkbox set) → halaman/modal sesuai aturan; component placement feature-based. ✅
- **DB Action via ORM**: Eloquent, tidak ada raw SQL untuk CRUD tunggal. ✅
- **No new dependency tanpa keperluan**: Duitku dikonsumsi via HttpClient bawaan Laravel, bukan install SDK baru — mengurangi dependency. ✅

*Tidak ada pelanggaran yang perlu Complexity Tracking.*

## Project Structure

### Documentation (this feature)

```text
specs/007-subscription-plans/
├── plan.md            # This file (/speckit-plan output)
├── research.md        # Phase 0 — keputusan teknis & resolusi asumsi Duitku/permission
├── data-model.md      # Phase 1 — entitas, kolom, relasi, transisi status
├── quickstart.md      # Phase 1 — skenario validasi end-to-end
├── contracts/         # Phase 1 — kontrak API Duitku + endpooint aplikasi
└── tasks.md           # (/speckit-tasks — dibuat nanti)
```

### Source Code (repository root)

```text
apps/api/
├── app/
│   ├── Actions/
│   │   ├── Subscription/
│   │   │   ├── CreateTrialSubscriptionAction.php
│   │   │   ├── ActivateSubscriptionAction.php
│   │   │   └── RevokeExpiredSubscriptionAction.php
│   │   └── Payment/
│   │       ├── CreatePaymentTransactionAction.php
│   │       ├── VerifyPaymentCallbackAction.php
│   │       └── ActivatePaidSubscriptionAction.php
│   ├── Enums/
│   │   ├── SubscriptionTypeEnum.php      # trial | paid
│   │   ├── SubscriptionStatusEnum.php    # active | expired | (cancelled?)
│   │   └── PaymentStatusEnum.php         # pending | paid | expired | failed
│   ├── Http/
│   │   ├── Controllers/
│   │   │   ├── Admin/PlanController.php
│   │   │   ├── Admin/PlanPermissionController.php
│   │   │   ├── Admin/UserMonitoringController.php
│   │   │   ├── SubscriptionController.php       # beli paket (user)
│   │   │   └── Webhook/DuitkuCallbackController.php
│   │   └── Requests/
│   │       ├── Admin/StorePlanRequest.php
│   │       ├── Admin/UpdatePlanRequest.php
│   │       └── SubscribeToPlanRequest.php
│   ├── Models/
│   │   ├── Plan.php
│   │   ├── Subscription.php
│   │   └── Payment.php
│   ├── Services/
│   │   ├── PlanService.php
│   │   ├── SubscriptionService.php
│   │   └── DuitkuPaymentService.php
│   └── Support/PermissionResolver.php      # hasActiveAccess(user, permissionKey)
├── database/
│   ├── migrations/
│   │   ├── create_plans_table.php
│   │   ├── create_plan_permission_table.php
│   │   ├── create_subscriptions_table.php
│   │   └── create_payments_table.php
│   └── seeders/
│       ├── PlanSeeder.php                  # 25K / 80K / 120K + permission sets
│       └── (tambah 'manage plans' dkk ke RolePermissionSeeder)
├── config/
│   └── duitku.php                          # credentials + sandbox flag + callback/return URL
├── routes/
│   ├── admin.php                           # plan CRUD + permission + monitoring
│   ├── plan.php                            # subscribe + my subscription (user)
│   └── webhook.php                         # Duitku callback (no auth session; verifikasi signature)
└── .env.example                            # DUITKU_*
```

```text
apps/web/
├── src/
│   ├── features/
│   │   └── plan/
│   │       ├── pages/
│   │       │   ├── subscriptions/index.tsx      # daftar paket + pilih (mahasiswa)
│   │       │   └── my-subscription/index.tsx    # status langganan/riwayat pembayaran
│   │       ├── components/                      # feature-shared (jika ada)
│   │       └── types.ts
│   ├── features/admin/
│   │   └── pages/
│   │       ├── plans/index.tsx + partials/*     # CRUD + assign permission
│   │       └── users/                           # tambah tab/kolom paket + riwayat pembayaran
│   └── lib/ (permission/access helper bila perlu)
```

**Structure Decision**: Ikuti pola monorepo yang sudah ada — backend Laravel (`apps/api`) dengan `Action/Service/Model/Controller` + spatie permission, frontend SPA React (`apps/web`) dengan feature-based `features/<feature>/pages`. Route admin mengikuti `routes/admin.php` (role `super admin`). Webhook Duitku di file terpisah (`routes/webhook.php`) karena tidak memakai session auth — verifikasinya berbasis signature.
