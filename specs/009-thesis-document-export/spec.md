# Feature Specification: Thesis Document Export (DOCX & PDF)

**Feature Branch**: `009-thesis-document-export`

**Created**: 2026-09-12

**Status**: Draft

**Input**: User description: "Tambahkan fitur export draf skripsi ke format DOCX dan PDF"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Export Dokumen Skripsi Lengkap ke DOCX & PDF (Priority: P1) 🎯 MVP

Mahasiswa yang telah menulis draf skripsinya dapat mengekspor seluruh bab skripsi secara utuh ke dalam berkas siap unduh berformat Microsoft Word (.docx) atau Dokumen PDF (.pdf) dengan struktur penomoran bab dan format akademis standar.

**Why this priority**: Merupakan kebutuhan paling esensial bagi mahasiswa untuk mencetak, membagikan, atau mengunggah draf skripsi lengkap ke dosen pembimbing atau portal akademik kampus.

**Independent Test**: Mahasiswa membuka halaman skripsi yang memiliki beberapa bab berisi tulisan, menekan tombol "Export Dokumen", memilih format (DOCX atau PDF), mengklik tombol unduh, dan menerima berkas terformat rapi yang memuat seluruh bab secara berurutan.

**Acceptance Scenarios**:

1. **Given** mahasiswa memiliki skripsi dengan minimal satu bab yang terisi konten, **When** mahasiswa memilih opsi export "Seluruh Skripsi" dengan format DOCX lalu menekan "Unduh", **Then** sistem mengunduh berkas `.docx` yang memuat halaman judul skripsi dan teks semua bab secara terurut berurutan.
2. **Given** mahasiswa berada pada dialog export skripsi, **When** mahasiswa memilih opsi export format PDF lalu menekan "Unduh", **Then** sistem menghasilkan dan mengunduh berkas `.pdf` dengan tata letak dokumen yang rapi dan siap cetak.
3. **Given** mahasiswa memiliki skripsi yang seluruh babnya masih kosong tanpa teks, **When** mahasiswa membuka menu export, **Then** sistem menampilkan peringatan informatif bahwa dokumen belum memiliki isi untuk diekspor dan menonaktifkan tombol unduh.

---

### User Story 2 - Export Per Bab Tertentu (Priority: P2)

Mahasiswa dapat memilih untuk mengekspor hanya satu bab tertentu (misalnya Bab 1 Pendahuluan atau Bab 3 Metodologi) ke format DOCX atau PDF untuk keperluan bimbingan parsial berkala tanpa harus mengekspor keseluruhan draf.

**Why this priority**: Pada praktiknya, dosen pembimbing seringkali meminta revisi atau pengumpulan draf per bab satu per satu selama proses bimbingan berjalan.

**Independent Test**: Mahasiswa berada di editor bab tertentu atau modal export, memilih opsi "Hanya Bab Ini", memilih format DOCX atau PDF, dan berkas yang terunduh hanya berisi konten bab yang dipilih.

**Acceptance Scenarios**:

1. **Given** mahasiswa sedang membuka editor Bab 2 Tinjauan Pustaka, **When** mahasiswa mengklik opsi "Export Bab Ini" ke format PDF, **Then** sistem mengunduh berkas `.pdf` yang hanya memuat judul dan isi konten Bab 2.
2. **Given** mahasiswa memilih export per bab dalam format DOCX, **When** proses unduh selesai, **Then** dokumen Word yang dihasilkan dapat langsung diedit di aplikasi pengolah kata dengan penataan heading bab yang sesuai.

---

### User Story 3 - Kustomisasi Tata Letak & Opsi Kelengkapan Dokumen (Priority: P3)

Mahasiswa dapat menyesuaikan kelengkapan dokumen yang disertakan dalam berkas ekspor, seperti menyertakan halaman sampul/informasi mahasiswa, memilih ukuran kertas (A4), serta memilih bab-bab tertentu yang ingin digabungkan ke dalam dokumen ekspor.

**Why this priority**: Memberikan fleksibilitas bagi mahasiswa untuk menyesuaikan dokumen ekspor dengan panduan selingkung kampus masing-masing.

**Independent Test**: Mahasiswa membuka menu export skripsi, mencentang hanya Bab 1 dan Bab 2, menyertakan halaman metadata sampul, memilih ukuran kertas A4, lalu mengunduh berkas, dan memverifikasi dokumen hanya memuat elemen-elemen yang dipilih.

**Acceptance Scenarios**:

1. **Given** mahasiswa berada pada dialog kustomisasi export, **When** mahasiswa memilih beberapa bab tertentu melalui daftar centang bab (multi-select), **Then** berkas yang diekspor menggabungkan bab-bab yang dipilih secara runtut.
2. **Given** mahasiswa mengaktifkan opsi "Sertakan Halaman Sampul", **When** dokumen diekspor, **Then** bagian awal dokumen memuat judul skripsi, nama mahasiswa, program studi, dan tanggal ekspor sebelum memasuki bab pertama.
3. **Given** terjadi kegagalan jaringan atau berkas gagal dibuat saat proses export berlangsung, **When** mahasiswa menunggu proses, **Then** sistem menampilkan pesan kesalahan yang ramah dan opsi untuk mencoba kembali tanpa memuat ulang halaman.

