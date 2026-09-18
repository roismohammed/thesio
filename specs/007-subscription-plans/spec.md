# Feature Specification: Subscription Plans & Payments

**Feature Branch**: `007-subscription-plans`

**Created**: 2026-08-31

**Status**: Draft

**Input**: User description: "fitur plan pada aplikasi jadi mahasiswa nanti ketika mendaftar awalnya langsung dapat trial paket tertinggi selama 14 hari, pembayaran menggunakan duitku, setiap paket punya permission masing-masing ke menu, super admin berwenang mengubah permission per plan, plan dibuat crud dari admin dan seeder paket 25K, 80K, 120K, admin bisa melihat data user/mahasiswa beserta paket dan pembayarannya."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Admin mengelola daftar paket langganan (Priority: P1)

Super admin membuka halaman pengelolaan paket, melihat daftar paket yang tersedia, menambah paket baru, mengubah nama/harga/deskripsi, menonaktifkan paket, dan menghapus paket yang tidak terpakai. Untuk setiap paket, super admin juga menetapkan permission/hak akses ke menu-menu aplikasi tertentu.

**Why this priority**: Tanpa paket yang terdefinisi belum ada kerangka langganan, trial, maupun payment. Seluruh alur lain bergantung pada paket yang dapat dibuat dan dikonfigurasi permission-nya. P1 karena ini fondasi data.

**Independent Test**: Dapat diuji dengan super admin menambah paket "Standar" (harga 80.000), menetapkan subset menu yang diizinkan, lalu melihat paket muncul dalam daftar. Menghasilkan kemampuan kelola paket + permission yang berdiri sendiri.

**Acceptance Scenarios**:

1. **Given** seorang super admin yang sudah login, **When** ia membuka halaman paket, **Then** melihat daftar paket dengan nama, harga, status, dan menu yang diizinkan.
2. **Given** super admin berada di halaman paket, **When** ia membuat paket baru dengan nama, harga, dan set permission menu, **Then** paket tersimpan dan muncul di daftar.
3. **Given** super admin melihat detail sebuah paket, **When** ia mengubah set permission menu paket tersebut, **Then** perubahan tersimpan dan berlaku untuk langganan paket itu.
4. **Given** sebuah paket yang sedang dipakai oleh minimal satu user, **When** super admin mencoba menghapusnya, **Then** sistem menolak penghapusan dan memberi pesan bahwa paket sedang digunakan.
5. **Given** sebuah paket yang tidak dipakai user mana pun, **When** super admin menghapusnya, **Then** paket hilang dari daftar.

### User Story 2 - Mahasiswa baru otomatis mendapat trial paket tertinggi (Priority: P1)

Saat seorang mahasiswa selesai mendaftar akun, sistem secara otomatis memberinya langganan trial paket tertinggi (120K) selama 14 hari pertama. Selama masa trial, mahasiswa bisa merasakan seluruh menu yang menjadi hak paket tersebut tanpa membayar. Saat trial berakhir dan tidak ada pembayaran lanjutan, akses menyesuaikan dengan paket yang dimiliki (atau berhenti jika tidak punya paket aktif lagi).

**Why this priority**: Ini nilai jual langsung aplikasi bagi mahasiswa baru — pengalaman menikmati fitur penuh sejak awal tanpa hambatan. Memberdayakan konversi dari trial ke pembayaran.

**Independent Test**: Dapat diuji dengan membuat akun mahasiswa baru, lalu memeriksa bahwa akun tersebut otomatis memiliki langganan aktif paket tertinggi dengan durasi 14 hari. Berdiri sendiri dan langsung terlihat nilainya.

**Acceptance Scenarios**:

1. **Given** seorang user baru yang baru selesai mendaftar, **When** akunnya dibuat, **Then** sistem otomatis membuat langganan trial paket tertinggi berdurasi 14 hari.
2. **Given** user sedang dalam masa trial, **When** user mengakses menu-menu aplikasi, **Then** user mendapat akses sesuai permission paket trial tersebut.
3. **Given** masa trial user telah berakhir dan user tidak memiliki langganan aktif lain, **When** user mengakses menu aplikasi, **Then** akses dibatasi/berhenti dengan pemberitahuan masa trial habis dan tawaran untuk berlangganan.
4. **Given** masa trial user berakhir tetapi user memiliki langganan berbayar aktif, **When** trial habis, **Then** akses user lanjut mengikuti paket berbayar (tanpa jeda).

### User Story 3 - Mahasiswa berlangganan paket berbayar via Duitku (Priority: P2)

Mahasiswa memilih paket berbayar (misalnya 25K, 80K, atau 120K), sistem membuat pesanan pembayaran dan mengarahkan mahasiswa ke halaman pembayaran Duitku. Setelah pembayaran berhasil, sistem menerima notifikasi dari penyedia, memverifikasi keabsahannya, dan mengaktifkan langganan paket tersebut untuk mahasiswa.

