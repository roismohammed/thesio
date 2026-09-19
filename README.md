# Thesio — Platform Asisten Skripsi Mahasiswa

Thesio adalah platform berbasis web untuk memandu mahasiswa mengerjakan skripsi secara terstruktur, mandiri, dan efisien.

Project ini menggunakan arsitektur **Monorepo** yang memisahkan Backend API dan Frontend Web ke dalam direktori `apps/`:

```text
.
├── apps/
│   ├── api/          # Backend: Laravel 13 (PHP 8.3+)
│   └── web/          # Frontend: React 19 + Vite 8 + Tailwind CSS v4
├── package.json      # Monorepo Workspace Config
└── README.md
```

---

## 📋 Prasyarat Sistem

Pastikan perangkat Anda sudah terinstall:

| Software | Versi Minimum | Keterangan |
|---|---|---|
| **PHP** | `^8.3` atau `^8.4` | Backend Runtime |
| **Composer** | `^2.x` | PHP Package Manager |
| **Node.js** atau **Bun** | Node `>= 20.x` / Bun `>= 1.0` | Frontend Runtime & Package Manager |
| **Database** | SQLite (Bawaan) atau MySQL `>= 8.0` | SQLite tidak memerlukan instalasi service DB |

### Ekstensi PHP yang Wajib Aktif (di `php.ini`):
- `pdo_sqlite` (jika menggunakan database SQLite bawaan)
- `pdo_mysql` (jika menggunakan MySQL / MariaDB)
- `curl`, `fileinfo`, `gd`, `mbstring`, `openssl`, `tokenizer`, `xml`, `zip`, `bcmath`, `json`, `ctype`

---

## 🚀 Cara Cepat (Jalankan Sekaligus dari Root)

Jika menggunakan Node/Bun di root folder:

```bash
# 1. Install semua dependensi
npm run setup

# 2. Jalankan Backend & Frontend bersamaan
npm run dev
```

---

## 🛠️ Panduan Manual per Aplikasi

### 1. Setup Backend (`apps/api`)

1. **Masuk ke folder API:**
   ```bash
   cd apps/api
   ```

2. **Install Dependensi Composer & NPM:**
   ```bash
   composer install
   npm install
   ```

3. **Setup Environment:**
   ```bash
   cp .env.example .env
   # Di Windows PowerShell jika 'cp' tidak dikenal:
   # Copy-Item .env.example .env

   php artisan key:generate
   ```

4. **Konfigurasi Database (`apps/api/.env`):**
   - **Opsi A: SQLite (Paling Mudah, Tanpa Setup Server DB)**
     ```env
     DB_CONNECTION=sqlite
     ```
   - **Opsi B: MySQL (XAMPP / Laragon)**
     Buat database bernama `skripsi_ai`, lalu sesuaikan di `.env`:
     ```env
     DB_CONNECTION=mysql
     DB_HOST=127.0.0.1
     DB_PORT=3306
     DB_DATABASE=skripsi_ai
     DB_USERNAME=root
     DB_PASSWORD=
     ```

5. **Jalankan Migrasi & Data Seeder:**
   ```bash
   php artisan migrate --seed
   ```

6. **Jalankan Server Backend:**
   ```bash
   php artisan serve --port=8003
   ```
   > Server backend berjalan di: **`http://localhost:8003`** (Health check: `http://localhost:8003/up`)

---

### 2. Setup Frontend (`apps/web`)

1. **Buka terminal baru dan masuk ke folder Web:**
   ```bash
   cd apps/web
   ```

2. **Install Dependensi:**
   ```bash
   npm install
   # atau menggunakan Bun:
   # bun install
   ```

3. **Konfigurasi Environment:**
   Pastikan file `apps/web/.env` berisi:
   ```env
   VITE_API_URL=http://localhost:8003
   ```

4. **Jalankan Server Development:**
   ```bash
   npm run dev
   # atau menggunakan Bun:
   # bun run dev
   ```
   > Aplikasi web berjalan di: **`http://localhost:5176`**

---

## 🌐 Ringkasan Port & URL Layanan

| Layanan | Port | URL Lokal | Deskripsi |
|---|---|---|---|
| **Frontend Web** | `5176` | `http://localhost:5176` | Tampilan Antarmuka React SPA |
| **Backend API** | `8003` | `http://localhost:8003` | REST API Laravel |
| **API Health** | `8003` | `http://localhost:8003/up` | Status Server Backend |

---

## 🔑 Akun Demo (Hasil Database Seeder)

Setelah menjalankan `php artisan migrate --seed`, akun berikut siap digunakan untuk login:

| Role | Email | Password | Akses |
|---|---|---|---|
| **Super Admin** | `superadmin@thesio.test` | `password` | Dashboard Admin & Manajemen User |
| **Mahasiswa / User** | `user@thesio.test` | `password` | Dashboard Penyusunan Skripsi & Fitur AI |

---

## 📦 Build untuk Production

```bash
# Build Frontend Web (menghasilkan apps/web/dist)
bun --filter web build
# atau: cd apps/web && npm run build

# Build Asset Backend (menghasilkan apps/api/public/build)
bun --filter @repo/api build
# atau: cd apps/api && npm run build
```

---

## ❓ Troubleshooting

- **Error: `SQLSTATE[HY000] [2002] Connection refused`**
  - Pastikan service MySQL sudah aktif (jika memakai MySQL), atau ubah konfigurasi ke SQLite di `apps/api/.env` (`DB_CONNECTION=sqlite`).
- **Error: `Port 5176 / 8003 already in use`**
  - Matikan proses yang menggunakan port tersebut atau ubah konfigurasi port pada command serve / vite config.
