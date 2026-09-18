# Research: Admin User Suspend

**Feature**: `006-admin-user-suspend` | **Date**: 2026-08-30

Semua keputusan diriset langsung dari kode eksisting (tanpa NEEDS CLARIFICATION tersisa).

## R-1: Skema penyimpanan alasan suspend

**Decision**: Kolom baru `disabled_reason` (nullable `text`, maks 500 karakter diaudit di Level validasi) pada tabel `users`, bukan tabel `suspensions` terpisah.

**Rationale**: `is_disabled` boolean sudah ada di `users`. Spec (Edge Case + FR-006) mendefinisikan hanya SATU alasan aktif — alasan terakhir tersimpan, terhapus saat unsuspend. Ini state tunggal per user, relasi 1:1, bukan riwayat. Riwayat lengkap memang sudah disajikan activity log (Assumptions #4). Tabel `suspensions` terpisah memperkenalkan join + sync state dua tempat tanpa manfaat.

**Alternatives considered**:
- Tabel `suspensions` (created_by, reason, started_at, ended_at): ditolak — riwayat sudah di activity log, duplikat sumber kebenaran.
- Kolom JSON `suspension` di users: ditolak — over-modeling untuk dua scalar.

**Implementation note**: Migration meniru pola guard `Schema::hasColumn` dari `2026_08_03_000000_add_name_and_is_disabled_to_users_table.php`. `disabled_reason` masuk `$fillable` User (attribute `[Fillable]` PHP 8.5 style di `User.php`) dan `Hidden` tidak perlu (admin-only serialize).

## R-2: Mekanisme blokir sesi aktif (FR-005, SC-002, FR-011)

**Decision**: Middleware global `EnsureUserIsEnabled` di-append ke grup `web` (bisa juga `api`, tapi seluruh route API project memakai grup `web` + Sanctum stateful), menolak request user terautentikasi yang `is_disabled` dengan 403 JSON `{"message": "Akun Anda telah dinonaktifkan. Hubungi administrator."}`.

**Rationale**:
- Session auth Sanctum cookie: setiap request membawa session Laravel; status `is_disabled` dicek fresh dari DB tiap request → suspend efektif pada request BERIKUTNYA tanpa perlu menghapus session server-side. SC-002 "berhenti pada request pertama setelah suspend" terpenuhi karena tidak ada cache status di session/token.
- Ini satu titik pemeriksaan untuk SEMUA route (thesis, profile, admin, auth/logout) — sesuai Edge Case "semua jenis request (baca maupun tulis) mendapat penolakan yang sama".
- Alternatif "hapus session semua device saat suspend": butuh session driver DB + tracking session ID per user; `array`/`database` driver default tidak menyimpan index user_id. Middleware fresh-check lebih sederhana dan sudah memenuhi SC-002.
- Alternatif token revocation Sanctum: project memakai cookie session SPA, bukan personal access token — tidak relevan.

**Implementation note**: `bootstrap/app.php` → `$middleware->append(EnsureUserIsEnabled::class)` (global, jalan setelah StartSession/Authenticate dalam grup web). Cek hanya jika `Auth::user()` ada dan `is_disabled` → return 403 JSON (semua route project API — `shouldRenderJsonWhen` sudah force JSON untuk `api/*`). Middleware juga dijalankan pada `/api/auth/me` → FE dapat 403 lalu redirect login (FR-011).

**Alternatives considered**:
- Listener event `Illuminate\Auth\Events\Authenticated` (terminate session): ditolak — lebih magic, tetap butuh response 403 konsisten, middleware eksplisit lebih mudah diaudit.
- Policy-based check per controller: ditolak — harus dipasang di 20+ controller, satu lewat = lubang.

## R-3: Penolakan login (FR-012, FR-005)

**Decision**: Tidak ada perubahan — `AuthService::login()` + `AuthController::login()` sudah menolak akun `is_disabled` dengan 403 dan pesan "Akun ini telah dinonaktifkan. Hubungi administrator."

**Rationale**: Diverifikasi di `apps/api/app/Services/AuthService.php:28` — cek `is_disabled` sebelum `Auth::attempt`, log activity "Percobaan masuk ditolak ... (akun dinonaktifkan)". FE login page menampilkan `err.message` (ApiError) langsung. FR-012 terpenuhi by existing code.

## R-4: Self-suspend guard (FR-007)

**Decision**: `SuspendUserAction` menolak dengan `RuntimeException` (pattern eksisting di `DisableUserAction::execute` dan `UserManagementService::delete`) → kena 500 generic; ditingkatkan: Service menangkap `RuntimeException` dan mengembalikan HTTP 422 dengan pesan jelas via Form-bound exception, ATAU controller cek lebih awal.

**Rationale**: Konsisten dengan guard eksisting; tapi eksisting melempar 500. Spec menuntut "pesan bahwa super admin tidak dapat menonaktifkan akunnya sendiri" → response harus membawa pesan. Solusi termurah: `ValidationException::withMessages(['user' => '...'])` di Service/Action → Laravel merender 422 + message yang FE sudah tampilkan sebagai toast `err.message`.

**Alternatives considered**:
- Guard hanya di FE (disable tombol untuk row sendiri): tetap dipasang (UX), tapi tidak authoritative — BE tetap guard.

## R-5: Double-submit / idempotensi (Edge Case)

**Decision**: Tidak ada lock tambahan. Suspend dua kali = `is_disabled=true`, `disabled_reason` kedua yang tersimpan; hasil akhir sama. FE men-disable tombol saat `submitting` (pattern eksisting di `UserDialog`).

**Rationale**: Spec eksplisit: "Operasi terakhir yang tersimpan yang berlaku; sistem tidak mengunci data" + "idempoten untuk hasil akhir". Livelock optimis tak perlu.

## R-6: API shape suspend/unsuspend

**Decision**: Endpoint resource-scoped POST (bukan PATCH dengan flag `is_disabled`):
- `POST /api/admin/users/{user}/suspend` — body `{ reason: string (required, max:500) }` → 200 `{data: serialize(user)}`.
- `POST /api/admin/users/{user}/unsuspend` — body kosong → 200 `{data: serialize(user)}`.

**Rationale**: Suspend/unsuspend bukan edit field generik — punya aturan berbeda (alasan wajib vs tanpa input), audit berbeda, dan FE kini WAJIB menonaktifkan aksi langsung (FR-010). Endpoint eksplisit membuat Form Request validation bersih (`reason` wajib hanya di suspend). PATCH `is_disabled` yang lama pada `UserController@update` tetap ada untuk kompatibilitas dialog edit... tidak — spec FR-010: tidak ada jalur non-dialog. Update `UpdateUserRequest` menghapus `is_disabled` dari validated fields sehingga jalur PATCH tidak lagi bisa toggle status; akses status hanya via suspend/unsuspend.

**Alternatives considered**:
- PATCH `is_disabled` + `disabled_reason` optional: ditolak — suspend tanpa alasan jadi tak terdeteksi API-side (alasan wajib hanya bisa dijamak jika endpoint terpisah).
- DELETE soft-delete style "suspension resource": ditolak — over-modeling (suspend bukan entitas, lihat R-1).

## R-7: UI alasan suspend di daftar (FR-003)

**Decision**: Kolom Status menampilkan `Badge "Nonaktif"`; alasan disajikan via `Tooltip` hover pada badge ATAU baris info kecil di bawah nama. Pilihan: tooltip pada badge Nonaktif (baca alasan tanpa menambah kolom, menjaga density prinsip IV).

**Rationale**: Daftar sudah 5 kolom; alasan 500 karakter tak muat jadi kolom. Tooltip = komponen `components/ui/tooltip.tsx` eksisting, dark-mode parity ikut token.

**Alternatives considered**:
- Kolom "Alasan" tersendiri (truncate): ditolak — melebar-kan tabel, alasan panjang tetap terpotong.
- Expand row: kompleks untuk satu informasi.

## R-8: UI aksi di tabel (FR-010, US-4)

**Decision**: Hapus `Switch` toggle. Aksi via `DropdownMenu` (eksisting) + dua item baru: "Nonaktifkan" (membuka SuspendDialog bila belum disabled, "Aktifkan kembali" bila disabled) — dialog konfirmasi `Dialog` eksisting; Delete tetap dropdown item tapi kini membuka **AlertDialog** (destructive confirm). Tidak ada toggle one-click.

**Rationale**: `alert-dialog.tsx` sudah ada di `components/ui/` → tinggal pakai; memenuhi "dialog konfirmasi destructive". Suspend pakai `Dialog` dengan `Textarea` karena ada input wajib (beda kebutuhan dari AlertDialog polos).

**Alternatives considered**:
- Switch dengan confirm popover: inkonsisten dengan FR-010 (toggle visual = aksi langsung).
- AlertDialog untuk suspend juga: tidak bisa menampung textarea wajib dengan baik (AlertDialog memang untuk confirm tanpa input; base-ui dialog lebih tepat).

## R-9: Struktur FE refactor (Prinsip V + batas 300 baris)

**Decision**: `users/index.tsx` (≈515 baris) dipecah: `types.ts` (AdminUser, PaginationMeta, UserListResponse — dipakai oleh index + 2 partial), `partials/user-dialog.tsx` (create/edit, pindahan), `partials/suspend-dialog.tsx` (baru; menangani suspend + unsuspend mode). Named export dari partial. `index.tsx` tersisa list + filter + wiring < 300 baris.

**Rationale**: Batas konsituksi 300 baris/komponen; tipe dipakai > 1 file → file types terpisah. `suspend-dialog` satu komponen dua mode (suspend vs unsuspend) menghindari dua dialog hampir identik.

**Alternatives considered**:
- Satu file `confirm-dialogs.tsx` untuk semua dialog di page: bisa, tapi suspend punya state form (alasan) berbeda dari delete; terpisah lebih jelas.

## R-10: Audit narrative (FR-009, Prinsip III)

**Decision**: Extend pattern eksisting:
- Suspend: `"Menonaktifkan pengguna {name} ({email}) — alasan: {reason}."`
- Unsuspend: `"Mengaktifkan kembali pengguna {name} ({email}) — alasan penonaktifan dihapus."`
- Event `rbac` eksisting + `performedOn($user)->causedBy($actor)` tetap.

**Rationale**: `DisableUserAction` sudah memakai format `Pengguna ... dinonaktifkan.`; format baru lebih eksplisit menyebut alasan sesuai AC US-2 dan contoh accepted Prinsip III. Action `SuspendUserAction`/`UnsuspendUserAction` masing-masing menulis log saat eksekusi — satu entri per mutasi.

**Alternatives considered**:
- Log di Service: melanggar Prinsip I/II pemisahan — log menyertai eksekusi DB di Action.