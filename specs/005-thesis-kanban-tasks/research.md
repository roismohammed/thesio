# Phase 0 — Research & Decisions

**Feature**: 005-thesis-kanban-tasks | **Date**: 2026-08-07

Tidak ada [NEEDS CLARIFICATION] di spec — semua pilihan punya reasonable default
yang didokumentasikan di Assumptions. Unknown di sini adalah keputusan
teknis/implementasi, di-resolve terhadap codebase nyata.

## D1 — DnD library: @dnd-kit/core + @dnd-kit/sortable

**Decision**: Pakai **`@dnd-kit/core` + `@dnd-kit/sortable`** untuk papan
kanban cross-column drag-and-drop. Dependency baru (satu-satunya).

**Rationale**: Papan kanban butuh drag-and-drop antar kolom (3 status) +
reorder dalam kolom. Native HTML5 Drag and Drop API tidak cukup: tidak ada
built-in sortable, pointer/touch support lemah, accessibility (keyboard DnD)
harus diketik manual, dan tidak ada drag overlay/sensor switching.
`@dnd-kit` adalah library DnD modern untuk React: accessible by default
(keyboard sensor), tree-shakeable, support touch + pointer + keyboard, dan
pola `DndContext` + `SortableContext` cocok untuk multi-column kanban.
`@dnd-kit/sortable` menyediakan `useSortable`/`useDroppable` untuk kartu &
kolom. React Compiler kompatibel (hook-based, tidak bergantung memo manual).
Alternatif (`react-beautiful-dnd`) sudah deprecated; native DnD reject karena
alasan di atas.

**Alternatives considered**:
- Native HTML5 DnD — reject: tidak accessible, tidak sortable, touch jelek.
- `react-beautiful-dnd` — reject: deprecated, tidak maintain.
- Tanpa DnD, pakai tombol "pindah" per kartu — reject: spec FR-003 eksplisit
  minta DnD ("gunakan dnd" — input user).

## D2 — Algoritma hitung tenggat: distribusi proporsional mundur dari tenggat sidang

**Decision**: Tenggat tugas dihitung dgn **distribusi proporsional mundur**:
urutkan tugas by priority asc (prioritas tinggi = deadline lebih dekat),
bagi rentang waktu sebelum tenggat sidang menjadi slot yang lebih awal untuk
prioritas tinggi.

**Rumus** (dalam `TaskService::computeDeadlines`):
- Misal `D` = tenggat sidang, `now` = sekarang.
- Untuk N tugas belum selesai (sort priority asc, urut kepentingan):
  tugas ke-`i` (0-indexed) mendapat tenggat
  `D - (N - i) * slot`, di mana `slot = (D - now) / (N + 1)`.
  Tugas paling prioritas (i=0) → tenggat paling dekat ke D (tapi tetap
  sebelum D); tugas paling tidak prioritas (i=N-1) → tenggat paling awal.
  Kebenaran: urutan priority terjaga (priority lebih kecil → deadline lebih
  dekat, tidak ada tugas prioritas tinggi dgn tenggat lebih lambat — SC-004).

**Rationale**: Distribusi proporsional sederhana, deterministic, menjaga
urutan priority (memenuhi SC-004), dan tidak butuh konfigurasi tiap tugas.
Setiap tugas dapat jatah waktu relatif terhadap posisinya. Saat tenggat sidang
berubah, seluruh tugas belum selesai dihitung ulang dgn rumus sama.

**Alternatives considered**:
- Tenggat tetap per kategori (mis. tiap tugas dapat 3 hari) — reject: tidak
  adaptif terhadap sisa waktu; bisa melebihi tenggat sidang.
- Tenggat = tenggat sidang untuk semua — reject: tidak ada prioritisasi.
- ML/LLM untuk jadwalkan tiap tugas — reject: over-engineering; rumus
  proporsional sudah memenuhi SC-004.

