# Tasks: Admin User Suspend

**Input**: Design documents from `/specs/006-admin-user-suspend/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/api.md, quickstart.md

**Tests**: Tidak ada test suite dalam pengerjaan project ini (aturan CLAUDE.md). Verifikasi via `php -l`, `npx tsc --noEmit --incremental`, inspeksi diff, dan validasi manual sesuai `quickstart.md`.

**Organization**: Tasks grouped by user story. Banyak infrastruktur (list pengguna, search/filter, login-block, delete guard) sudah eksisting — task hanya yang benar-benar baru.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Bisa paralel (file berbeda, tanpa dependensi)
- **[Story]**: Story tujuan (US1–US4 dari spec.md)
- Path relatif repo root

## Path Conventions

- **BE**: `apps/api/app/...` (Controller → Service → Action, Form Requests)
- **FE**: `apps/web/src/features/admin/pages/users/...` (feature-based + `partials/`)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Tidak ada inisialisasi baru — project dua app sudah berjalan. Sanity check baseline.

- [X] T001 Verifikasi posisi awal: `php -l` pada `apps/api/app/Actions/DisableUserAction.php` dan `apps/api/app/Services/UserManagementService.php`; `npx tsc --noEmit --incremental` di `apps/web` untuk memastikan baseline bersih sebelum perubahan

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Kolom alasan + middleware blokir sesi — prasyarat semua user story.

**⚠️ CRITICAL**: FR-003 (tampil alasan), FR-005 (blokir sesi), FR-006 (hapus alasan) semua bertumpu pada kolom `disabled_reason` dan middleware. Tidak ada story dimulai sebelum phase ini selesai.

- [X] T002 [P] Buat migration `apps/api/database/migrations/2026_08_30_000001_add_disabled_reason_to_users_table.php`: `up()` tambah `$table->text('disabled_reason')->nullable()` setelah `is_disabled`, guard `Schema::hasColumn` meniru pola `2026_08_03_000000_add_name_and_is_disabled_to_users_table.php`; `down()` dropColumn dengan guard sama
- [X] T003 [P] Update `apps/api/app/Models/User.php`: tambah `'disabled_reason'` ke attribute `#[Fillable([...])]`
- [X] T004 [P] Buat middleware `apps/api/app/Http/Middleware/EnsureUserIsEnabled.php`: kalau `Auth::user()` non-null dan `is_disabled === true` kembalikan `response()->json(['message' => 'Akun Anda telah dinonaktifkan. Hubungi administrator.'], 403)`; daftarkan via `$middleware->append()` di `apps/api/bootstrap/app.php`
- [X] T005 Jalankan `php artisan migrate` (dicek user — bukan auto-run) dan verifikasi kolom muncul; `php -l` pada file baru/tersentuh

**Checkpoint**: Kolom ada, middleware aktif — user dengan `is_disabled=true` langsung ditolak 403 pada request berikutnya.

---

## Phase 3: User Story 1 — Lihat daftar semua pengguna (Priority: P1) 🎯 MVP

**Goal**: Daftar pengguna menampilkan `disabled_reason` (kolom Status → tooltip badge Nonaktif); list/search/filter/pagination kebanyakan eksisting.

**Independent Test**: Login super admin, buka Manajemen Pengguna: kolom nama/email/peran/status tampil, pagination + cari + filter peran jalan, badge "Nonaktif" menyimpan alasan yang bisa dilihat (tooltip).

### Implementation for User Story 1

- [X] T006 [P] [US1] Update `apps/api/app/Http/Controllers/Admin/UserController.php` method `serialize()`: tambah field `'disabled_reason' => $user->disabled_reason` (null saat aktif)
- [X] T007 [P] [US1] Buat `apps/web/src/features/admin/pages/users/types.ts`: ekspor `AdminUser` (dengan `disabled_reason: string | null`), `PaginationMeta`, `UserListResponse` — pindahan dari `apps/web/src/features/admin/pages/users/index.tsx`, ganti import di index.tsx
- [X] T008 [US1] Ekstrak `UserDialog` dari `apps/web/src/features/admin/pages/users/index.tsx` ke `apps/web/src/features/admin/pages/users/partials/user-dialog.tsx` (named export) — index.tsx tersisa < 300 baris
- [X] T009 [US1] Di `apps/web/src/features/admin/pages/users/index.tsx`: bungkus Badge status "Nonaktif" dengan Tooltip (`apps/web/src/components/ui/tooltip.tsx`) berisi `user.disabled_reason`; tanpa tooltip bila null

**Checkpoint**: US1 mandiri — daftar lengkap + alasan terlihat. Verifikasi via quickstart.md skenario 1.

---

