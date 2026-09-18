# Quickstart — Validation Guide

**Feature**: 005-thesis-kanban-tasks | **Date**: 2026-08-07

Manual end-to-end validation scenarios proving the feature works. This is a
**validation/run guide**, not implementation — code lives in `tasks.md` and
the implementation phase. Per project policy there are no automated tests;
verify via the steps below. Skenario memetakan ke User Story di [spec.md](./spec.md).

## Prerequisites

- `apps/api` running (`composer run dev` from `apps/api` — jalankan sendiri; agent tidak menjalankan dev server).
- `apps/web` running (`bun run dev` from `apps/web` — jalankan sendiri).
- Mahasiswa login dengan **thesis aktif** yang punya **≥1 chapter** (dari alur 002) dan idealnya **≥1 notulen revisi** (dari 004) + **tenggat sidang** sudah diatur (dari 003, `PATCH /api/thesis/{thesis}` dgn `defense_deadline_at`).
- `.env` (apps/api) OpenRouter (sudah dari 003):
  ```
  LLM_BASE_URL=https://openrouter.ai/api/v1
  LLM_API_KEY=<your openrouter key>
  LLM_MODEL=<e.g. openrouter/auto>
  ```
- Migrations applied: `php artisan migrate` (jalankan sendiri). Membuat tabel `tasks` + `task_suggestions`.
- DnD dependency terpasang: `bun add @dnd-kit/core @dnd-kit/sortable` di `apps/web` (jalankan sendiri).

## Scenario 1 — Lihat papan kanban (US1)

1. Buka halaman Tugas Skripsi (route `kanban-tasks`).
2. **Expected**: breadcrumb `Skripsi › Tugas Skripsi`; papan 3 kolom (Belum Dimulai / Sedang Dikerjakan / Selesai); empty state bila belum ada tugas; tombol "Minta Saran" + "Buat Tugas" di toolbar.
3. Buat beberapa tugas manual (Scenario 2) atau terima saran (Scenario 3) lalu reload.
4. **Expected**: kartu tampil per kolom, tiap kartu tampilkan judul, deskripsi singkat, tenggat, indikator urgensi (warna/label).

## Scenario 2 — Buat & kelola tugas manual (US2)

1. Klik "Buat Tugas" (atau tekan `n`) → dialog form terbuka (≤5 field: judul, deskripsi, tenggat opsional, link chapter, link notulen).
2. Isi judul "Revisi BAB 1", deskripsi, link ke chapter 1, submit.
3. **Expected**: tugas muncul di kolom "Belum Dimulai" dgn `origin='manual'`; activity log "Membuat tugas 'Revisi BAB 1' ...".
4. Klik kartu → popover aksi (Edit, Hapus, Pindah ke kolom, Atur tenggat manual). Edit judul → tersimpan.
5. Hapus tugas via popover → konfirmasi → kartu hilang; activity log "Menghapus tugas ...".

## Scenario 3 — Saran AI dgn deadline sistematis (US3)

1. Pastikan thesis punya chapter `draft` + notulen revisi + tenggat sidang (mis. +30 hari).
2. Klik "Minta Saran" (atau tekan `s`).
3. **Expected** (< 10 detik): daftar saran muncul, terurut by priority; tiap saran tampilkan `due_at_suggestion` yang **sebelum** tenggat sidang; saran `source_type='note_revision'` (dari notulen) didahulukan.
4. Terima satu saran → tugas dibuat di kolom "Belum Dimulai" dgn `origin='suggestion'`, `due_at_mode='auto'`; activity log "Menerima saran tugas ...".
5. Tolak satu saran → saran hilang dari daftar aktif (`status='rejected'`); activity log "Menolak saran tugas ...".
6. Klik "Minta Saran" lagi (tanpa `force`) → idempotent: saran pending yang sama kembali; saran yang ditolak **tidak muncul lagi** (dedup signature — D9).
7. Klik "Minta Saran" dgn `force=true` (opsional UI/endpoint) → LLM re-run; saran ditolak tetap di-dedup.

## Scenario 4 — Hitung ulang saat deadline sidang berubah (US4)