## D3 — Ambang batas urgensi: aman / mendekati / terlambat / tanpa tenggat

**Decision**: Ambang urgensi dihitung relatif terhadap sekarang:
- **terlambat**: `due_at < now`.
- **mendekati**: `now ≤ due_at < now + ambang_mendekati`. Default
  `ambang_mendekati = 7 hari` (konstanta konfigurasi `config('thesis.task_urgent_within_days', 7)`).
- **aman**: `due_at ≥ now + ambang_mendekati`.
- **tanpa tenggat**: `due_at IS NULL` → tidak ada indikator warna, label
  "tanpa tenggat".

**Rationale**: 7 hari adalah konvensi umum productivity app (Linear-like) dan
konsisten dgn "mendekati = dalam beberapa hari" di spec. Nilai dipindahkan ke
config agar tuneable tanpa kode (principle: leave calibration knob, bukan
hardcode). Saat implementasi, turunkan ke `TaskService::urgency(Task)` atau
helper pure function supaya deterministic & testable.

**Alternatives considered**:
- Ambang adaptif (% sisa waktu skripsi) — reject v1: kompleks, tidak ada
  sinyal user butuh; konstanta cukup.
- Tanpa ambang (hanya tanggal) — reject: SC-005 minta identifikasi urgensi
  dari papan tanpa membuka detail.

## D4 — Sumber saran AI: notulen revisi + chapter belum lengkap

**Decision**: `TaskSuggestionLlmClient` mengirim konteks JSON ke LLM berisi:
(a) daftar chapter dgn `status != 'completed'` (draft/submitted) + judul +
status + posisi; (b) daftar `SupervisionNote` (notulen revisi dosen) per
chapter dgn `content`; (c) `defense_deadline_at` + sisa hari; (d) tugas
aktif yang sudah ada (avoid duplicate). LLM diminta mengembalikan array
`suggestions` (judul, deskripsi, priority, source_ref: chapter_id /
supervision_note_id, deadline_suggestion opsional). Backend menyimpan sebagai
`TaskSuggestion` (status `pending`).

**Rationale**: Sesuai input user ("AI akan memberikan task rekomendasi dengan
deadlinenya sesuai dari hasil notulen revisi, bab skripsi yang belum lengkap
beracuan pada tanggal sidang"). Notulen = `SupervisionNote` (longText content
per chapter, dari fitur 002/004). Chapter belum lengkap = status `draft`
(enum chapter: draft/submitted/reviewed — `completed` tidak ada di enum,
jadi "belum lengkap" = `draft` + `submitted`; tugas melengkapi). Deadline
saran dihitung dgn rumus D2 (bukan dari LLM) untuk konsistensi dgn hitung
ulang otomatis — LLM hanya menyarankan priority, backend menghitung tenggat.

**Alternatives considered**:
- LLM menghitung tenggat sendiri — reject: tidak konsisten dgn D2, susah
  divalidasi, SC-004 butuh konsistensi priority.
- Hanya notulen, tanpa chapter status — reject: input user eksplisit dua sumber.
- Template tahapan skripsi standar sebagai sumber — reject: di luar cakupan
  v1 (catatan di Assumptions).

## D5 — Struktur ownership & akses: OwnedByUserScope via thesis.user_id

**Decision**: `Task` & `TaskSuggestion` memakai
`App\Scopes\OwnedByUserScope('thesis.user_id')` — sama seperti `Chapter` dan
`SupervisionGuide`. Akses via route nesting
`thesis/{thesis}/tasks/{task}` & `thesis/{thesis}/task-suggestions/{suggestion}`.
Policy re-check `$task->thesis->user_id === Auth::id()` untuk direct authorize.

**Rationale**: Konsisten dgn pola 002/003. Route nesting memastikan thesis
resolve & own-scoped dulu sebelum task; policy backstop untuk direct access.
Global scope auto-filter query by user, jadi tidak ada query yang lupa
di-scope. `TaskSuggestion` di-scope sama (milik thesis milik user).