---

### Edge Cases

- **Konten Draf Kosong**: Apa yang terjadi jika mahasiswa mencoba mengekspor bab yang belum memiliki teks? Sistem menampilkan pesan peringatan bahwa konten bab masih kosong dan mencegah proses export.
- **Karakter Khusus & Simbol Matematika**: Bagaimana sistem menangani konten yang memuat tabel, simbol khusus, atau format teks tebal/miring/daftar poin? Sistem mempertahankan struktur format teks (heading, bold, italic, unordered list, ordered list, quote) pada berkas DOCX dan PDF hasil export.
- **Draf Berukuran Sangat Panjang**: Bagaimana sistem menangani skripsi dengan puluhan halaman dan gambar? Sistem memproses dokumen dalam batas waktu wajar dan menyajikan indikator status pemuatan (loading state) yang jelas kepada mahasiswa hingga berkas siap diunduh.
- **Akses Pengguna**: Bagaimana jika pengguna yang tidak memiliki hak akses atas skripsi mencoba mengunduh dokumen? Sistem memvalidasi kepemilikan dokumen dan menolak akses tidak sah.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Sistem HARUS memungkinkan mahasiswa mengekspor seluruh bab skripsi yang tersimpan menjadi berkas berformat Microsoft Word (`.docx`).
- **FR-002**: Sistem HARUS memungkinkan mahasiswa mengekspor seluruh bab skripsi yang tersimpan menjadi berkas berformat Adobe PDF (`.pdf`).
- **FR-003**: Sistem HARUS menyediakan opsi bagi mahasiswa untuk mengekspor dokumen per bab tunggal yang sedang aktif.
- **FR-004**: Sistem HARUS menyediakan dialog antarmuka pemilihan format (DOCX vs PDF), cakupan bab (Seluruh Skripsi vs Bab Tertentu), dan opsi kelengkapan (halaman sampul/metadata).
- **FR-005**: Dokumen hasil export HARUS mempertahankan hirarki heading bab, sub-bab, serta pemformatan teks dasar (tebal, miring, poin/daftar bernomor, kutipan).
- **FR-006**: Dokumen hasil export HARUS mengikuti tata letak standar dokumen ilmiah (ukuran kertas A4, margin standar dokumen akademis, nomor halaman berurutan).
- **FR-007**: Sistem HARUS menyertakan penamaan berkas yang deskriptif dan konsisten saat diunduh (contoh: `Skripsi_[JudulSingkat]_[Tanggal].[ekstensi]`).
- **FR-008**: Sistem HARUS memvalidasi bahwa hanya pemilik skripsi atau pengguna berwenang yang dapat mengekspor draf skripsi terkait.
- **FR-009**: Sistem HARUS menampilkan indikator status proses yang jelas saat dokumen sedang dikompilasi hingga berkas terunduh di perangkat mahasiswa.

### Key Entities *(include if feature involves data)*

- **Thesis Document**: Entitas skripsi utama yang memuat judul, ringkasan, metadata mahasiswa (nama, institusi, jurusan), dan kumpulan bab.
- **Thesis Chapter**: Entitas bab skripsi yang memuat nomor bab, judul bab, urutan susunan, serta isi draf teks.
- **Export Request / Configuration**: Parameter permintaan ekspor dari pengguna, mencakup format berkas yang dipilih (`docx` atau `pdf`), daftar ID bab yang disertakan, opsi halaman sampul, dan preferensi tata letak.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Mahasiswa dapat mengunduh berkas draf skripsi lengkap (DOCX atau PDF) dalam waktu kurang dari 5 detik setelah menekan tombol unduh pada kondisi koneksi normal.
- **SC-002**: 100% struktur teks (judul bab, paragraf, daftar poin, dan format cetak tebal/miring) dari editor berhasil terpetakan dengan tepat ke dokumen DOCX dan PDF tanpa teks yang hilang.
- **SC-003**: Berkas DOCX yang diunduh dapat dibuka langsung di aplikasi Microsoft Word, Google Docs, dan LibreOffice tanpa menampilkan galat berkas korup.
- **SC-004**: Tingkat keberhasilan proses ekspor mencapai minimal 99% untuk draf skripsi hingga 100 halaman dokumen.
- **SC-005**: 90% mahasiswa menyatakan proses pengunduhan dokumen skripsi jelas, mudah ditemukan, dan hasil dokumen sesuai standar format akademik.

## Assumptions

- Konten bab skripsi tersimpan dalam format teks berstruktur (rich text / HTML / Markdown) yang dapat dikonversi ke dokumen pengolah kata dan dokumen cetak.
- Format tata letak dokumen menggunakan standar umum naskah ilmiah berbahasa Indonesia (kertas A4, penomoran halaman, spasi teks teratur).
- Fitur ekspor dapat diakses langsung oleh mahasiswa pemilik draf skripsi tanpa memerlukan persetujuan dosen pembimbing.
