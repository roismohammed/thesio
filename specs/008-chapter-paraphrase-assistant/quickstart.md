# Quickstart: Chapter Paraphrase & Revision Assistant

Panduan verifikasi alur fitur integrasi draf teks, catatan bimbingan, dan referensi rujukan.

## Prerequisites
1. Database backend migrasi terbaru berjalan (`php artisan migrate`).
2. Kunci API LLM (`OPENAI_API_KEY`) terkonfigurasi di `.env`.
3. Akun mahasiswa telah memiliki minimal 1 draf bab (`chapters`).

---

## 1. Uji Validasi Backend (PHP Syntax & Routing)

Jalankan pemeriksaan sintaks berkas PHP:
```bash
php -l apps/api/app/Http/Controllers/Thesis/ParaphraseController.php
php -l apps/api/app/Services/Thesis/ParaphraseService.php
php -l apps/api/app/Actions/Thesis/CreateParaphraseAction.php
php -l apps/api/app/Actions/Thesis/ApplyParaphraseAction.php
```

Pastikan rute terdaftar:
```bash
php artisan route:list --name=paraphrase
```

---

## 2. Uji Alur API (CURL / HTTP Request)

### A. Buat Rekomendasi Parafrase
```bash
curl -X POST "http://localhost:8000/api/v1/theses/1/chapters/1/paraphrases" \
  -H "Authorization: Bearer <STUDENT_TOKEN>" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{
    "selection": "Metode yang digunakan adalah waterfall karena tahapan pengerjaan sistem berurutan dari analisis hingga pengujian.",
    "custom_instruction": "Jadikan lebih akademis dan perjelas alasan metodologisnya.",
    "reference_context": "Pressman (2020) menyatakan bahwa model waterfall cocok untuk proyek dengan kebutuhan spesifik dan stabil sejak awal.",
    "style_mode": "academic"
  }'
```

**Ekspektasi Output**:
- HTTP Status `200 OK`
- Body JSON mengembalikan `data.paraphrase_id` dan `data.paraphrased_text` yang memuat integrasi kutipan Pressman (2020).

### B. Terapkan Rekomendasi ke Bab
```bash
curl -X POST "http://localhost:8000/api/v1/theses/1/chapters/1/paraphrases/<PARAPHRASE_ID>/apply" \
  -H "Authorization: Bearer <STUDENT_TOKEN>" \
  -H "Accept: application/json"
```

**Ekspektasi Output**:
- HTTP Status `200 OK`
- Versi bab baru bertambah (`version_number`) dengan riwayat activity log tersimpan.

---

## 3. Uji Validasi Frontend (TypeScript Typecheck & UI Flow)

Jalankan type-check frontend dari direktori `apps/web`:
```bash
npx tsc --noEmit -p tsconfig.app.json
```

Verifikasi tampilan UI:
1. Buka halaman detail bab pada aplikasi (`/theses/:thesisId/chapters/:chapterId`).
2. Seleksi sebagian teks draf di editor atau tekan tombol "Asisten Parafrase".
3. Pilih salah satu catatan bimbingan atau ketik instruksi revisi.
4. Masukkan teks referensi pendukung (opsional).
5. Klik "Buat Parafrase", periksa perbandingan berdampingan draf asli vs draf baru.
6. Klik "Terapkan ke Bab" dan pastikan editor markdown terbarui secara mulus.
