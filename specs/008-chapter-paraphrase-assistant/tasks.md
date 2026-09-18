# Tasks: Chapter Paraphrase & Revision Assistant

**Input**: Design documents from `/specs/008-chapter-paraphrase-assistant/`

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Tidak ada automated unit tests (mengikuti CLAUDE.md dan panduan repo: verifikasi via `php -l`, `npx tsc --noEmit -p tsconfig.app.json`, inspeksi diff, dan quickstart.md).

**Organization**: Tasks dikelompokkan berdasarkan user story (US1, US2, US3) agar tiap story dapat diimplementasi dan diuji secara independen.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Bisa dijalankan secara paralel (file berbeda, tanpa dependensi task yang belum selesai)
- **[Story]**: US1–US3 sesuai prioritas pada `spec.md`

## Path Conventions

- **Backend**: `apps/api/` (Laravel 13, Controller → Service → Action, Eloquent, spatie activitylog)
- **Frontend**: `apps/web/` (React 19 SPA, Tailwind v4, shadcn base-nova, feature partials)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Persiapan migration dan konfigurasi pendukung sesi paraphrase.

- [X] T001 Buat migration perpanjangan skema `apps/api/database/migrations/2026_09_06_000001_extend_paraphrases_table.php`: tambahkan kolom `supervision_note_id` (foreignId nullable constrained supervision_notes nullOnDelete), `custom_instruction` (text nullable), `reference_context` (text nullable), `style_mode` (string default 'academic'), dan `applied_at` (timestamp nullable).
- [X] T002 [P] Perbarui model `apps/api/app/Models/Paraphrase.php`: tambahkan field baru ke `$fillable` (`supervision_note_id`, `custom_instruction`, `reference_context`, `style_mode`, `applied_at`), tambahkan casts (`applied_at` datetime), dan definisikan relasi `supervisionNote(): BelongsTo`.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Fondasi request validation, contracts client frontend, dan hook state.

**⚠️ CRITICAL**: Wajib selesai sebelum implementasi user story visual dan aksi apply.

- [X] T003 Perbarui form request `apps/api/app/Http/Requests/Thesis/ParaphraseRequest.php`: validasi `selection` (required, string, min:10, max:5000), `supervision_note_id` (nullable, integer, exists:supervision_notes,id), `custom_instruction` (nullable, string, max:1000), `reference_context` (nullable, string, max:3000), dan `style_mode` (nullable, string, in:academic,concise,elaborative).
- [X] T004 [P] Perbarui API client frontend `apps/web/src/features/thesis/api/thesis.ts`: perbarui fungsi `requestParaphrase` untuk menerima payload opsi (`selection`, `supervision_note_id`, `custom_instruction`, `reference_context`, `style_mode`), tambahkan fungsi `fetchParaphraseHistory(thesisId, chapterId)`, dan update response types.
- [X] T005 [P] Perbarui custom hook `apps/web/src/features/thesis/hooks/use-paraphrase.ts`: kelola state `history`, `activeStyle`, `requestPreview` dengan multi-param, error handling ramah, dan reset state.

**Checkpoint**: Foundation siap — implementasi User Story 1 (MVP) dapat dimulai.

---

## Phase 3: User Story 1 - Parafrase Teks Bab Berdasarkan Catatan Bimbingan (Priority: P1) 🎯 MVP

**Goal**: Mahasiswa dapat memilih teks draf bab dan menyertakan catatan bimbingan (atau instruksi manual) untuk menghasilkan draf parafrase akademis.

**Independent Test**: Masukkan draf teks bab dan pilih/tulis arahan revisi bimbingan, klik "Generate Parafrase", dan pastikan hasil parafrase memuat perbaikan sesuai arahan bimbingan.

### Implementation for User Story 1

- [X] T006 [US1] Perbarui action backend `apps/api/app/Actions/Thesis/CreateParaphraseAction.php`: terapkan structured prompt LLM yang menyintesis teks draf asli dan catatan revisi bimbingan/instruksi manual; simpan record `Paraphrase` lengkap dengan field baru.
- [X] T007 [US1] Perbarui service backend `apps/api/app/Services/Thesis/ParaphraseService.php`: perbarui method `preview()` untuk menerima opsi catatan bimbingan/instruksi, dan tambahkan log naratif activitylog yang informatif dalam Bahasa Indonesia friendly.
- [X] T008 [US1] Perbarui controller backend `apps/api/app/Http/Controllers/Thesis/ParaphraseController.php`: passing payload `validated()` lengkap ke `ParaphraseService::preview()` dan kembalikan JSON respons sesuai kontrak.
- [X] T009 [P] [US1] Buat komponen partial modal asisten `apps/web/src/features/thesis/pages/chapter/partials/paraphrase-assistant-modal.tsx`: dialog antarmuka pemilihan catatan bimbingan bab yang tersimpan, textarea instruksi revisi manual, preview teks terpilih, dan tombol trigger generate.
- [X] T010 [US1] Integrasikan trigger asisten ke editor bab `apps/web/src/features/thesis/components/chapter-editor.tsx`: tambahkan tombol toolbar "Asisten Parafrase" yang membaca teks terseleksi di editor dan membuka `ParaphraseAssistantModal`.

