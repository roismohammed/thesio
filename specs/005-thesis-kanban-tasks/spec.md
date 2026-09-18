# Feature Specification: Thesis Kanban Task Board

**Feature Branch**: `005-thesis-kanban-tasks`

**Created**: 2026-08-07

**Status**: Draft

**Input**: User description: "Kanban task yang harus di kejar selama proses pengembangan skripsi, kanban task ini bertujuan untuk memudahkan mahasiswa untuk mengerjakan skripsi, memberikan saran dengan deadline yang dihitung lagi secara sistematis"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Mahasiswa Melihat Papan Kanban Tugas Skripsi (Priority: P1)

Seorang mahasiswa yang punya thesis aktif ingin melihat semua pekerjaan
skripsinya dalam satu papan kanban yang terstruktur. Setiap kolom papan
mewakili status tugas: belum dimulai, sedang dikerjakan, dan selesai. Setiap
kartu tugas menampilkan judul, deskripsi singkat, tenggat waktu, dan indikator
urgensi (seberapa dekat tenggatnya). Mahasiswa bisa memindahkan kartu antar
kolom dengan drag-and-drop untuk memperbarui status. Papan memberi gambaran
utuh progress skripsi dalam satu pandangan.

**Why this priority**: Papan kanban adalah fondasi fitur — tanpa papan, tidak
ada tempat menampilkan tugas, saran, maupun tenggat. Ini memberi nilai mandiri
sebagai alur pelacakan progress skripsi.

**Independent Test**: Dapat diuji dengan membuat beberapa tugas secara manual,
menampilkan papan dengan tiga kolom, dan memindahkan satu kartu dari "belum
dimulai" ke "selesai". Memberi nilai: mahasiswa langsung dapat melacak
progress pekerjaan skripsi.

**Acceptance Scenarios**:

1. **Given** mahasiswa punya thesis aktif dengan beberapa tugas, **When**
   mahasiswa membuka papan kanban tugas, **Then** semua tugas tampil terurut
   dalam kolom berdasarkan status (belum dimulai, sedang dikerjakan, selesai).
2. **Given** tugas tampil di papan, **When** mahasiswa memindahkan kartu tugas
   ke kolom lain, **Then** status tugas diperbarui dan papan menampilkan kartu
   di kolom baru secara langsung.
3. **Given** papan kanban tampil, **When** mahasiswa melihat kartu tugas,
   **Then** kartu menampilkan judul, deskripsi singkat, tenggat waktu, dan
   indikator urgensi (aman, mendekati, terlambat).

---

### User Story 2 - Mahasiswa Membuat dan Mengelola Tugas Secara Manual (Priority: P1)

Seorang mahasiswa ingin menambahkan tugas skripsi sendiri, misalnya "Kumpulkan
10 referensi untuk BAB 2" atau "Revisi paragraf 3 BAB 1". Mahasiswa mengisi
judul, deskripsi, dan opsional menautkan tugas ke chapter tertentu atau agenda
bimbingan tertentu. Tugas yang dibuat langsung muncul di papan kanban. Mahasiswa
juga dapat mengedit dan menghapus tugasnya sendiri.

**Why this priority**: Kemampuan membuat tugas manual adalah inti papan kanban.
Tanpa ini, papan hanya bisa diisi oleh saran sistem. P1 bersama papan karena
memungkinkan mahasiswa mencatat pekerjaan apa pun yang perlu dikejar.

**Independent Test**: Dapat diuji dengan membuat tugas baru lewat formulir,
verifikasi tugas muncul di papan, lalu mengedit judul dan menghapus tugas.
Memberi nilai: mahasiswa dapat mencatat dan mengelola semua pekerjaan
skripsinya.

**Acceptance Scenarios**:

1. **Given** mahasiswa di papan kanban, **When** mahasiswa membuat tugas baru
   dengan judul "Revisi BAB 1", **Then** tugas tersimpan dan muncul di kolom
   "belum dimulai".
2. **Given** tugas ada di papan, **When** mahasiswa mengedit deskripsi tugas,
   **Then** perubahan tersimpan dan tampil di kartu.
3. **Given** tugas ada di papan, **When** mahasiswa menghapus tugas, **Then**
   tugas hilang dari papan dan data terkait terhapus.

---

### User Story 3 - Sistem Menyarankan Tugas dengan Tenggat Dihitung Sistematis (Priority: P2)

