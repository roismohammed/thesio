# Feature Specification: Chapter Paraphrase & Revision Assistant

**Feature Branch**: `008-chapter-paraphrase-assistant`

**Created**: 2026-09-06

**Status**: Draft

**Input**: User description: "fitur untuk paraphrase kombinasi dari notes/comment yang diberikan di bab tersebut dan bisa sekalian improve tulisan dari referensi yang diberikan."

## User Scenarios & Testing *(mandatory)*

Fitur ini membantu mahasiswa menyusun ulang dan meningkatkan kualitas tulisan draf pada bab skripsi. Sistem menggabungkan tiga unsur utama: draf teks asli bab, catatan/arahan revisi bimbingan pada bab tersebut, serta teks referensi rujukan (kutipan jurnal, buku, atau artikel ilmiah). Hasil paraphrase menyajikan draf baru yang lebih akademis, mematuhi masukan revisi, dan mengintegrasikan intisari referensi tanpa plagiarisme langsung.

### User Story 1 - Parafrase Teks Bab Berdasarkan Catatan Bimbingan (Priority: P1)

Mahasiswa memilih bagian teks draf bab yang perlu diperbaiki, memilih poin catatan bimbingan yang relevan pada bab tersebut (atau menambahkan catatan revisi singkat), lalu meminta asisten untuk memparafrase tulisan. Sistem menghasilkan draf perbaikan yang secara eksplisit menjawab masukan revisi dengan gaya penulisan akademis yang runtut.

**Why this priority**: Nilai inti fitur adalah menyelesaikan kebuntuan mahasiswa saat diminta merevisi bab sesuai arahan pembimbing. Menggabungkan draf teks dan catatan bimbingan menjadi fondasi utama (MVP) yang langsung memberi manfaat nyata.

**Independent Test**: Buka bab skripsi, pilih draf teks dan satu catatan bimbingan perbaikan, jalankan proses perbaikan, lalu verifikasi hasil paraphrase merangkum pesan draf awal sekaligus memenuhi arahan perbaikan bimbingan.

**Acceptance Scenarios**:

1. **Given** mahasiswa membuka bab skripsi yang memiliki draf teks dan catatan bimbingan, **When** mahasiswa memilih teks draf, memilih catatan bimbingan yang relevan, dan meminta generate paraphrase, **Then** sistem menyajikan draf hasil parafrase yang mempertahankan gagasan utama draf awal namun sudah mengakomodasi poin revisi pembimbing.
2. **Given** mahasiswa memilih lebih dari satu poin catatan bimbingan, **When** proses paraphrase dijalankan, **Then** sistem menyelaraskan seluruh poin catatan yang dipilih ke dalam satu alur paragraf yang koheren.
3. **Given** bab belum memiliki catatan bimbingan tersimpan, **When** mahasiswa menggunakan asisten paraphrase, **Then** mahasiswa dapat mengetikkan catatan/arahan revisi mandiri secara langsung.
4. **Given** teks draf yang dimasukkan kosong atau di bawah batas minimum (kurang dari 10 kata), **When** mahasiswa meminta paraphrase, **Then** sistem menampilkan pesan validasi ramah dan meminta mahasiswa memasukkan teks draf yang memadai.

---

### User Story 2 - Memperkaya Tulisan dengan Konteks Referensi Pendukung (Priority: P2)

Selain memasukkan catatan bimbingan, mahasiswa menyertakan kutipan/teks referensi ilmiah pendukung (misalnya cuplikan argumen teori atau data riset terdahulu). Sistem memadukan draf awal, catatan revisi, dan substansi referensi tersebut untuk menghasilkan paragraf baru yang argumentatif, berbobot ilmiah, serta menyertakan penanda sitasi konteks rujukan secara tepat.

**Why this priority**: Menjawab kebutuhan spesifik pengguna untuk "improve tulisan dari referensi yang diberikan", sehingga tulisan bab skripsi tidak sekadar diubah kata-katanya, melainkan meningkat bobot akademis dan ketajaman pembahasannya.

