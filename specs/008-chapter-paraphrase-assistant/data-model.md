# Data Model: Chapter Paraphrase & Revision Assistant

**Feature**: `008-chapter-paraphrase-assistant`  
**Date**: 2026-09-06  
**Status**: Ready  

## 1. Entities & Attributes

### `paraphrases` (Tabel Database yang Diperluas)

Mewakili satu sesi aktivitas perbaikan dan parafrase teks pada bab tertentu.

| Column | Type | Nullable | Default | Description |
|---|---|---|---|---|
| `id` | `unsignedBigInteger` (PK) | No | Auto-increment | ID utama sesi parafrase |
| `chapter_id` | `unsignedBigInteger` | No | - | ID bab terkait (FK ke `chapters.id`) |
| `user_id` | `foreignId` | No | - | ID mahasiswa pemohon (FK ke `users.id`) |
| `supervision_note_id` | `foreignId` | Yes | `null` | ID catatan bimbingan rujukan jika ada (FK ke `supervision_notes.id`) |
| `original_selection` | `text` | No | - | Cuplikan draf teks asli yang hendak diperbaiki |
| `custom_instruction` | `text` | Yes | `null` | Arahan/catatan revisi manual tambahan dari mahasiswa |
| `reference_context` | `text` | Yes | `null` | Cuplikan teks referensi rujukan ilmiah pendukung |
| `style_mode` | `string` | No | `'academic'` | Gaya parafrase (`academic`, `concise`, `elaborative`) |
| `paraphrased_text` | `text` | Yes | `null` | Teks hasil rekomendasi parafrase yang dihasilkan |
| `outcome` | `string` | No | `'discarded'` | Status sesi (`discarded`, `applied`, `failed`) |
| `applied_at` | `timestamp` | Yes | `null` | Waktu saat teks diterapkan ke draf bab |
| `created_at` | `timestamp` | No | Current timestamp | Waktu pembuatan |
| `updated_at` | `timestamp` | No | Current timestamp | Waktu pembaruan |

## 2. Relationships

- `Paraphrase` **belongsTo** `Chapter` (`chapter_id` -> `chapters.id`)
- `Paraphrase` **belongsTo** `User` (`user_id` -> `users.id`)
- `Paraphrase` **belongsTo** `SupervisionNote` (`supervision_note_id` -> `supervision_notes.id`)
- `Chapter` **hasMany** `Paraphrase`
- `Chapter` **hasMany** `ChapterVersion` (diperbarui saat paraphrase di-apply)

## 3. State Transitions (`outcome`)

```text
[Inisiasi / Form Request]
          │
          ▼
      discarded ──(Generate Gagal / Timeout)──► failed
          │                                      ▲
          │                                      │
(Pengguna Menyetujui & Terapkan)          (Coba Lagi)
          │
          ▼
       applied
(Menyimpan snapshot versi bab baru & timestamp applied_at)
```

## 4. Validation Rules

### Input Request: `POST /theses/{thesis}/chapters/{chapter}/paraphrases`
- `selection`: `required|string|min:10|max:5000` (draf teks yang ingin diperbaiki)
- `supervision_note_id`: `nullable|integer|exists:supervision_notes,id`
- `custom_instruction`: `nullable|string|max:1000`
- `reference_context`: `nullable|string|max:3000`
- `style_mode`: `nullable|string|in:academic,concise,elaborative`

### Apply Request: `POST /theses/{thesis}/chapters/{chapter}/paraphrases/{paraphrase}/apply`
- `paraphrase`: `required|exists:paraphrases,id` (harus milik chapter dan user yang bersangkutan)