**Alternatives considered**:
- `user_id` langsung di `tasks` — reject: redundan dgn `thesis.user_id`,
  denormalisasi yang bisa inkonsisten.
- Policy saja, tanpa global scope — reject: mudah lupa di query baru.

## D6 — Flag tenggat manual vs otomatis

**Decision**: Kolom `due_at_mode` di `tasks`: `'auto'` (dihitung sistem) |
`'manual'` (dibuat/diubah user). Hitung ulang otomatis (FR-009) hanya
menyentuh tugas dgn `due_at_mode = 'auto'` DAN `status != 'done'`. Saat user
mengatur tenggat manual via form, flag flip ke `'manual'`. Saat saran AI
diterima, flag = `'auto'`.

**Rationale**: Spec FR-010 eksplisit: tugas dgn tenggat manual tidak ditimpa
hitung ulang. Flag sederhana, tidak butuh tabel relasi. Saat user
mengedit tugas lain (judul/deskripsi) tanpa menyentuh tenggat, flag tetap —
hanya perubahan tenggat eksplisit yang flip ke manual. Edge case: saat user
mengatur tenggat manual lalu ingin kembali auto — sediakan action "reset ke
otomatis" (opsional, v1 bisa skip; default aman: tetap manual).

**Alternatives considered**:
- Tracking timestamp edit tenggat — reject: rumit, ambigu.
- Tabel audit trail tenggat — reject: over-engineering.

## D7 — Trigger hitung ulang: reaksi ke perubahan defense_deadline_at

**Decision**: Saat `UpdateThesisAction` (sudah ada, fitur 003) memperbarui
`defense_deadline_at`, panggil `TaskService::recalcDeadlines(Thesis)` setelah
update. Recalc sinkron dalam transaksi yang sama dgn update thesis. Tidak
perlu queue/job (beberapa tugas, trivial). `TaskService` inject di
`UpdateThesisAction` lewat constructor (Action boleh inject Service? **Tidak
boleh** per constitution II — "An Action MUST NOT inject or call a Service").
Solusi: `UpdateThesisAction` dispatch event `ThesisDefenseDeadlineUpdated`,
`TaskService` listen via listener di `EventServiceProvider` → recompute.
Atau: `ThesisController` (yang panggil `UpdateThesisAction`) juga panggil
`TaskService::recalcDeadlines` setelahnya — controller boleh orkestrasi multi
service. Pilih **controller orchestration** (lebih sederhana, transparan).

**Rationale**: Constitution II melarang Action inject Service. Controller
sudah jadi tempat orkestrasi transport + boleh delegate ke beberapa service.
`UpdateThesisAction` tetap single responsibility (update thesis fields);
controller panggil `TaskService::recalcDeadlines` terpisah. Recalc idempotent.

**Alternatives considered**:
- Action inject TaskService — reject: pelanggaran constitution II.
- Event/listener — valid tapi lebih kompleks dari controller call untuk 1
  reaksi; pilih controller call (lazy, less moving parts). Upgrade ke event
  saat ada reaksi lain (ponytail: controller call, add listener bila
  reaksi bertambah).

## D8 — Fallback tanpa defense_deadline_at

**Decision**: Bila `defense_deadline_at IS NULL`: hitung ulang otomatis
skip (FR-013); tugas baru (manual & saran) dibuat dgn `due_at = null`,
`due_at_mode = 'auto'` (menunggu deadline ditentukan). Saat deadline
ditentukan kemudian, recalc berjalan & mengisi tenggat tugas `auto` yang
belum selesai.

**Rationale**: Aman, tidak ada data hilang. Tugas tetap bisa dibuat &
dipindahkan kolom tanpa tenggat. Spec FR-013 & US4 AC3 eksplisit.