1. Buat/terima beberapa tugas `auto` (belum selesai). Catat `due_at` masing-masing.
2. `PATCH /api/thesis/{thesis}` ubah `defense_deadline_at` lebih dekat (mis. dari +30 ke +15 hari).
3. **Expected**: `due_at` semua tugas `status != 'done'` && `due_at_mode='auto'` dihitung ulang lebih awal; urutan priority terjaga (SC-004 — tidak ada tugas prioritas tinggi dgn tenggat lebih lambat); activity log "Menghitung ulang tenggat {n} tugas ... karena deadline sidang diperbarui.".
4. Tandai satu tugas `done` sebelum ubah deadline. Ubah deadline lagi → tugas `done` **tidak diubah** (FR-010).
5. Atur satu tugas `due_at` manual (popover "Atur tenggat" → `due_at_mode='manual'`). Ubah deadline sidang → tugas `manual` **tidak ditimpa** (FR-010).

## Scenario 5 — Indikator urgensi (US5)

1. Buat tugas dgn berbagai tenggat: lampau (edit `due_at` ke tanggal lewat), dekat (+3 hari), jauh (+20 hari), tanpa tenggat (null).
2. **Expected** (lihat papan tanpa buka detail — SC-005):
   - lampau → label/warna "terlambat".
   - dekat → "mendekati".
   - jauh → "aman".
   - null → "tanpa tenggat" (tanpa warna urgensi).

## Scenario 6 — Drag-and-drop (FR-003)

1. Drag kartu dari "Belum Dimulai" ke "Sedang Dikerjakan".
2. **Expected**: kartu pindah kolom; `status` diperbarui; activity log "Memindahkan tugas ... ke kolom doing.".
3. Drag kartu antar posisi dalam kolom yang sama → `position` di-reorder.
4. Uji DnD via keyboard: fokus kartu, tekan space untuk pick, arrow untuk pindah, space drop (sensor keyboard `@dnd-kit`).

## Scenario 7 — Shortcut & popover (input user)

1. Tekan `n` → dialog buat tugas terbuka.
2. Tekan `/` → fokus ke filter/pencarian di toolbar.
3. Tekan `s` → picu "Minta Saran".
4. Tekan `?` → popover daftar shortcut tampil (dgn `Kbd` hints).
5. Klik "..." di kartu → popover aksi cepat (Edit / Hapus / Pindah ke kolom / Atur tenggat manual).

## Scenario 8 — Edge cases

1. **Tidak ada tenggat sidang**: buat tugas → `due_at` null, `due_at_mode='auto'`. Minta saran → saran dibuat tanpa `due_at_suggestion` (atau null). Atur tenggat sidang kemudian → recalc mengisi `due_at` tugas `auto` belum selesai.
2. **Semua tugas selesai**: papan tampilkan status tercapai; "Minta Saran" → saran kosong (valid, bukan error).
3. **Chapter/notulen dihapus**: tugas yang ditautkan tetap ada, tautan jadi null (tidak ikut terhapus — `nullOnDelete`).
4. **Tidak ada chapter draft & tidak ada notulen**: "Minta Saran" → 422 dgn pesan "Belum ada chapter belum lengkap atau notulen revisi untuk disarankan.".
5. **LLM gagal**: set `LLM_API_KEY` invalid → "Minta Saran" → 422 "Gagal membuat saran tugas. Silakan coba lagi." dlm timeout; tidak ada saran parsial tersimpan; activity log kegagalan.

## Ownership check

1. Sebagai mahasiswa A, catat URL `/api/thesis/{A}/tasks`.
2. Sebagai mahasiswa B, `GET` URL tersebut.
3. **Expected**: `403`/tidak ditemukan — akses lintas mahasiswa mustahil (`OwnedByUserScope` + policy). Sama untuk `PATCH`/`DELETE` task dan `POST` accept/reject suggestion.

## Objective checks (jalankan sendiri, agent tidak menjalankan dev/build server)

- PHP syntax: `php -l` untuk tiap file PHP baru di `apps/api/app/{Models,Actions,Services,Http,Requests,Resources,Policies}` + migration.
- TS type check: `npx tsc --noEmit -p tsconfig.app.json` dari `apps/web`.
- PHP format: `vendor/bin/pint` dari `apps/api` (jalankan sendiri bila ingin).
- Jangan jalankan `php artisan test` kecuali diminta — project tidak punya test suite.
- Jalankan server sendiri: `composer run dev` (apps/api), `bun run dev` (apps/web).