**Checkpoint**: User Story 1 berfungsi penuh sebagai MVP mandiri.

---

## Phase 4: User Story 2 - Memperkaya Tulisan dengan Konteks Referensi Pendukung (Priority: P2)

**Goal**: Mahasiswa dapat menyertakan cuplikan referensi ilmiah (jurnal/buku) agar hasil parafrase memadukan substansi referensi tanpa plagiarisme langsung.

**Independent Test**: Sertakan cuplikan referensi ilmiah pada modal asisten, jalankan generate, dan verifikasi teks hasil parafrase menyintesis konsep referensi secara akademis.

### Implementation for User Story 2

- [X] T011 [US2] Sempurnakan prompt LLM pada `apps/api/app/Actions/Thesis/CreateParaphraseAction.php`: tambahkan instruksi khusus untuk menganalisis konteks referensi, mencegah salin-tempel langsung (anti-plagiarisme), dan menyertakan sitasi kontekstual halus.
- [X] T012 [P] [US2] Perbarui form input modal `apps/web/src/features/thesis/pages/chapter/partials/paraphrase-assistant-modal.tsx`: sediakan section/tab khusus "Konteks Referensi Rujukan" dengan textarea cuplikan referensi, indikator jumlah kata, dan opsi gaya bahasa (`academic`, `concise`, `elaborative`).

**Checkpoint**: User Story 2 selesai dan memperkaya User Story 1.

---

## Phase 5: User Story 3 - Perbandingan Draf, Penyesuaian Nada, dan Penerapan Perubahan (Priority: P3)

**Goal**: Mahasiswa melihat perbandingan berdampingan (side-by-side diff), dapat mengubah mode gaya, dan menerapkan hasil ke dokumen bab secara aman.

**Independent Test**: Tinjau draf hasil, alihkan opsi gaya tulisan, klik "Terapkan ke Bab", dan konfirmasi teks bab terbarui serta versi snapshot tersimpan.

### Implementation for User Story 3

- [X] T013 [P] [US3] Buat komponen perbandingan draf `apps/web/src/features/thesis/pages/chapter/partials/paraphrase-diff-preview.tsx`: tata letak perbandingan side-by-side draf asli vs hasil rekomendasi, visual badge status, tombol salin clipboard, dan pemilih mode gaya cepat.
- [X] T014 [US3] Perbarui alur apply pada backend `apps/api/app/Actions/Thesis/ApplyParaphraseAction.php`: tandai status `Paraphrase` menjadi `applied`, set timestamp `applied_at`, dan lakukan replace string seleksi pada bab dengan aman.
- [X] T015 [US3] Hubungkan aksi apply pada frontend `apps/web/src/features/thesis/pages/chapter/partials/paraphrase-assistant-modal.tsx`: panggil method `apply()` dari `useParaphrase`, tampilkan notifikasi toast sukses, dan mutasi teks editor bab.
- [X] T016 [P] [US3] Buat endpoint riwayat pada `apps/api/app/Http/Controllers/Thesis/ParaphraseController.php` (method `index`): kembalikan daftar sesi parafrase sebelumnya pada bab tersebut untuk referensi mahasiswa.
- [X] T017 [US3] Tambahkan tab "Riwayat Sesi" pada `apps/web/src/features/thesis/pages/chapter/partials/paraphrase-assistant-modal.tsx` untuk melihat kembali hasil rekomendasi yang pernah dibuat.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Verifikasi integritas, audit batas baris kode, dan pengecekan sintaks.

- [X] T018 Verifikasi sintaks berkas PHP backend menggunakan `php -l` untuk seluruh file controller, service, action, dan request yang dimodifikasi.
- [X] T019 Verifikasi tipe TypeScript frontend menggunakan `npx tsc --noEmit -p tsconfig.app.json` dari direktori `apps/web`.
- [X] T020 Audit kepatuhan Konstitusi V: pastikan tidak ada komponen baru di `components/ui/`, semua file component ≤ 300 baris, teks user-facing menggunakan Bahasa Indonesia semi-formal ramah, dan semua identifier Bahasa Inggris.

---

## Dependencies & Implementation Strategy

```text
Phase 1 (Setup: T001, T002)
       │
       ▼
Phase 2 (Foundational: T003, T004, T005)
       │
       ▼
Phase 3 (User Story 1 - MVP: T006 -> T007 -> T008 -> T009 -> T010)
       │
       ▼
Phase 4 (User Story 2: T011 -> T012)
       │
       ▼
Phase 5 (User Story 3: T013 -> T014 -> T015 -> T016 -> T017)
       │
       ▼
Phase 6 (Polish: T018 -> T019 -> T020)
```

- **MVP Scope**: Selesaikan Phase 1, Phase 2, dan Phase 3 (T001–T010). Mahasiswa sudah bisa memparafrase teks dengan arahan catatan bimbingan secara fungsional.
