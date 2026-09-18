# Technical Research: Chapter Paraphrase & Revision Assistant

**Feature**: `008-chapter-paraphrase-assistant`  
**Date**: 2026-09-06  
**Status**: Completed  

## 1. Background & Context

Fitur ini memperluas kemampuan penulisan skripsi mahasiswa pada `apps/web` (React 19 SPA) dan `apps/api` (Laravel 13). Mahasiswa membutuhkan cara terarah untuk memparafrase teks draf skripsi bab dengan menggabungkan:
1. **Teks draf bab asli** yang dipilih atau dimasukkan.
2. **Catatan bimbingan/revisi** dosen dari bab terkait (`supervision_notes` atau input revisi manual).
3. **Konteks referensi pendukung** (kutipan teori, jurnal, atau data riset tambahan).

## 2. Research Findings & Technical Decisions

### Decision 1: Skema Database dan Entitas Paraphrase
- **Keputusan**: Perluas tabel `paraphrases` yang sudah ada melalui migration baru tanpa merusak fungsi yang sudah berjalan (`original_selection`, `paraphrased_text`, `outcome`).
- **Kolom tambahan pada `paraphrases`**:
  - `supervision_note_id` (nullable foreignId ke `supervision_notes` on delete set null)
  - `custom_instruction` (nullable text, untuk arahan/catatan revisi manual mahasiswa)
  - `reference_context` (nullable text, untuk kutipan rujukan/teks referensi yang disertakan)
  - `style_mode` (string default `'academic'`: enum/string nilai: `'academic'`, `'concise'`, `'elaborative'`)
  - `applied_at` (nullable timestamp, mencatat waktu saat hasil disetujui dan diterapkan ke bab)
- **Rationale**: Reusability tinggi. Pola ini mencegah pembuatan tabel duplikat (YAGNI / DRY) dan menjaga keterikatan riwayat versi bab saat mahasiswa menekan aksi apply.
- **Alternatif yang ditolak**: Membuat tabel baru `chapter_revision_assistants`. Ditolak karena konsep bisnisnya identik dengan sesi paraphrase teks per bab.

### Decision 2: LLM Prompt Engineering untuk Multi-Input Synthesis
- **Keputusan**: Rancang prompt terstruktur pada `CreateParaphraseAction` yang memisahkan instruksi peran sistem, teks asli mahasiswa, poin revisi dosen/manual, dan materi rujukan referensi.
  - **Prinsip Utama**:
    - Pertahankan gagasan pokok draf mahasiswa.
    - Wajib mengoreksi/memperbaiki kelemahan teks sesuai arahan revisi bimbingan.
    - Integrasikan konsep dari teks referensi secara sintesis/parafrase (bukan copy-paste) dengan sintaks sitasi kontekstual jika tersedia informasi sumber.
    - Format output: HANYA teks rekomendasi baru dalam Bahasa Indonesia baku akademis (EYD/PUEBI), siap tempel.
- **Rationale**: Menjamin keluaran berkualitas tinggi, bebas halusinasi struktur, dan mencegah plagiarisme langsung sesuai requirement FR-005.
- **Alternatif yang ditolak**: Multi-step chaining call ke LLM (call 1 untuk rangkum notes, call 2 untuk sintesis referensi, call 3 untuk paraphrase). Ditolak karena memicu latensi tinggi (4-10x) dan boros token, sedangkan single-prompt one-shot synthesis sudah mampu menyajikan hasil koheren dalam waktu < 5 detik.

### Decision 3: Alur Controller → Service → Action (Sesuai Konstitusi I & II)
- **Keputusan**:
  - `ParaphraseController`: Menerima `ParaphraseRequest`, memvalidasi input, mendelegasikan ke `ParaphraseService::preview()` atau `ParaphraseService::apply()`, mengembalikan JSON response.
  - `ParaphraseService`: Mengorkestrasi alur preview, memanggil `CreateParaphraseAction`, mencatat activity log naratif (`spatie/laravel-activitylog`), dan mengorkestrasi `ApplyParaphraseAction` saat mahasiswa menerima draf.
  - `CreateParaphraseAction`: Mengelola persistensi entitas `Paraphrase` dan komunikasi LLM.
  - `ApplyParaphraseAction`: Mengganti teks pada konten bab dan membuat snapshot versi `ChapterVersion`.
- **Rationale**: 100% mematuhi aturan Controller tipis (<15 baris), Action bertanggung jawab atas satu mutasi, dan Service memegang orkestrasi bisnis.

### Decision 4: Komponen UI Frontend & Penempatan Sesuai Konstitusi V
- **Keputusan**:
  - Letakkan komponen dialog/panel modal asisten di: `apps/web/src/features/thesis/pages/chapter/partials/paraphrase-assistant-modal.tsx` atau komponen terkait di `apps/web/src/features/thesis/components/paraphrase-assistant-sheet.tsx`.
  - Gunakan visual comparison side-by-side (diff highlight sederhana atau 2 panel: Asli vs Hasil Rekomendasi).
  - Integrasikan langsung ke alur baca/tulis bab pada `apps/web/src/features/thesis/pages/chapter/index.tsx` dan `chapter-editor.tsx`.
  - Komponen UI memanfaatkan komponen dasar shadcn base-nova yang sudah terpasang (`Dialog`, `Button`, `Textarea`, `Badge`, `Tabs`, `Card`).
- **Rationale**: Konstitusi V melarang meletakkan komponen spesifik fitur ke dalam `components/ui/`. File komponen tetap di bawah batas 300 baris dengan mengekstrak logic ke hook `use-paraphrase.ts`.

## 3. Unknowns Resolved

1. **Bagaimana jika bab belum memiliki catatan bimbingan?**  
   Mahasiswa tetap dapat menggunakan fitur dengan mengisi kolom catatan/instruksi revisi manual secara bebas (`custom_instruction`).
2. **Berapa batas panjang teks yang diproses?**  
   Validasi Form Request membatasi `selection` (10 - 5.000 karakter / ~1.500 kata), `custom_instruction` (maks 1.000 karakter), dan `reference_context` (maks 3.000 karakter).
3. **Bagaimana status riwayat sesi paraphrase dilacak?**  
   Menggunakan atribut `outcome` pada model `Paraphrase` (`'previewed'`, `'applied'`, `'discarded'`, `'failed'`).