## D9 — Saran ditolak tidak muncul lagi: dedup dengan signature

**Decision**: `TaskSuggestion` punya kolom `signature` (hash dari
`source_type + source_id + title` normalized). Sebelum generate saran baru,
`CreateTaskSuggestionAction` cek signature yang sudah `rejected` untuk thesis
tersebut; lewati saran LLM dgn signature yang sama. Saran `accepted` tidak
perlu di-dedup (sudah jadi task).

**Rationale**: Spec edge case: saran ditolak tidak muncul lagi. Signature
sederhana, deterministic. `source_type` = `'note_revision' | 'chapter_draft'`,
`source_id` = chapter_id/note_id, `title` normalized (lower, trim). LLM
diminta generate; backend filter post-hoc by signature.

**Alternatives considered**:
- Beri LLM daftar yang sudah ditolak di prompt — bisa, tapi LLM bisa
  inkonsisten; signature filter di backend tetap lebih reliable. Bisa
  dilakukan keduanya (prompt + filter) untuk akurasi, tapi filter backend
  wajib.

## D10 — Papan responsif & cakupan mobile

**Decision**: v1 — 3 kolom horizontal scroll di desktop; di layar sempit,
kolom stack vertikal (CSS grid, `lg:grid-cols-3`). DnD `@dnd-kit` bekerja
di touch (sensor touch). Tidak ada optimasi khusus mobile di v1 (sesuai
Assumptions). Breadcrumb + toolbar sticky.

**Rationale**: Assumptions spec: optimasi mobile cakupan versi berikutnya.
`@dnd-kit` sudah touch-ready jadi tidak ada pekerjaan tambahan, hanya layout
responsif standar.

## D11 — Form & komponen reuse

**Decision**: Form buat/edit tugas memakai `@/components/forms/*` yang sudah
ada: `Form` (react-hook-form + zod), `TextField`, `TextareaField`,
`SelectField` (untuk chapter link & status), `ComboboxField` (optional,
untuk link agenda bimbingan bila perlu). Tugas form ≤ 5 field (judul,
deskripsi, tenggat, link chapter, link notulen) → boleh pakai modal (FR
constitution V). Pakai `TaskFormDialog` wrapper dgn `@/components/ui/dialog`.

Daftar saran AI: list card sederhana (`suggestion-card.tsx`), bukan datatable
— saran belasan item, datatable overkill. Datatable (`@/components/datatable/*`)
dipakai bila ada view "semua tugas" tabular (opsional, v1 list kanban cukup).

**Rationale**: Constitution V: form ≤ 5 field boleh modal. Reuse komponen
yang ada, tidak bikin baru. Input user eksplisit minta pakai
`@/components/forms/` & `@/components/datatable/`.

## D12 — Popover & shortcut keyboard

**Decision**:
- **Popover** (`@/components/ui/popover.tsx`): menu aksi cepat per kartu
  (edit, hapus, pindah ke kolom, atur tenggat manual). Trigger = tombol
  "..." di kartu.
- **Shortcut keyboard**: dgn `@dnd-kit` keyboard sensor (built-in) untuk
  DnD via keyboard. Tambah shortcut global lewat hook `use-kanban-shortcuts`:
  `n` = buat tugas baru, `/` = fokus filter, `s` = minta saran, `?` = tampilkan
  daftar shortcut (popover dgn `Kbd` hints). Pakai `Kbd` component untuk
  render hint.

**Rationale**: Input user minta popover & shortcut. `@dnd-kit` keyboard
sensor sudah accessible. Shortcut global ringan (keymap + useEffect
keydown), tidak butuh library. `Kbd` & `Popover` sudah ada di `components/ui`.

**Alternatives considered**:
- Library shortcut (react-hotkeys-hook) — reject: hook kecil bisa tulis
  sendiri < 50 baris; YAGNI.
- Tanpa popover, pakai menu inline — reject: input user eksplisit minta
  popover.