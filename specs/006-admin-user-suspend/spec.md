# Feature Specification: Admin User Suspend

**Feature Branch**: `006-admin-user-suspend`

**Created**: 2026-08-30

**Status**: Draft

**Input**: User description: "fitur melihat semua pengguna untuk super admin dan super admin bisa melakukan suspend ke user ini berguna jika user melakukan pelanggaran terhadap aplikasi. Suspend memblokir login dan semua API request dari sesi aktif. UI suspend pakai confirm dialog dengan alasan wajib diisi saat suspend; unsuspend tanpa input, menghapus alasan."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Lihat daftar semua pengguna (Priority: P1)

Super admin membuka halaman manajemen pengguna dan melihat seluruh pengguna aplikasi dalam daftar terpaginasi: nama, email, peran (role), dan status akses (aktif / dinonaktifkan). Untuk pengguna yang dinonaktifkan, super admin dapat melihat alasan penonaktifannya. Super admin dapat mencari pengguna berdasarkan nama/email dan memfilter berdasarkan peran.

**Why this priority**: Fondasi seluruh fitur — tanpa daftar pengguna, aksi suspend tidak dapat dilakukan. Sebagian besar sudah tersedia di aplikasi saat ini; cerita ini memastikan kelengkapan informasi (termasuk alasan suspend) dan kualitas tampilan daftar.

**Independent Test**: Login sebagai super admin, buka halaman manajemen pengguna, dan verifikasi daftar pengguna tampil lengkap dengan status dan alasan (bila ada), pencarian dan filter berfungsi.

**Acceptance Scenarios**:

1. **Given** super admin sudah login, **When** membuka halaman manajemen pengguna, **Then** daftar pengguna tampil dengan kolom nama, email, peran, dan status akses.
2. **Given** terdapat lebih dari satu halaman pengguna, **When** super admin berpindah halaman, **Then** daftar pengguna halaman berikutnya tampil dengan benar.
3. **Given** terdapat pengguna dengan nama tertentu, **When** super admin mencari nama/email tersebut, **Then** hanya pengguna yang cocok yang tampil.
4. **Given** terdapat pengguna yang dinonaktifkan beserta alasannya, **When** super admin melihat baris pengguna tersebut, **Then** status "Nonaktif" tampil dan alasan penonaktifan dapat dilihat.

---

### User Story 2 - Suspend pengguna dengan alasan (Priority: P1)

Super admin menonaktifkan (suspend) akun pengguna yang melakukan pelanggaran melalui dialog konfirmasi. Alasan suspend **wajib** diisi; tombol konfirmasi tidak aktif selama alasan kosong. Setelah disuspend, pengguna langsung tidak dapat lagi: masuk ke aplikasi (login ditolak dengan pesan yang jelas) dan menggunakan sesi yang sedang aktif (semua request dari sesi tersebut ditolak dan pengguna diarahkan keluar dari aplikasi). Super admin tidak dapat mensuspend akunnya sendiri.

**Why this priority**: Inti dari fitur ini — mekanisme penegakan aturan terhadap pengguna yang melanggar. Efek pemblokiran (login + sesi aktif) adalah kebutuhan keamanan yang eksplisit.

**Independent Test**: Dari akun super admin, suspend akun lain dengan alasan; verifikasi sesi aktif korban langsung ditolak dan diarahkan ke halaman login, percobaan login baru ditolak dengan pesan keterangannya, dan alasan tersimpan serta tampil di daftar pengguna.

**Acceptance Scenarios**:

1. **Given** super admin melihat daftar pengguna, **When** memilih aksi nonaktifkan pada pengguna lain, **Then** dialog konfirmasi muncul dengan input alasan yang wajib diisi.
2. **Given** dialog suspend terbuka dengan input alasan kosong, **When** super admin melihat dialog, **Then** tombol konfirmasi dalam keadaan nonaktif sampai alasan diisi.
3. **Given** alasan sudah diisi, **When** super admin mengonfirmasi suspend, **Then** status pengguna berubah menjadi "Nonaktif" beserta alasannya (terlihat di daftar pengguna) dan muncul notifikasi sukses.
4. **Given** pengguna sedang login di perangkatnya sendiri, **When** akunnya disuspend oleh super admin, **Then** request berikutnya dari sesi tersebut ditolak dan pengguna diarahkan keluar ke halaman login.
5. **Given** pengguna yang sudah disuspend mencoba login dengan kredensial yang benar, **When** proses login dijalankan, **Then** login ditolak dengan pesan bahwa akun telah dinonaktifkan dan disarankan menghubungi administrator.
6. **Given** super admin memilih aksi nonaktifkan pada akunnya sendiri, **When** aksi dijalankan, **Then** sistem menolak dengan pesan bahwa super admin tidak dapat menonaktifkan akunnya sendiri.

