# Research: Subscription Plans & Payments

**Branch**: `007-subscription-plans` | **Date**: 2026-08-31 | **Spec**: [spec.md](./spec.md)

## Decision Log

### D1: Kelola permission per-plan — reuse `spatie/laravel-permission`

**Decision**: Plan menyimpan set permission via relasi many-to-many ke tabel `permissions` spatie (guard `web`), melalui pivot `plan_permission`. Hak akses menu seorang user saat itu dihitung sebagai **union permission dari semua plan pada subscription aktif** user tersebut (termasuk trial), lalu dicocokkan dengan permission yang diminta menu. Tidak menempelkan permission langsung ke user.

**Rationale**: Project sudah memakai `spatie/laravel-permission` (role `super admin`, `user`). Permission menu aplikasi harus konsisten dengan sistem yang ada agar guard route/permission middleware (`permission:xyz`) dan penamaan permission bisa dipakai di kedua sisi (role admin dan plan mahasiswa). Menghindari duplikasi konsep (tabel permission sendiri + tabel menu terpisah) dan memudahkan super admin menyetel permission plan memakai data yang sama dengan permission role.

**Alternatives considered**:
- *Tabel permission-plan sendiri yang terpisah dari spatie* — ditolak: duplikasi katalog menu, dua sumber kebenaran, sulit menyelaraskan route guard.
- *Attach permission langsung ke user saat subscription aktif* — ditolak: menyulitkan revoke massal saat subscription berakhir/trial habis, dan rentan terhadap stale permission bila super admin mengubah permission plan. Resolusi dinamis (union dari plan aktif) lebih akurat dan aman.

### D2: Resolusi akses menu — dinamis dari subscription aktif (bukan attach ke user)

**Decision**: `App\Support\PermissionResolver::hasActiveAccess(User $user, string $permissionKey): bool` — mengambil semua `Plan` pada `Subscription` aktif (status `active`, `starts_at <= now <= ends_at`) milik user, lalu mengembalikan true jika permission tersebut ada pada set permission gabungan. Dipanggil di gate/policy/controller saat mengizinkan menu mahasiswa.

**Rationale**: Memenuhi FR-011 (akses mencerminkan permission plan aktif) & SC-006 (tanpa celah, termasuk trial). Perubahan permission plan → berlaku seketika tanpa sesi baru (edge case "super admin ubah permission" teratasi). Trial habis → subscription tak lagi aktif → akses hilang otomatis.

**Alternatives considered**:
- *Cache permisssion merged ke user* — ditolak: stale pada perubahan plan/expiry; kompleksitas flush cache tak sebanding dengan skala ratusan user.
- *Check saat login saja* — ditolak: tidak akurat untuk expiry tengah sesi (edge case).

### D3: Alur Duitku — checkout + callback diverifikasi via signature HMAC-SHA256

**Decision**: Konsumsi API Duitku via `Illuminate\Http\Client` (`Http::post`), bukan SDK PHP baru.
- **Checkout** (`POST /transaction`, sandbox `https://sandbox.duitku.com/webapi/api/merchant/v2/inquiry`): kirim `merchantCode`, `merchantOrderId` (referensi unik dari `Payment`), `paymentAmount`, `paymentMethod` (kosong untuk all channels), `merchantUserId`, `customerName`/`customerEmail`, `callbackUrl`, `returnUrl`, plus `signature = sha256(merchantCode + paymentAmount + merchantOrderId + apiKey)`. Respons → dapatkan `paymentUrl` → redirect mahasiswa.
- **Callback** (`POST` dari Duitku ke `callbackUrl`): verifikasi keempat field wajib non-kosong, lalu `calcSignature = hmac_sha256(merchantCode . amount . merchantOrderId, apiKey)`; bandingkan dengan `signature` masuk. Jika cocok dan `resultCode == "00"` → aktivasi langganan. Respons `"Success"` hanya setelah verifikasi & aktivasi berhasil.
- **Return**: `returnUrl` membawa user kembali ke halaman status; status final tetap ditentukan callback.

**Rationale**: `Http` facade bawaan Laravel → tidak menambah dependency (konstitusi "no new dependency"). Signature verification melindungi dari callback palsu/modifikasi (FR-008). Dokumentasi resmi Duitku diverifikasi via Context7.

**Alternatives considered**:
- *duitkupg/duitku-php SDK* — ditolak: dependency tambahan; keperluan sederhana (inquiry + callback) cukup via HttpClient.
- *Polling status dari sisi kita* — ditolak: callback adalah mekanisme resmi & real-time; polling menambah beban dan latensi.

### D4: Idempotensi aktivasi / anti-duplikat callback (FR-007, SC-004)

**Decision**: Menyimpan `merchant_order_id` (referensi unik pesanan) pada tabel `payments` dengan **unique constraint**. Callback/aktivasi melakukan update atomik dengan cek status: hanya bertransisi `pending → paid` sekali; callback berulang untuk pesanan yang sudah `paid` menjadi no-op (return Success tanpa menambah subscription). Aktivasi langganan dibuat dengan ref unik pesanan sebagai referensi; bila subscription untuk pesanan itu sudah ada, lewati create.

**Rationale**: Cegah langganan ganda saat Duitku mengirim callback lebih dari sekali / retry (edge case + FR-007). Unique constraint menjamin integritas di level DB, bukan hanya logika aplikasi.

### D5: Trial 14 hari paket tertinggi sekali seumur hidup (FR-004)

**Decision**: Saat registrasi mahasiswa selesai, `RegisteredUserController` (atau listener event) membuat `Subscription` tipe `trial` untuk plan tertinggi aktif (`plan.is_active`, harga terbesar) dengan `starts_at = now`, `ends_at = now + 14 hari`, sekali per akun. Idempoten via unik (user_id, type='trial') atau cek eksisting. Plan tertinggi ditentukan dari `Plan::where('is_active',true)->orderByDesc('price')`.

**Rationale**: "Sekali seumur hidup" → constraint unik mencegah duplikat trial di level DB. Paket 120K adalah tertinggi dari seeder (FR-003). Bila belum ada plan aktif (edge case seeder belum jalan), trial dilewati dengan aman (tidak error) — didokumentasikan di model data.

**Alternatives considered**:
- *Attach role berdurasi* — ditolak: spatie tidak punya konsep expiry; subscription adalah representasi yang tepat atas FR.

### D6: Durasi langganan berbayar

**Decision**: Subscription berbayar berdurasi **30 hari** sejak aktivasi (default 1 bulan, konsisten asumsi spec). `ends_at = now + 30 hari`. Extend/renewal paket yang sama → subscription baru berawal setelah ends_at subscription aktif sebelumnya (tidak menimpa).

**Rationale**: Asumsi spec menetapkan default 1 bulan. Tidak ada paket denga durasi berbeda di v1 (seed 25K/80K/120K hanya beda harga/permission, bukan durasi).

## Open Items

- **Sandbox Duitku**: Belum ada `DUITKU_API_KEY`/`DUITKU_MERCHANT_CODE` sandbox aktif. Daftar di sandbox Duitku dan isi `.env` saat implementasi/test integrasi. Verifikasi callback diuji manual dengan request tiruan (signature dihitung dari apiKey).