## Phase 4: User Story 2 — Suspend pengguna dengan alasan (Priority: P1)

**Goal**: Suspend via dialog (alasan wajib, maks 500) — ganti Switch one-click; blokir sesi aktif; guard self-suspend.

**Independent Test**: Suspend pengguna lain dengan alasan → badge Nonaktif + alasan; sesi aktif korban ditolak dan diarahkan ke login; login ulang ditolak dengan pesan; self-suspend ditolak 422 dengan pesan.

### Implementation for User Story 2

- [X] T010 [P] [US2] Buat `apps/api/app/Actions/SuspendUserAction.php`: guard self-suspend (`$actor->is($user)` → `ValidationException::withMessages(['user' => 'Anda tidak dapat menonaktifkan akun Anda sendiri.'])`), set `is_disabled=true` + `disabled_reason`, tulis activity log `rbac` narrative "Menonaktifkan pengguna {name} ({email}) — alasan: {reason}."
- [X] T011 [P] [US2] Buat `apps/api/app/Http/Requests/Auth/Admin/SuspendUserRequest.php`: rules `'reason' => ['required', 'string', 'max:500']`, custom messages Indonesia ("Alasan penonaktifan wajib diisi." / "Alasan penonaktifan maksimal 500 karakter.")
- [X] T012 [P] [US2] Update `apps/api/app/Http/Requests/Auth/Admin/UpdateUserRequest.php`: hapus rule `'is_disabled'` dari validated fields (satu-satunya jalur ubah status = suspend/unsuspend, FR-010)
- [X] T013 [US2] Update `apps/api/app/Services/UserManagementService.php`: tambah method `suspend(User $user, string $reason): User` dan `unsuspend(User $user): User` mendelegasikan ke Action; hapus dependensi `DisableUserAction` beserta method `disable()` bila jalurnya mati
- [X] T014 [US2] Update `apps/api/app/Http/Controllers/Admin/UserController.php`: tambah `suspend(SuspendUserRequest $request, User $user): JsonResponse` dan `unsuspend(Request $request, User $user): JsonResponse` (200, `data` = serialize + roles)
- [X] T015 [US2] Update `apps/api/routes/admin.php`: `Route::post('users/{user}/suspend', ...)` dan `Route::post('users/{user}/unsuspend', ...)` dalam grup eksisting
- [X] T016 [US2] Buat `apps/web/src/features/admin/pages/users/partials/suspend-dialog.tsx` mode suspend: `Dialog` + `Textarea` alasan wajib (counter N/500, trim), tombol destruktif "Nonaktifkan" disabled sampai alasan terisi, submit `POST /api/admin/users/{id}/suspend`, sukses → toast + `onSaved()`, error ApiError → toast `err.message`
- [X] T017 [US2] Update `apps/web/src/features/admin/pages/users/index.tsx`: hapus komponen `Switch` dan `toggleDisabled`; item dropdown "Nonaktifkan" (pengguna aktif lain) membuka suspend-dialog; state dialog + wiring reload

**Checkpoint**: US2 mandiri — suspend end-to-end + blokir sesi jalan. Verifikasi via quickstart.md skenario 2 & 5 (idempoten, double-click).

---

## Phase 5: User Story 3 — Unsuspend pengguna (Priority: P2)

**Goal**: Aktifkan kembali via dialog tanpa input; alasan terhapus; login & sesi baru normal.

**Independent Test**: Suspend lalu unsuspend → badge Aktif, alasan hilang dari daftar, korban bisa login dan request jalan normal.

### Implementation for User Story 3

- [X] T018 [P] [US3] Buat `apps/api/app/Actions/UnsuspendUserAction.php`: set `is_disabled=false` + `disabled_reason=null` (hapus alasan, FR-006), activity log `rbac` "Mengaktifkan kembali pengguna {name} ({email}) — alasan penonaktifan dihapus."
- [X] T019 [US3] Wire unsuspend BE: `apps/api/app/Services/UserManagementService.php` (delegasi `suspend()` sudah dari T013 — kaitan ke action `UnsuspendUserAction` di `unsuspend()`), konfirmasi endpoint dari `apps/api/routes/admin.php` (T015) mengarah ke `UserController::unsuspend` (T014)
- [X] T020 [US3] Update `apps/web/src/features/admin/pages/users/partials/suspend-dialog.tsx`: tambah mode unsuspend — `Dialog` konfirmasi tanpa input, tombol "Aktifkan Kembali", submit `POST /api/admin/users/{id}/unsuspend`
- [X] T021 [US3] Update `apps/web/src/features/admin/pages/users/index.tsx`: item dropdown dinamis — pengguna `is_disabled` → "Aktifkan Kembali" (mode unsuspend); label dialog + toast sukses sesuai mode