---

### User Story 3 - Unsuspend (aktifkan kembali) pengguna (Priority: P2)

Super admin mengaktifkan kembali akun pengguna yang disuspend melalui dialog konfirmasi sederhana (tanpa input). Setelah diaktifkan, alasan suspend lama dihapus (tidak tampil lagi di daftar), pengguna dapat login kembali, dan sesi barunya berfungsi normal.

**Why this priority**: Kebalihan dari suspend — diperlukan agar penonaktifan bersifat revocable, tetapi bukan alur utama fitur.

**Independent Test**: Dari akun super admin, aktifkan kembali akun yang disuspend; verifikasi alasan hilang dari daftar, korban dapat login kembali, dan aplikasi dapat digunakan normal.

**Acceptance Scenarios**:

1. **Given** terdapat pengguna berstatus "Nonaktif", **When** super admin memilih aksi aktifkan kembali, **Then** dialog konfirmasi muncul tanpa input tambahan.
2. **Given** super admin mengonfirmasi pengaktifan kembali, **When** aksi selesai, **Then** status pengguna kembali "Aktif", alasan suspend lama tidak tampil lagi, dan muncul notifikasi sukses.
3. **Given** pengguna yang baru diaktifkan kembali, **When** login dengan kredensial yang benar, **Then** login berhasil dan aplikasi dapat digunakan normal.

---

### User Story 4 - Proteksi aksi destruktif (Priority: P2)

Aksi yang berdampak besar (suspend/unsuspend, hapus pengguna) selalu melalui dialog konfirmasi — tidak ada toggle atau aksi yang berjalan langsung dari tabel. Penghapusan pengguna juga menampilkan dialog konfirmasi sebelum dieksekusi.

**Why this priority**: Kualitas pengalaman admin dan pencegahan salah klik; mendampingi story utama.

**Independent Test**: Buka daftar pengguna, jalankan setiap aksi dan pastikan selalu ada dialog konfirmasi sebelum perubahan terjadi.

**Acceptance Scenarios**:

1. **Given** daftar pengguna terbuka, **When** super admin menekan aksi hapus pada pengguna, **Then** dialog konfirmasi penghapusan muncul, dan pengguna baru benar-benar terhapus setelah dikonfirmasi.
2. **Given** daftar pengguna terbuka, **When** super admin melihat aksi suspend/unsuspend, **Then** kedua aksi hanya tersedia via dialog konfirmasi (tidak ada toggle langsung).

---

### Edge Cases