Seorang mahasiswa yang sudah memiliki tenggat sidang (defense deadline) tidak
perlu memikirkan kapan setiap tugas harus selesai. Sistem (AI) menyarankan
tugas turunan dari dua sumber: notulen revisi dosen per chapter (catatan
bimbingan yang menandai bagian perlu direvisi) dan chapter yang belum lengkap
(masih berstatus draft). Sistem menghitung ulang tenggat setiap tugas secara
sistematis berdasarkan tenggat sidang dan urutan prioritas tugas. Mahasiswa
dapat menerima saran (tugas dibuat di papan) atau menolaknya. Tenggat dihitung
mundur dari tenggat sidang: tugas lebih prioritas mendapat tenggat lebih awal.
Papan kanban bisa diisi dua sumber: saran AI dan tugas buatan mahasiswa sendiri.

**Why this priority**: Saran otomatis dengan tenggat sistematis adalah
pembeda utama fitur ini dibandingkan papan kanban biasa. Ini mewujudkan tujuan
"memudahkan mahasiswa mengerjakan skripsi". P2 karena butuh papan (US1) dan
tugas manual (US2) sudah ada sebagai konteks data.

**Independent Test**: Dapat diuji dengan mengatur tenggat sidang, memicu
permintaan saran, verifikasi saran tugas muncul dengan tenggat yang lebih awal
dari tenggat sidang dan terurut berdasarkan prioritas, lalu menerima satu
saran dan memverifikasi tugas muncul di papan. Memberi nilai: mahasiswa
mendapat rencana kerja terjadwal otomatis tanpa harus memikirkan tenggat tiap
tugas.

**Acceptance Scenarios**:

1. **Given** thesis punya tenggat sidang 30 hari ke depan, ada chapter
   berstatus "draft", dan notulen revisi dosen di suatu chapter menandai
   bagian yang perlu direvisi, **When** sistem (AI) menyarankan tugas, **Then**
   saran tugas muncul dari dua sumber: tugas merevisi bagian yang ditandai
   notulen, dan tugas melengkapi chapter yang belum lengkap, masing-masing
   dengan tenggat dihitung sebelum tenggat sidang.
2. **Given** beberapa saran tugas ditampilkan, **When** mahasiswa melihat
   daftar saran, **Then** saran terurut berdasarkan prioritas dan setiap saran
   menampilkan tenggat yang dihitung sistematis.
3. **Given** saran tugas ditampilkan, **When** mahasiswa menerima satu saran,
   **Then** tugas dibuat di papan kanban di kolom "belum dimulai" dan saran
   ditandai diterima.
4. **Given** saran tugas ditampilkan, **When** mahasiswa menolak satu saran,
   **Then** saran dihapus dari daftar dan tidak menjadi tugas di papan.

---

### User Story 4 - Sistem Menghitung Ulang Tenggat Saat Tenggat Sidang Berubah (Priority: P2)

Tenggat sidang mahasiswa bisa berubah (dimajukan atau dimundur). Saat tenggat
sidang diperbarui, sistem menghitung ulang tenggat semua tugas yang masih belum
selesai berdasarkan tenggat sidang baru, menjaga urutan prioritas tetap
konsisten. Mahasiswa melihat tenggat tugas diperbarui otomatis tanpa harus
menghitung manual.

**Why this priority**: Tenggat sidang bisa berubah, dan tenggat tugas yang
stale akan menyesatkan mahasiswa. P2 karena bergantung pada tugas dan saran
sudah ada.

**Independent Test**: Dapat diuji dengan mengatur tenggat sidang, membuat
beberapa tugas dengan tenggat, lalu mengubah tenggat sidang lebih dekat dan
memverifikasi tenggat tugas yang belum selesai dihitung ulang lebih awal.
Memberi nilai: rencana kerja selalu selaras dengan tenggat sidang terbaru.

**Acceptance Scenarios**:

1. **Given** thesis punya tenggat sidang dan beberapa tugas belum selesai,
   **When** tenggat sidang diperbarui menjadi lebih dekat, **Then** tenggat
   semua tugas belum selesai dihitung ulang menjadi lebih awal sesuai urutan
   prioritas.
2. **Given** ada tugas sudah selesai, **When** tenggat sidang berubah, **Then**
   tenggat tugas yang sudah selesai tidak diubah (sudah lewat dikerjakan).
3. **Given** tenggat sidang dihapus (belum ditentukan), **When** sistem
   memproses tugas, **Then** tugas tidak punya tenggat otomatis dan indikator
   urgensi menampilkan status "tanpa tenggat".

---

### User Story 5 - Mahasiswa Melihat Indikator Urgensi dan Tugas Terlambat (Priority: P3)

Mahasiswa ingin tahu tugas mana yang mendekati tenggat atau sudah terlambat
agar dapat memprioritaskannya. Papan kanban menyorot kartu dengan warna
indikator urgensi: aman (masih lama), mendekati (segera), terlambat (lewat
tenggat), dan tanpa tenggat. Mahasiswa dapat mengurutkan atau memfilter papan
berdasarkan urgensi.

