# Implementation Plan: Chapter Paraphrase & Revision Assistant

**Branch**: `008-chapter-paraphrase-assistant` | **Date**: 2026-09-06 | **Spec**: [specs/008-chapter-paraphrase-assistant/spec.md](spec.md)

**Input**: Feature specification from `/specs/008-chapter-paraphrase-assistant/spec.md`

## Summary

Mengembangkan asisten cerdas terintegrasi untuk mahasiswa dalam memparafrase dan menyempurnakan teks draf bab skripsi. Asisten menyintesis kombinasi tiga sumber masukan: teks draf bab asli, catatan bimbingan revisi dosen (atau instruksi manual), dan cuplikan referensi rujukan ilmiah pendukung. Implementasi memperluas model dan layanan `Paraphrase` di backend Laravel (Controller → Service → Action) dan menghadirkan antarmuka perbandingan draf interaktif di frontend React SPA (shadcn base-nova + feature partials).

## Technical Context

**Language/Version**: PHP 8.3 (Laravel 13), TypeScript 5.8 (React 19 SPA with Vite 8)

**Primary Dependencies**:
- Backend: `openai-php/laravel`, `spatie/laravel-activitylog`, Eloquent ORM.
- Frontend: `@base-ui/react`, Tailwind v4, Lucide/Hugeicons, `clsx`, `tailwind-merge`.

**Storage**: SQLite (dev/test), MySQL/PostgreSQL (prod). Tabel `paraphrases`, `supervision_notes`, `chapters`, `chapter_versions`.

**Testing**: Syntax check `php -l`, TypeScript check `npx tsc --noEmit -p tsconfig.app.json`, validasi kontrak via HTTP and diff inspection.

**Target Platform**: Web Browser (Desktop/Mobile Web Responsive), Linux/macOS API server.

**Project Type**: Monorepo Web Application (`apps/api` + `apps/web`).

**Performance Goals**: Latensi generasi parafrase < 5 detik; UI response instan (< 150ms).

**Constraints**:
- Single-prompt LLM synthesis untuk menjaga latensi tetap rendah dan hemat token.
- Komponen frontend spesifik bab ditempatkan di folder `partials/`, bukan di `components/ui/`.
- Ukuran file PHP class ≤ 300 baris, React component file ≤ 300 baris.

**Scale/Scope**: Fitur penulisan skripsi mahasiswa, 1 modal/panel asisten per bab, 3 mode gaya penulisan.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] **Principle I: Layered HTTP Architecture**: `ParaphraseController` tetap tipis (< 15 baris per method), mendelegasikan ke `ParaphraseService`, mutasi ditangani oleh `Action`.
- [x] **Principle II: Action Single Responsibility**: `CreateParaphraseAction` menangani persistensi dan LLM; `ApplyParaphraseAction` menangani mutasi teks bab dan versioning.
- [x] **Principle III: Narrative Activity Logging**: Menggunakan `activity('thesis')` dengan pesan naratif dalam Bahasa Indonesia semi-formal ramah.
- [x] **Principle IV: Productivity-App Design Language**: Desain antarmuka fungsional, padat dan terbaca (Linear/ERPNext style), perbandingan draf berdampingan tanpa elemen dekoratif berlebihan.
- [x] **Principle V: Frontend Design Craft**: Komponen modal/sheet asisten diletakkan di `apps/web/src/features/thesis/pages/chapter/partials/`, tidak mengotori `components/ui/`. File dipecah agar ≤ 300 baris.
- [x] **Naming Convention**: Seluruh identifier berkas, kelas, tabel, fungsi, dan variabel menggunakan istilah teknis Bahasa Inggris. Teks antarmuka user-facing menggunakan Bahasa Indonesia semi-formal friendly.
- [x] **Build Commands Safety**: Tidak ada eksekusi auto-run `bun run dev` atau `composer run dev`.

## Project Structure

### Documentation (this feature)

```text
specs/008-chapter-paraphrase-assistant/
├── plan.md              # File rencana implementasi ini
├── research.md          # Output Phase 0: Hasil riset & keputusan teknis
├── data-model.md        # Output Phase 1: Entitas data & relasi
├── quickstart.md        # Output Phase 1: Panduan verifikasi & pengujian
├── contracts/           # Output Phase 1: Spesifikasi kontrak API
│   └── api-paraphrase.md
└── checklists/          # Checklist mutu spesifikasi
    └── requirements.md
```

### Source Code (repository root)

```text
apps/api/
├── app/
│   ├── Actions/Thesis/
│   │   ├── CreateParaphraseAction.php       # Update: Multi-input LLM synthesis & model persistence
│   │   └── ApplyParaphraseAction.php        # Apply paraphrased text to chapter content & create version
│   ├── Http/
│   │   ├── Controllers/Thesis/
│   │   │   └── ParaphraseController.php     # Endpoint handler (store preview, apply, index history)
│   │   └── Requests/Thesis/
│   │       └── ParaphraseRequest.php        # Input validation (selection, notes, reference, style)
│   ├── Models/
│   │   └── Paraphrase.php                   # Model definition & relations
│   └── Services/Thesis/
│       └── ParaphraseService.php            # Service orchestration & activity logging
└── database/migrations/
    └── 2026_09_06_000001_extend_paraphrases_table.php  # Migration to add notes, reference, style fields

apps/web/src/
├── features/thesis/
│   ├── api/
│   │   └── thesis.ts                        # API client functions for paraphrase
│   ├── components/
│   │   └── chapter-editor.tsx               # Editor integration: trigger paraphrase assistant
│   ├── hooks/
│   │   └── use-paraphrase.ts                # State hook for paraphrase flow, history, and actions
│   └── pages/chapter/
│       ├── index.tsx                        # Chapter main page
│       └── partials/
│           ├── paraphrase-assistant-modal.tsx  # Modal assistant for inputting notes & reference
│           └── paraphrase-diff-preview.tsx     # Side-by-side original vs recommended draft
```

**Structure Decision**: Mengikuti arsitektur monorepo yang sudah ada (`apps/api` Laravel MVC Flat + Service -> Action dan `apps/web` React feature-based architecture).

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|---|---|---|
| None | Arsitektur mematuhi standar konstitusi tanpa penambahan layer/abstraksi berlebih | Menggunakan model dan aksi yang sudah ada dengan perluasan minimal |