**Independent Test**: Masukkan draf paragraf, satu arahan revisi, dan satu teks referensi ilmiah. Pastikan hasil paraphrase memperkaya penjelasan draf dengan konsep dari referensi tanpa menyalin kata demi kata secara mentah.

**Acceptance Scenarios**:

1. **Given** mahasiswa telah mengisi draf teks dan catatan bimbingan, **When** mahasiswa menambahkan teks cuplikan referensi dan menjalankan asisten, **Then** hasil paraphrase memadukan substansi referensi ke dalam argumen bab secara kontekstual.
2. **Given** teks referensi yang dimasukkan berupa bahasa asing atau kalimat teknis yang rumit, **When** sistem memproses, **Then** sistem menerjemahkan dan mengadaptasi substansi konsep tersebut ke dalam bahasa Indonesia baku akademis yang mudah dipahami.
3. **Given** mahasiswa tidak menyertakan referensi (kolom referensi dikosongkan), **When** proses dijalankan, **Then** sistem tetap bekerja memparafrase draf hanya berdasarkan catatan bimbingan yang ada.

---

### User Story 3 - Perbandingan Draf, Penyesuaian Nada, dan Penerapan Perubahan (Priority: P3)

Setelah hasil paraphrase muncul, mahasiswa dapat melihat perbandingan berdampingan (side-by-side / diff highlight) antara teks draf awal dan rekomendasi baru. Mahasiswa dapat memilih nada/fokus penyempurnaan (lebih ringkas, lebih akademis/formal, atau lebih elaboratif), lalu memilih menerapkan draf baru ke dokumen bab atau menyalinnya ke papan klip.

**Why this priority**: Memberi kontrol penuh kepada mahasiswa sebagai penulis utama skripsi agar tidak ada perubahan teks yang tertimpa secara tidak sengaja dan mahasiswa dapat mengevaluasi kualitas tulisan sebelum menyetujuinya.

**Independent Test**: Tampilkan hasil rekomendasi, bandingkan teks asli vs hasil perbaikan, ubah mode gaya ke "Lebih Ringkas", konfirmasi pembaruan, dan terapkan teks ke draf bab.

**Acceptance Scenarios**:

1. **Given** rekomendasi paraphrase telah selesai dibuat, **When** mahasiswa melihat layar hasil, **Then** sistem menampilkan teks asli dan teks baru secara berdampingan dengan penanda perbedaan visual yang jelas.
2. **Given** mahasiswa ingin variasi alternatif, **When** mahasiswa memilih opsi penyesuaian (misal: "Lebih Ringkas" atau "Perdalam Analisis"), **Then** sistem memperbarui hasil paraphrase sesuai preferensi yang dipilih.
3. **Given** mahasiswa puas dengan hasil rekomendasi, **When** mahasiswa menekan tombol "Terapkan ke Bab", **Then** teks draf pada bab otomatis diperbarui dengan teks hasil paraphrase dan riwayat versi disimpan.
4. **Given** mahasiswa belum ingin menerapkan ke teks bab, **When** mahasiswa memilih "Salin Teks", **Then** teks tersalin ke papan klip dengan pemberitahuan konfirmasi berhasil.

---

### Edge Cases