**Why this priority**: Memungkinkan mahasiswa beralih dari trial ke langganan berbayar — sumber pendapatan aplikasi. P2 karena bergantung pada paket (P1) meski dapat diuji terpisah dari trial.

**Independent Test**: Dapat diuji dengan mahasiswa memilih paket berbayar, diarahkan ke halaman pembayaran digital, dan setelah pembayaran dikonfirmasi langganan aktif. Berdiri sendiri sebagai alur monetisasi.

**Acceptance Scenarios**:

1. **Given** seorang mahasiswa ingin berlangganan paket berbayar, **When** ia memilih paket dan menekan bayar, **Then** sistem membuat pesanan dan mengarahkannya ke halaman pembayaran penyedia.
2. **Given** mahasiswa telah memilih paket, **When** sistem menerima notifikasi pembayaran berhasil dari penyedia, **Then** sistem memverifikasi keabsahan notifikasi (nilai, pesanan, tanda tangan) dan hanya bila valid mengaktifkan langganan paket.
3. **Given** satu langganan berhasil dibayar, **When** pemesanan berulang yang sama terjadi, **Then** sistem tidak membuat duplikat aktivasi dan mencatat riwayat pesanan dengan benar.
4. **Given** notifikasi pembayaran tidak valid atau mencurigakan, **When** sistem menerimanya, **Then** sistem menolaknya dan tidak mengubah status langganan.
5. **Given** pembayaran belum selesai atau dibatalkan oleh mahasiswa, **When** mahasiswa kembali dari halaman pembayaran, **Then** sistem menampilkan status pesanan yang akurat (menunggu pembayaran / gagal).

### User Story 4 - Super admin memantau user, paket, dan pembayaran (Priority: P3)

Super admin membuka halaman pengelolaan mahasiswa yang menampilkan seluruh data mahasiswa beserta paket yang sedang digunakan, status langganan (trial/aktif/kadaluarsa), dan riwayat pembayaran yang telah dilakukan.

**Why this priority**: Memberi super admin visibilitas atas pengguna dan pendapatan. P3 karena bergantung pada paket, trial, dan pembayaran yang sudah ada, tetapi menambah nilai pengawasan.

**Independent Test**: Dapat diuji dengan super admin membuka halaman daftar mahasiswa dan melihat paket aktif serta riwayat pembayaran tiap mahasiswa. Berdiri sendiri sebagai halaman pantauan.

**Acceptance Scenarios**:

1. **Given** super admin membuka halaman data mahasiswa, **When** daftar dimuat, **Then** terlihat nama/identitas mahasiswa, paket yang digunakan, status dan masa berlakunya.
2. **Given** super admin melihat satu mahasiswa, **When** ia membuka detailnya, **Then** melihat daftar riwayat pembayaran lengkap (tanggal, nominal, metode, status).
3. **Given** daftar mahasiswa yang banyak, **When** super admin mencari/menyaring, **Then** dapat memfilter berdasarkan paket atau status langganan.

### Edge Cases

- Pendaftaran user baru yang sudah pernah terdaftar sebelumnya (duplikat) — trial tidak dibuat ganda.
- User yang sudah pernah mendapat trial lalu mendaftar ulang atau berhasil trial-nya pernah habis — tidak diberi trial kedua (sekali seumur hidup).
- User mendaftar saat sistem belum punya paket aktif sama sekali (misalnya seeder belum jalan) — bagaimana perilaku trial.
- Masa trial berakhir tepat saat user sedang memakai aplikasi — akses berhenti berangsur atau seketika.
- Pembayaran Duitku yang valid namun terkirim dua kali (callback duplikat / retry) — tidak membuat dua langganan.
- Paket dihapus/dinonaktifkan ketika masih ada user berlangganan — perilaku langganan aktif yang tersisa.
- Super admin mengubah permission paket yang sedang dipakai banyak user — perubahan berlaku seketika atau di langganan berikutnya.
- Callback pembayaran telat tiba setelah trial habis — prioritas paket berbayar.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Sistem MUST menyediakan CRUD paket langganan yang dioperasikan oleh super admin (buat, lihat, ubah, hapus), termasuk nama, harga, deskripsi, dan status aktif/nonaktif.
- **FR-002**: Sistem MUST mengizinkan super admin menetapkan dan mengubah permission/hak akses tiap paket terhadap menu-menu aplikasi.
- **FR-003**: Sistem MUST menyediakan seeder paket bawaan: 25K, 80K, dan 120K, dengan 120K sebagai paket tertinggi.
- **FR-004**: Sistem MUST otomatis memberi langganan trial paket tertinggi (120K) selama 14 hari kepada setiap mahasiswa baru yang selesai mendaftar, dan trial ini only diberikan sekali seumur hidup per akun (tidak diulang).
- **FR-005**: Sistem MUST mencatat permintaan pembayaran dan mengarahkan mahasiswa ke halaman pembayaran penyedia (Duitku) saat memilih paket berbayar.
- **FR-006**: Sistem MUST menerima notifikasi pembayaran dari penyedia, memverifikasi keabsahannya (nilai, identitas pesanan, tanda tangan), dan hanya mengaktifkan langganan bila verifikasi sah.
- **FR-007**: Sistem MUST melindungi dari notifikasi pembayaran duplikat sehingga tidak membuat langganan ganda.
- **FR-008**: Sistem MUST menolak notifikasi pembayaran yang tidak valid dan tidak mengubah status langganan.
- **FR-009**: Sistem MUST menyediakan halaman super admin untuk melihat seluruh mahasiswa beserta paket aktif dan status masa berlakunya.
- **FR-010**: Sistem MUST menyediakan riwayat pembayaran tiap mahasiswa di halaman detail.
- **FR-011**: Sistem MUST menerapkan akses menu berdasarkan permission paket aktif yang dimiliki user pada saat itu (termasuk masa trial).
- **FR-012**: Sistem MUST mencegah penghapusan paket yang masih dipakai oleh minimal satu user aktif.
- **FR-013**: Setiap perubahan data (paket, langganan, pembayaran) MUST dicatat sebagai activity log naratif: who, action, subject, when, deskripsi naratif.