**Why this priority**: Visibilitas urgensi membantu mahasiswa fokus pada
tugas paling mendesak. P3 karena indikator adalah penyempurna pengalaman,
bukan fondasi pelacakan.

**Independent Test**: Dapat diuji dengan membuat tugas dengan berbagai tenggat
(lampau, dekat, jauh, tanpa tenggat) dan memverifikasi indikator urgensi
menampilkan warna/label berbeda untuk masing-masing. Memberi nilai: mahasiswa
cepat mengenali tugas mendesak.

**Acceptance Scenarios**:

1. **Given** tugas dengan tenggat sudah lewat, **When** papan ditampilkan,
   **Then** kartu tugas ditandai terlambat.
2. **Given** tugas dengan tenggat dalam beberapa hari, **When** papan
   ditampilkan, **Then** kartu ditandai mendekati.
3. **Given** tugas tanpa tenggat, **When** papan ditampilkan, **Then** kartu
   menampilkan status "tanpa tenggat" tanpa indikator warna urgensi.

### Edge Cases

- Apa yang terjadi ketika mahasiswa menolak saran lalu memicu saran lagi? Saran
  yang sudah pernah ditolak tidak muncul kembali dalam daftar saran aktif untuk
  thesis tersebut, agar tidak mengganggu.
- Apa yang terjadi ketika tenggat sidang diubah tetapi ada tugas yang tenggatnya
  sudah dimodifikasi manual oleh mahasiswa? Tugas yang tenggatnya diubah manual
  tidak ditimpa oleh hitung ulang otomatis; sistem menjadwalkan ulang hanya
  tugas yang masih memakai tenggat hasil hitungan sistem.
- Apa yang terjadi ketika semua tugas sudah selesai sebelum tenggat sidang?
  Sistem tidak menyarankan tugas baru; papan menampilkan status tercapai.
- Bagaimana sistem menangani tugas yang ditautkan ke chapter atau notulen
  revisi yang dihapus? Tautan menjadi null (tugas tetap ada, hanya hilang
  tautannya), tidak ikut terhapus.
- Apa yang terjadi ketika tidak ada tenggat sidang? Sistem tidak menghitung
  tenggat otomatis; tugas bisa dibuat manual tanpa tenggat atau mahasiswa
  dapat mengatur tenggat manual per tugas.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Sistem MUST menyediakan papan kanban tugas untuk setiap thesis
  aktif dengan tiga kolom status: belum dimulai, sedang dikerjakan, selesai.
- **FR-002**: Mahasiswa MUST dapat membuat tugas baru dengan judul, deskripsi,
  dan opsional tautan ke chapter atau agenda bimbingan tertentu.
- **FR-003**: Mahasiswa MUST dapat memindahkan tugas antar kolom melalui
  drag-and-drop untuk memperbarui status.
- **FR-004**: Mahasiswa MUST dapat mengedit dan menghapus tugas miliknya
  sendiri.
- **FR-005**: Sistem MUST menampilkan judul, deskripsi singkat, tenggat, dan
  indikator urgensi pada setiap kartu tugas.
- **FR-006**: Sistem (AI) MUST menyarankan tugas turunan dari dua sumber
  ketika mahasiswa meminta saran: (a) notulen revisi dosen per chapter — bagian
  yang ditandai perlu direvisi menjadi kandidat tugas revisi; (b) chapter yang
  belum lengkap (berstatus draft) — menjadi kandidat tugas melengkapi chapter.
- **FR-007**: Sistem MUST menghitung tenggat setiap tugas saran secara sistematis
  berdasarkan tenggat sidang dan urutan prioritas tugas (tugas lebih prioritas
  mendapat tenggat lebih awal).
- **FR-008**: Mahasiswa MUST dapat menerima saran (menjadi tugas di papan) atau
  menolak saran (dihapus dari daftar saran aktif).
- **FR-009**: Sistem MUST menghitung ulang tenggat semua tugas belum selesai
  secara otomatis ketika tenggat sidang diperbarui, menjaga urutan prioritas.
- **FR-010**: Sistem MUST tidak mengubah tenggat tugas yang sudah selesai atau
  tugas yang tenggatnya sudah dimodifikasi manual oleh mahasiswa saat hitung
  ulang otomatis.
- **FR-011**: Sistem MUST menampilkan indikator urgensi pada kartu: aman,
  mendekati, terlambat, dan tanpa tenggat.
- **FR-012**: Sistem MUST mengizinkan mahasiswa mengatur tenggat manual per
  tugas, yang akan ditandai sebagai tenggat manual dan dikecualikan dari hitung
  ulang otomatis.