- **Teks draf atau referensi melebihi kapasitas pemrosesan wajar**: Sistem membatasi panjang teks draf maksimal 1.500 kata dan teks referensi maksimal 1.000 kata per satu sesi paraphrase, disertai indikator penghitung kata interaktif.
- **Catatan bimbingan saling bertentangan**: Jika dua catatan yang dipilih memberikan arahan yang kontradiktif, sistem memprioritaskan catatan terbaru dan memberi catatan kecil pada penjelasan hasil.
- **Kegagalan layanan pemrosesan pintar / jaringan terputus**: Sistem mempertahankan draf input pengguna, tidak menghapus form, dan memberikan pesan kesalahan informatif dengan tombol coba lagi.
- **Karakter khusus, persamaan matematis, atau format kutipan baku**: Sistem menjaga integritas formula, simbol khusus, dan tahun sitasi agar tidak terhapus atau berubah format selama proses paraphrase.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Sistem HARUS memungkinkan mahasiswa memilih catatan bimbingan yang tersimpan pada bab aktif sebagai konteks perbaikan.
- **FR-002**: Sistem HARUS menyediakan input teks catatan/instruksi manual alternatif bagi mahasiswa yang ingin menambahkan arahan khusus di luar catatan bimbingan resmi.
- **FR-003**: Sistem HARUS menyediakan input khusus untuk memuat kutipan atau cuplikan teks referensi pendukung beserta informasi sumber singkat (misal: nama penulis dan tahun).
- **FR-004**: Sistem HARUS memproses kombinasi draf bab, catatan bimbingan, dan referensi pendukung untuk menghasilkan paragraf baru yang memenuhi kaidah bahasa Indonesia akademis (PUEBI/EYD).
- **FR-005**: Sistem HARUS memastikan hasil paraphrase tidak melakukan salin-tempel langsung (verbatim copy) dari teks referensi guna mencegah indikasi plagiarisme.
- **FR-006**: Sistem HARUS menyajikan tinjauan perbandingan antara draf awal dan draf rekomendasi sebelum perubahan diterapkan secara permanen pada bab.
- **FR-007**: Sistem HARUS menyediakan opsi penyempurnaan lanjutan terhadap hasil paraphrase (opsi gaya: standar akademis, lebih ringkas, atau lebih elaboratif).
- **FR-008**: Mahasiswa HARUS dapat menerapkan teks hasil paraphrase langsung ke dokumen bab yang sedang aktif atau menyalinnya ke clipboard.
- **FR-009**: Sistem HARUS memvalidasi panjang teks masukan draf (minimal 10 kata, maksimal 1.500 kata per sesi) dan teks referensi (maksimal 1.000 kata).
- **FR-010**: Sistem HARUS menyimpan riwayat sesi paraphrase pada bab tersebut sehingga mahasiswa dapat meninjau kembali rekomendasi yang pernah dibuat sebelumnya.

### Key Entities *(include if feature involves data)*

- **Paraphrase Session**: Mewakili satu aktivitas permintaan paraphrase pada bab tertentu. Menyimpan teks draf asal, ringkasan catatan revisi yang digunakan, teks referensi rujukan, parameter gaya yang dipilih, serta teks hasil rekomendasi akhir.
- **Chapter Supervision Note Link**: Relasi antara sesi paraphrase dengan catatan bimbingan bab yang menjadi rujukan perbaikan.
- **Paraphrase Revision History**: Catatan riwayat teks hasil perubahan yang telah disetujui dan diterapkan ke dalam draf bab, lengkap dengan waktu penerapan dan identitas pembuat.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Mahasiswa dapat menyelesaikan alur pembuatan paraphrase (memilih teks, catatan, referensi, hingga melihat hasil) dalam waktu kurang dari 45 detik.
- **SC-002**: Minimal 85% draf rekomendasi yang dihasilkan dinilai mahasiswa sesuai dengan arahan revisi bimbingan tanpa perlu penulisan ulang manual dari nol.
- **SC-003**: Pengurangan waktu revisi bab oleh mahasiswa sebesar minimal 40% dibandingkan proses menyusun ulang kalimat revisi secara manual.
- **SC-004**: 100% teks masukan pengguna tetap aman dan tidak hilang saat terjadi gangguan koneksi atau proses pemrosesan gagal.

## Assumptions

- Pengguna telah memilih atau membuka salah satu bab skripsi yang memiliki konten teks draf sebelum membuka asisten paraphrase.
- Format bahasa utama yang diproses dan dihasilkan adalah Bahasa Indonesia baku untuk penulisan karya ilmiah/skripsi perguruan tinggi.
- Fitur ini dirancang sebagai pendamping mandiri bagi mahasiswa; keputusan akhir penggunaan teks tetap berada di tangan mahasiswa.
- Fitur dapat digunakan baik saat bab memiliki catatan bimbingan tersimpan maupun saat mahasiswa hanya mengandalkan instruksi revisi manual.
- Layanan pemrosesan bahasa pintar tersedia dengan latensi standar aplikasi produktivitas modern.