### Key Entities *(include if feature involves data)*

- **[Plan]**: Paket langganan. Atribut: nama, harga, deskripsi, status aktif, daftar permission/menu yang diizinkan. Berelasi dengan Subscription dan Payment.
- **[Subscription]**: Langganan seorang user terhadap sebuah Plan dalam periode tertentu, termasuk jenis trial/berbayar, tanggal mulai dan berakhir. Berelasi ke User dan Plan.
- **[Payment]**: Pesanan/transaksi pembayaran langganan melalui penyedia, mencatat pesanan, nominal, status, referensi pembayaran, dan hasil verifikasi callback. Berelasi ke User, Plan, dan Subscription.
- **[Permission]**: Jenis hak akses ke menu aplikasi yang dapat dimiliki sebuah plan. Berelasi many-to-many dengan Plan, dan memengaruhi akses menu user.
- **[User]**: Pengguna aplikasi, termasuk mahasiswa (memiliki langganan) dan super admin (mengelola plan, permission, mahasiswa, pembayaran).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% mahasiswa baru yang mendaftar otomatis memperoleh trial paket tertinggi selama 14 hari tanpa langkah tambahan.
- **SC-002**: Super admin dapat membuat, mengubah permission, dan menonaktifkan paket dalam waktu di bawah 2 menit per tindakan.
- **SC-003**: 100% notifikasi pembayaran sah dari penyedia menghasilkan aktivasi langganan yang benar, dan 0% notifikasi tidak valid/tidak sah menyebabkan aktivasi.
- **SC-004**: Tidak ada langganan ganda akibat callback pembayaran yang terkirim berulang (0 duplikat).
- **SC-005**: Super admin dapat melihat paket aktif dan riwayat pembayaran setiap mahasiswa tanpa berpindah aplikasi lain, dalam waktu muat data yang wajar (< 3 detik untuk ratusan mahasiswa).
- **SC-006**: Akses menu mahasiswa selalu mencerminkan permission paket yang aktif — trial dan berbayar — tanpa celah akses ke menu yang tidak diizinkan.

## Assumptions

- Super admin adalah peran admin tertinggi aplikasi yang berwenang penuh atas paket, permission, dan data mahasiswa.
- Paket "120K" adalah paket tertinggi dan digunakan sebagai paket trial default untuk mahasiswa baru.
- Harga paket (25K, 80K, 120K) diekspresikan dalam Rupiah; nilai eksak dianggap dalam satuan ribu (25.000, 80.000, 120.000).
- Trial paket tertinggi diberikan otomatis sekali saja seumur hidup per akun, segera setelah pendaftaran akun mahasiswa selesai.
- Penyedia pembayaran Duitku: alur checkout membuat pesanan lalu mengarahkan user ke halaman pembayaran, notifikasi status kembali via callback yang diverifikasi signature, dan returnUrl mengarahkan user kembali ke aplikasi. Kredensial/API key dikonfigurasi pada lingkungan.
- Verifikasi callback dilakukan dengan memeriksa kecocokan tanda tangan (signature) penyedia beserta nilai dan identitas pesanan.
- Durasi langganan berbayar mengikuti periode yang wajar (default 1 bulan saat ini) kecuali ditentukan lain oleh paket; bila ada kebijakan berbeda, ditetapkan saat planning.
- Halaman admin (kelola paket, permission, pantau mahasiswa/pembayaran) berada di sisi admin; mahasiswa menggunakan alur trial & pembayaran di sisi aplikasinya.
- Akses menu diterapkan menurut permission paket aktif terkini user, termasuk masa trial, tanpa perlu sesi baru.
- Sistem autentikasi dan peran user (mahasiswa vs admin) yang ada akan dipakai dan tidak dibangun ulang dalam fitur ini.