- **FR-013**: Sistem MUST menangani absennya tenggat sidang dengan menonaktifkan
  hitung ulang otomatis dan mengizinkan tugas tanpa tenggat.
- **FR-014**: Sistem MUST mencatat aktivitas (create/update/delete) untuk
  setiap perubahan tugas dengan deskripsi naratif yang informatif.

### Key Entities *(include if feature involves data)*

- **Task**: Satu item pekerjaan skripsi yang harus dikejar mahasiswa. Atribut
  kunci: judul, deskripsi, status (belum dimulai / sedang dikerjakan /
  selesai), prioritas (urutan kepentingan), tenggat, penanda sumber (saran AI
  vs buatan mahasiswa), penanda tenggat manual vs otomatis, tautan opsional ke
  chapter, tautan opsional ke notulen revisi (SupervisionNote) sebagai sumber
  saran. Milik satu thesis. Papan kanban menerima tugas dari dua sumber: saran
  AI dan buatan mahasiswa sendiri.
- **TaskSuggestion**: Saran tugas dari sistem (AI) yang belum diterima
  mahasiswa. Atribut kunci: judul, deskripsi, prioritas terhitung, tenggat
  terhitung, sumber saran (notulen revisi dosen atau chapter belum lengkap),
  status (tertunda / diterima / ditolak). Saran yang diterima menjadi Task;
  yang ditolak tidak muncul lagi.
- **Thesis**: Entitas yang sudah ada; punya tenggat sidang yang dipakai sebagai
  acuan hitung ulang tenggat tugas. Tidak diubah struktur datanya oleh fitur
  ini, hanya dipakai sebagai sumber tenggat sidang.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Mahasiswa dapat melihat seluruh tugas skripsinya dalam satu papan
  kanban dan mengetahui status setiap tugas dalam waktu kurang dari 5 detik.
- **SC-002**: Mahasiswa dapat membuat tugas baru dan melihatnya di papan kanban
  dalam kurang dari 30 detik.
- **SC-003**: Saat mahasiswa meminta saran, sistem menampilkan daftar saran
  tugas dengan tenggat terhitung sistematis dalam waktu kurang dari 10 detik.
- **SC-004**: Saat tenggat sidang diubah, semua tugas belum selesai mendapat
  tenggat baru yang konsisten dengan urutan prioritas (tidak ada tugas prioritas
  lebih tinggi dengan tenggat lebih lambat daripada tugas prioritas lebih
  rendah).
- **SC-005**: Mahasiswa dapat mengidentifikasi tugas terlambat dan tugas
  mendekati tenggat hanya dari tampilan papan tanpa membuka detail tugas.
- **SC-006**: Fitur ini mengurangi waktu mahasiswa untuk merencanakan tenggat
  pekerjaan skripsi menjadi nyaris nol (sistematis otomatis) dibandingkan
  merencanakan tenggat tiap tugas secara manual.

## Assumptions

- Tenggat sidang (defense deadline) sudah tersedia di entitas Thesis dari fitur
  sebelumnya dan dipakai ulang sebagai acuan hitung ulang tenggat tugas; fitur
  ini tidak mengatur ulang tenggat sidang, hanya membacanya.
- Entitas Chapter dan SupervisionNote (notulen revisi dosen per chapter) sudah
  tersedia dari fitur sebelumnya (002 dan 004) dan dipakai sebagai sumber saran
  tugas; fitur ini tidak membuat ulang data tersebut.
- Sumber saran tugas terbatas pada notulen revisi dosen per chapter (bagian
  yang ditandai perlu direvisi) dan chapter yang belum lengkap (berstatus
  draft); template tahapan skripsi standar berada di luar cakupan v1.
- Saran tugas dihitung dan diminta on-demand oleh mahasiswa, bukan dijadwalkan
  otomatis di latar belakang (berbeda dari guidance bimbingan yang terjadwal).
- Satu thesis aktif per mahasiswa pada v1.
- Mahasiswa adalah satu-satunya aktor; dosen tidak berinteraksi dengan papan
  kanban tugas (sesuai filosofi Thesio: alur mandiri mahasiswa).
- Tenggat dihitung dengan distribusi proporsional mundur dari tenggat sidang
  berdasarkan urutan prioritas; ambang batas urgensi (aman / mendekati /
  terlambat) mengikuti konvensi umum (mis. mendekati = dalam beberapa hari,
  terlambat = lewat tenggat) — nilai ambang pasti ditentukan saat perencanaan
  teknis.
- Papan kanban ditampilkan dalam satu tampilan tiga kolom yang responsif untuk
  perangkat desktop; optimasi tampilan mobile menjadi cakupan versi
  berikutnya.