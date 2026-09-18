# Quickstart: Admin User Suspend

**Feature**: `006-admin-user-suspend` | Panduan validasi manual end-to-end

## Prasyarat

- `apps/api`: env ter-set, migrasi jalan (`php artisan migrate`), seeder user super admin tersedia (`php artisan db:seed` bila perlu; `DemoUserSeeder` ada di repo).
- `apps/web`: `bun run dev` — dijalankan OLEH USER (aturan project: tidak auto-run).
- Token/role: satu akun `super admin` + satu akun biasa (target suspend). Bisa dibuat lewat UI admin atau tinker.

## Skenario Validasi

### 1. Daftar pengguna lengkap (US-1)

1. Login sebagai super admin → buka **Manajemen Pengguna**.
2. Verifikasi: kolom nama, email, peran, status akses tampil; pagination jalan (buat >15 user bila perlu); cari berdasarkan nama/email; filter peran.
3. **Harapan**: daftar terfilter benar; user nonaktif menampilkan badge "Nonaktif"; hover badge menampilkan alasan penonaktifan.

### 2. Suspend dengan alasan (US-2)

1. Pada pengguna lain (bukan akun sendiri), buka menu aksi → **Nonaktifkan**.
2. Dialog terbuka dengan textarea alasan. Verifikasi tombol **Nonaktifkan** nonaktif selama alasan kosong.
3. Coba isi >500 karakter → dibatasi di 500 (counter di UI; server menolak lebih dengan pesan field).
4. Isi alasan, konfirmasi.
5. **Harapan**: toast sukses; badge jadi "Nonaktif"; tooltip menampilkan alasan; activity log (`activity_log`) berisi entri narrative "Menonaktifkan pengguna {name} ({email}) — alasan: ...".
6. Sesi korban (tab browser user target yang sedang login): klik apa pun / refresh → **harapan**: request ditolak, diarahkan ke halaman login secara rapi (bukan error mentah).
7. Korban coba login ulang dengan kredensial benar → **harapan**: ditolak, pesan "Akun ini telah dinonaktifkan. Hubungi administrator."
8. Coba nonaktifkan akun sendiri → **harapan**: ditolak dengan pesan "Anda tidak dapat menonaktifkan akun Anda sendiri." status akun admin tak berubah.

### 3. Unsuspend (US-3)

1. Pada pengguna nonaktif, menu aksi → **Aktifkan Kembali**.
2. Verifikasi dialog konfirmasi TANPA input.
3. Konfirmasi.
4. **Harapan**: toast sukses; badge kembali "Aktif"; alasan tidak tampil lagi (tooltip hilang); korban dapat login dan memakai aplikasi normal (sesi request termasuk data thesis jalan).
5. Activity log berisi entri "Mengaktifkan kembali pengguna {name} ({email}) — alasan penonaktifan dihapus.".

### 4. Aksi destruktif selalu via dialog (US-4)

1. Di daftar pengguna, jalankan aksi Hapus → **harapan**: AlertDialog konfirmasi muncul; pengguna baru terhapus setelah konfirmasi.
2. Hapus akun sendiri → ditolak (pesan eksisting "Anda tidak dapat menghapus akun Anda sendiri.").
3. Verifikasi tidak ada toggle/switch langsung pada kolom status.

### 5. Double-submit & idempotensi (Edge Cases)

1. Suspend korban yang sudah nonaktif dengan alasan baru → sukses, alasan terbaru tersimpan.
2. Double-click konfirmasi suspend → tidak ada error membingungkan; status tetap nonaktif.

## Checklist Otomatis (per aturan project)

- `php -l` pada setiap file PHP baru/tersentuh.
- `cd apps/web && npx tsc --noEmit --incremental` untuk FE.
- Inspeksi diff: Activity log narrative, 422/403 response, guard self-suspend.
- `php artisan migrate` untuk migration baru (kembalikan via `migrate:rollback` bila perlu dicek).
- Bukan running `php artisan test` — tidak ada test suite dalam project ini.