**Checkpoint**: US1+US2+US3 mandiri. Verifikasi via quickstart.md skenario 3.

---

## Phase 6: User Story 4 — Proteksi aksi destruktif (Priority: P2)

**Goal**: Hapus pengguna hanya via AlertDialog konfirmasi; tidak ada aksi one-click di tabel.

**Independent Test**: Semua aksi destruktif di halaman pengguna muncul dialog konfirmasi dulu; tidak ada toggle langsung.

### Implementation for User Story 4

- [X] T022 [US4] Update `apps/web/src/features/admin/pages/users/index.tsx`: item dropdown "Hapus" membuka `AlertDialog` (`apps/web/src/components/ui/alert-dialog.tsx`) konfirmasi penghapusan (`handleDelete` jalan hanya setelah konfirmasi), tombol konfirmasi styling destructive

**Checkpoint**: FR-010 terpenuhi — nol aksi destruktif tanpa dialog. Verifikasi via quickstart.md skenario 4.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Konsistensi lintas story dan verifikasi akhir.

- [X] T023 Audit jejak audit: review `apps/api/app/Actions/SuspendUserAction.php` + `apps/api/app/Actions/UnsuspendUserAction.php` — pastikan format narrative Prinsip III (causer, performedOn, event `rbac`, deskripsi informasi)
- [X] T024 Jalankan `php -l` semua file PHP tersentuh dan `npx tsc --noEmit --incremental` di `apps/web`; cek batas ukuran: class PHP ≤ 300 baris, method ≤ 100 baris, komponen React ≤ 300 baris (index.tsx, user-dialog, suspend-dialog)
- [X] T025 Validasi end-to-end manual mengikuti `specs/006-admin-user-suspend/quickstart.md` (5 skenario) — user menjalankan `bun run dev` + `php artisan serve` sendiri (aturan no auto-run)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: langsung jalan
- **Foundational (Phase 2)**: BLOCKS semua story (kolom + middleware prasyarat)
- **US1 (Phase 3)**: butuh Foundational; T007/T008 (types + partials) sebelum T017/T021/T022 (UI wiring menyentuh index.tsx yang sama — kerjakan berurutan)
- **US2 (Phase 4)**: butuh Foundational + struktur US1 (types/partials)
- **US3 (Phase 5)**: butuh skeleton US2 (service/controller/route)
- **US4 (Phase 6)**: butuh US2 (Switch sudah hilang, dropdown terstruktur)
- **Polish (Phase 7)**: setelah semua story

### User Story Dependencies

- **US1**: mandiri setelah Foundational
- **US2**: setelah US1 structural refactor; inti fitur
- **US3**: setelah US2 (reuse service/controller/dialog)
- **US4**: setelah US2

### Parallel Opportunities

- T002 + T003 + T004 paralel (file beda; T005 sebelum semua)
- T006, T007, T010, T011, T012 paralel (file nyaris tak sentuh satu sama lain)
- T018 (BE action) paralel dengan T020 (FE dialog mode)
- BE tasks (agent `ammar`) dan FE tasks (agent `sierly`) jalan berdampingan setelah kontrak `contracts/api.md`

---

## Implementation Strategy

### MVP First (US1 + US2)

1. Phase 1–2 (Setup + Foundational)
2. US1 (serialize + types + partials + tooltip)
3. US2 (suspend lengkap + blokir sesi)
4. STOP — VALIDATE via quickstart.md skenario 1, 2, 5
5. US1+US2 = inti fitur (lihat, suspend, blokir sesi aktif)

### Incremental Delivery

Foundation → US1 (tampil alasan) → US2 (suspend) → US3 (unsuspend) → US4 (confirm dialog) → Polish

### Delegation (aturan CLAUDE.md)

- BE tasks (T001–T006, T010–T015, T018–T019, T023 PHP): agent `ammar`
- FE tasks (T007–T009, T016–T017, T020–T022, T024 TS): agent `sierly`
- Push BE → baru review via `/code-review` level low (haikal) — hanya saat user minta push

---

## Notes

- Tidak membuat test otomatis — verifikasi via `php -l` + `npx tsc --noEmit --incremental` + quickstart manual
- `DisableUserAction` lama: matikan pemakaiannya (`UserManagementService::disable`, PATCH `is_disabled`), hapus bila tak ada pemakai lagi (deletion over addition)
- Invariant: `disabled_reason` non-null hanya saat `is_disabled=true` (dijaga di Action, bukan trigger DB)
- Commit per task / logical group; Conventional Commits, tanpa emoji, English identifier
- User-facing text Indonesia semi-formal friendly