- Apa yang terjadi ketika super admin mensuspend akunnya sendiri? Sistem menolak dengan pesan jelas — akun super admin tidak boleh dinonaktifkan oleh dirinya sendiri.
- Apa yang terjadi ketika super admin menghapus pengguna yang sedang login? Pengguna tersebut logout dan datanya hilang — aksi ini tetap tersedia (sudah ada) tetapi kini selalu lewat dialog konfirmasi.
- Apa yang terjadi ketika alasan suspend berisi 500+ karakter? Sistem membatasi maksimal 500 karakter dan tidak menerima lebih.
- Apa yang terjadi ketika dua super admin mengelola pengguna yang sama bersamaan? Operasi terakhir yang tersimpan yang berlaku; sistem tidak mengunci data.
- Apa yang terjadi ketika super admin suspend pengguna lalu korban refresh halaman? Korban diarahkan ke halaman login, bukan melihat error mentah.
- Apa yang terjadi ketika permintaan suspend dikirim dua kali (double-click)? Sistem idempoten untuk hasil akhir — pengguna tetap berstatus nonaktif dengan alasan terakhir yang tersimpan, tanpa error yang membingungkan.
- Apa yang terjadi ketika sesi korban ditolak karena suspend? Semua jenis request dari sesi tersebut (baca maupun tulis) mendapat penolakan yang sama dengan pesan yang konsisten.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Super admin MUST dapat melihat daftar seluruh pengguna dengan nama, email, peran, dan status akses, terpaginasi.
- **FR-002**: Super admin MUST dapat mencari pengguna berdasarkan nama atau email, dan memfilter berdasarkan peran.
- **FR-003**: Super admin MUST dapat melihat alasan penonaktifan pada pengguna berstatus nonaktif.
- **FR-004**: Super admin MUST dapat mensuspend pengguna lain melalui dialog konfirmasi dengan alasan wajib diisi (maksimal 500 karakter); tombol konfirmasi nonaktif selama alasan kosong.
- **FR-005**: Sistem MUST menolak seluruh permintaan (login maupun request dari sesi aktif) dari pengguna yang berstatus dinonaktifkan, dengan pesan yang konsisten dan jelas.
- **FR-006**: Sistem MUST menghapus alasan suspend ketika pengguna diaktifkan kembali.
- **FR-007**: Sistem MUST menolak suspend terhadap akun super admin oleh dirinya sendiri.
- **FR-008**: Hanya pengguna dengan peran super admin yang dapat mengakses halaman dan seluruh aksi manajemen pengguna; pengguna lain mendapat akses ditolak.
- **FR-009**: Sistem MUST mencatat jejak audit untuk setiap perubahan status akses pengguna: siapa yang melakukan, pada siapa, apa perubahannya, beserta alasan bila ada.
- **FR-010**: Aksi suspend, unsuspend, dan hapus pengguna di UI MUST selalu melewati dialog konfirmasi; tidak ada aksi langsung (one-click) pada tabel.
- **FR-011**: Ketika sesi pengguna yang disuspend menerima penolakan, aplikasi MUST mengarahkan pengguna ke halaman login dengan cara yang rapi (bukan error mentah), dan status login pengguna di aplikasi diperbarui menjadi keluar.
- **FR-012**: Pengguna yang disuspend yang mencoba login MUST menerima pesan bahwa akunnya dinonaktifkan dan disarankan menghubungi administrator.

### Key Entities *(include if feature involves data)*

- **User**: akun pengguna aplikasi. Atribut terkait fitur: nama, email, peran (bisa lebih dari satu), status akses (aktif/dinonaktifkan), alasan penonaktifan (hanya terisi saat nonaktif, terhapus saat aktif kembali), jejak audit perubahan status.
- **Role**: peran pengguna yang menentukan hak akses; super admin memiliki hak penuh atas manajemen pengguna.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Super admin dapat menemukan pengguna tertentu di daftar (termasuk mencari/memfilter) dalam waktu kurang dari 10 detik.
- **SC-002**: Seluruh sesi aktif pengguna yang disuspend berhenti berfungsi pada request pertama setelah suspend — tanpa celah akses lebih lanjut.
- **SC-003**: 100% percobaan login oleh akun yang disuspend ditolak dengan pesan yang menjelaskan status akun.
- **SC-004**: Setiap perubahan status akses pengguna memiliki satu entri jejak audit yang berisi pelaku, target, arah perubahan (suspend/unsuspend), dan alasan (bila suspend).
- **SC-005**: Nol aksi destruktif di halaman manajemen pengguna yang bisa terjadi tanpa melalui dialog konfirmasi.
- **SC-006**: Super admin dapat menyelesaikan alur suspend (temukan pengguna → suspend dengan alasan) dalam waktu kurang dari 30 detik.

## Assumptions

- Fitur mengembangkan halaman manajemen pengguna super admin yang sudah ada (daftar pengguna, CRUD, role assignment sudah berfungsi); pekerjaan utama adalah alasan suspend, pemblokiran sesi aktif, dan dialog konfirmasi.
- Penonaktifan bersifat administratif (moderasi akun), bukan penghapusan data — data skripsi dan milik pengguna tidak disentuh saat suspend.
- Tidak ada notifikasi email ke pengguna yang disuspend pada fase ini; komunikasi alasan cukup lewat admin (out of scope).
- Alasan suspend dibaca admin melalui halaman manajemen pengguna; riwayat lengkap tersedia di jejak audit (activity log) yang sudah ada.
- Aplikasi web (SPA) adalah satu-satunya antarmuka yang perlu menghormati status suspend pada fase ini.