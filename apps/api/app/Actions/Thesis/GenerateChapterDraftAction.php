<?php

namespace App\Actions\Thesis;

use App\Models\Chapter;
use App\Models\Reference;
use OpenAI\Laravel\Facades\OpenAI;
use RuntimeException;

class GenerateChapterDraftAction
{
    /**
     * Generate chapter draft using LLM with references as context.
     *
     * @param array{
     *   instruction: string,
     *   section_title?: string|null,
     *   reference_ids?: array<int>|null,
     *   current_content?: string|null,
     *   writing_tone?: string|null,
     *   target_length?: string|null
     * } $payload
     * @return array{content: string, references_used: array<int, string>}
     */
    public function execute(Chapter $chapter, array $payload): array
    {
        $instruction = $payload['instruction'];
        $sectionTitle = $payload['section_title'] ?? null;
        $referenceIds = $payload['reference_ids'] ?? [];
        $currentContent = $payload['current_content'] ?? null;
        $writingTone = $payload['writing_tone'] ?? 'academic';
        $targetLength = $payload['target_length'] ?? 'medium';

        $referencesQuery = Reference::query()->where('chapter_id', $chapter->id);
        if (! empty($referenceIds)) {
            $referencesQuery->whereIn('id', $referenceIds);
        }
        $references = $referencesQuery->get();

        $refContextLines = [];
        $refTitles = [];
        foreach ($references as $ref) {
            $citation = $ref->authors ? "{$ref->authors} ({$ref->year})" : $ref->title;
            $meta = array_filter([
                $ref->authors ? "Penulis: {$ref->authors}" : null,
                $ref->year ? "Tahun: {$ref->year}" : null,
                $ref->publication ? "Publikasi: {$ref->publication}" : null,
                $ref->doi ? "DOI: {$ref->doi}" : null,
                $ref->url ? "URL: {$ref->url}" : null,
            ]);
            $refContextLines[] = "- [{$citation}] {$ref->title}" . (! empty($meta) ? ' (' . implode(', ', $meta) . ')' : '');
            $refTitles[] = $citation;
        }

        $refContextText = ! empty($refContextLines)
            ? implode("\n", $refContextLines)
            : 'Tidak ada daftar referensi spesifik yang dipilih. Terapkan rujukan ilmiah teoretis umum yang relevan.';

        $toneInstruction = match ($writingTone) {
            'critical' => 'Gaya tinjauan kritis: bandingkan argumen para ahli, identifikasi gap penelitian dan celah teoritis.',
            'methodological' => 'Gaya metodologis/teknis: jelaskan tahapan logis, prosedur, instrumen, atau kerangka berpikir sistematis.',
            default => 'Gaya akademik formal: bahasa baku objektif standar skripsi Indonesia (PUEBI/KBBI), bernalar deduktif/induktif.',
        };

        $lengthInstruction = match ($targetLength) {
            'short' => 'Panjang: 1-2 paragraf padat (~150-250 kata).',
            'long' => 'Panjang: 4-6 paragraf komprehensif (~500-800 kata) lengkap dengan sub-poin jika perlu.',
            default => 'Panjang: 2-4 paragraf seimbang (~300-500 kata).',
        };

        $promptParts = [];
        $promptParts[] = "### JUDUL BAB:\n{$chapter->title}";
        if ($sectionTitle) {
            $promptParts[] = "### SUB-BAB / TOPIK YANG INGIN DITULIS:\n{$sectionTitle}";
        }
        $promptParts[] = "### INSTRUKSI DARI MAHASISWA:\n{$instruction}";
        $promptParts[] = "### PANDUAN GAYA & PANJANG:\n- {$toneInstruction}\n- {$lengthInstruction}";
        $promptParts[] = "### DAFTAR REFERENSI ACUAN WAJIB DIRUJUK:\n{$refContextText}";

        if (! empty($currentContent)) {
            $truncatedContext = mb_substr(trim($currentContent), -2000);
            $promptParts[] = "### KONTEKS AKHIR NASKAH BAB SAAT INI (Lanjutkan secara mengalir dan harmonis):\n{$truncatedContext}";
        }

        $userPrompt = implode("\n\n", $promptParts);

        try {
            $response = OpenAI::chat()->create([
                'model' => config('openai.llm_model', env('LLM_MODEL', 'gpt-4o-mini')),
                'stream' => false,
                'messages' => [
                    [
                        'role' => 'system',
                        'content' => 'Kamu adalah asisten akademis ahli penulisan skripsi perguruan tinggi Indonesia. Tugasmu adalah menyusun draf naskah bab skripsi dalam format Markdown yang elegan, baku, dan kaya sitasi ilmiah. WAJIB mengintegrasikan referensi yang diberikan dengan format sitasi dalam kurung (misal: Nama, Tahun) atau gaya naratif (misal: Menurut Nama (Tahun)...). JANGAN menambahkan pengantar basa-basi pembuka atau penutup. Berikan HANYA teks naskah Markdown hasil penulisan.',
                    ],
                    [
                        'role' => 'user',
                        'content' => $userPrompt,
                    ],
                ],
            ]);

            $generatedContent = $response->choices[0]->message->content ?? '';
            if (trim($generatedContent) === '') {
                throw new RuntimeException('Gagal menghasilkan teks draf dari AI.');
            }

            return [
                'content' => trim($generatedContent),
                'references_used' => $refTitles,
            ];
        } catch (\Throwable $e) {
            throw new RuntimeException('Layanan AI sedang tidak dapat dijangkau: ' . $e->getMessage(), 0, $e);
        }
    }
}
