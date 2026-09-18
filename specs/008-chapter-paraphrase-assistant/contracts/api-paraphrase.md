# API Contract: Chapter Paraphrase & Revision Assistant

## Base Path
`/api/v1/theses/{thesis}/chapters/{chapter}/paraphrases`

Semua endpoint memerlukan header `Authorization: Bearer <token>` dan `Accept: application/json`.

---

### 1. Request Paraphrase Preview
Meminta rekomendasi perbaikan teks berdasarkan kombinasi draf asli, catatan revisi/bimbingan, dan referensi rujukan.

- **Method**: `POST`
- **Path**: `/api/v1/theses/{thesis}/chapters/{chapter}/paraphrases`
- **Request Headers**:
  - `Content-Type: application/json`

#### Request Body
```json
{
  "selection": "Berdasarkan observasi awal, sistem informasi yang ada saat ini masih menggunakan metode manual sehingga sering terjadi keterlambatan pelaporan data inventaris.",
  "supervision_note_id": 14,
  "custom_instruction": "Tolong pertajam latar belakang masalah dan gunakan istilah baku akademik.",
  "reference_context": "Menurut Raharjo (2024), pengelolaan logistik manual memiliki risiko human error sebesar 34% pada pencatatan data transaksi berkala.",
  "style_mode": "academic"
}
```

#### Response: 200 OK
```json
{
  "data": {
    "paraphrase_id": 102,
    "original_selection": "Berdasarkan observasi awal, sistem informasi yang ada saat ini masih menggunakan metode manual sehingga sering terjadi keterlambatan pelaporan data inventaris.",
    "paraphrased_text": "Observasi awal mengindikasikan bahwa proses pengelolaan data inventaris masih bertumpu pada prosedur manual. Kondisi ini berimplikasi langsung terhadap tingginya risiko ketidaksinkronan data dan keterlambatan pelaporan berkala, sejalan dengan temuan Raharjo (2024) mengenai kerentanan operasional akibat pencatatan konvensional.",
    "style_mode": "academic"
  }
}
```

#### Response: 422 Unprocessable Entity
```json
{
  "message": "Teks seleksi draf minimal berisi 10 karakter.",
  "errors": {
    "selection": [
      "The selection must be at least 10 characters."
    ]
  }
}
```

---

### 2. Apply Paraphrased Text to Chapter
Menerapkan hasil parafrase ke dokumen bab aktif, menggantikan teks asli, dan membuat versi snapshot bab baru.

- **Method**: `POST`
- **Path**: `/api/v1/theses/{thesis}/chapters/{chapter}/paraphrases/{paraphrase}/apply`
- **Request Headers**:
  - `Content-Type: application/json`

#### Request Body
Tidak memerlukan payload body khusus (ID paraphrase ada pada URI).

#### Response: 200 OK
```json
{
  "data": {
    "id": 45,
    "version_number": 3,
    "source": "manual",
    "conversion_status": "ready"
  }
}
```

#### Response: 422 Unprocessable Entity
```json
{
  "message": "Hasil parafrase ini sudah diterapkan sebelumnya atau teks asli pada bab sudah berubah."
}
```

---

### 3. Get Paraphrase History of Chapter
Mengambil daftar riwayat sesi parafrase yang pernah dibuat pada bab tersebut untuk referensi mahasiswa.

- **Method**: `GET`
- **Path**: `/api/v1/theses/{thesis}/chapters/{chapter}/paraphrases`

#### Response: 200 OK
```json
{
  "data": [
    {
      "id": 102,
      "original_selection": "Berdasarkan observasi awal, sistem informasi yang ada saat ini...",
      "paraphrased_text": "Observasi awal mengindikasikan bahwa proses pengelolaan data...",
      "style_mode": "academic",
      "outcome": "applied",
      "applied_at": "2026-09-06T10:15:30Z",
      "created_at": "2026-09-06T10:14:10Z"
    }
  ]
}
```
