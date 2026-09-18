<?php

namespace App\Actions\Thesis;

use App\Models\Chapter;
use App\Models\Paraphrase;
use App\Models\SupervisionNote;
use OpenAI\Laravel\Facades\OpenAI;

class CreateParaphraseAction
{
    /**
     * Request an LLM paraphrase preview for a selection with supervision notes,
     * manual instructions, and reference context.
     *
     * @param array{
     *   selection: string,
     *   supervision_note_id?: int|null,
     *   custom_instruction?: string|null,
     *   reference_context?: string|null,
     *   style_mode?: string|null
     * } $payload
     * @return array{paraphrase: Paraphrase, paraphrased_text: string|null, original_selection: string, style_mode: string}
     */
    public function execute(Chapter $chapter, int $userId, array $payload): array
    {
        $selection = $payload['selection'];
        $noteId = $payload['supervision_note_id'] ?? null;
        $customInstruction = $payload['custom_instruction'] ?? null;
        $referenceContext = $payload['reference_context'] ?? null;
        $styleMode = $payload['style_mode'] ?? 'academic';

        $noteContent = null;
        if ($noteId) {
            $note = SupervisionNote::find($noteId);
            $noteContent = $note?->content;
        }

        $paraphrase = Paraphrase::create([
            'chapter_id' => $chapter->id,
            'user_id' => $userId,
            'supervision_note_id' => $noteId,
            'original_selection' => $selection,
            'custom_instruction' => $customInstruction,
            'reference_context' => $referenceContext,
            'style_mode' => $styleMode,
            'outcome' => 'discarded',
        ]);

        try {
            $prompt = $this->buildPrompt($selection, $noteContent, $customInstruction, $referenceContext, $styleMode);

            $response = OpenAI::chat()->create([
                'model' => config('openai.llm_model', env('LLM_MODEL', 'gpt-4o-mini')),
                'stream' => false,
                'messages' => [
                    [
                        'role' => 'system',
                        'content' => 'Kamu adalah asisten ahli penulisan skripsi dan parafrase akademik berbahasa Indonesia. Tugasmu adalah memperbaiki dan memparafrase teks draf skripsi mahasiswa secara akademis, formal (EYD/PUEBI), mengoreksi kelemahan teks sesuai arahan bimbingan, serta memadukan konsep referensi ilmiah secara sintesis tanpa salin-tempel langsung (anti-plagiarisme). Kembalikan HANYA teks rekomendasi baru hasil parafrase tanpa pengantar, tanpa penjelasan tambahan, dan tanpa tanda kutip pembungkus.',
                    ],
                    ['role' => 'user', 'content' => $prompt],
                ],
            ]);

            $text = $response->choices[0]->message->content ?? null;

            if ($text === null || trim($text) === '') {
                $paraphrase->update(['outcome' => 'failed', 'paraphrased_text' => null]);

                return [
                    'paraphrase' => $paraphrase,
                    'paraphrased_text' => null,
                    'original_selection' => $selection,
                    'style_mode' => $styleMode,
                ];
            }

            $cleanText = trim($text);
            $paraphrase->update(['paraphrased_text' => $cleanText]);

            return [
                'paraphrase' => $paraphrase,
                'paraphrased_text' => $cleanText,
                'original_selection' => $selection,
                'style_mode' => $styleMode,
            ];
        } catch (\Throwable $e) {
            $paraphrase->update(['outcome' => 'failed', 'paraphrased_text' => null]);

            return [
                'paraphrase' => $paraphrase,
                'paraphrased_text' => null,
                'original_selection' => $selection,
                'style_mode' => $styleMode,
            ];
        }
    }

    private function buildPrompt(
        string $selection,
        ?string $noteContent,
        ?string $customInstruction,
        ?string $referenceContext,
        string $styleMode
    ): string {
        $parts = [];
        $parts[] = "### TEKS DRAF ASLI MAHASISWA:\n{$selection}";

        if (! empty($noteContent)) {
            $parts[] = "### CATATAN REVISI / BIMBINGAN DOSEN TERKAIT:\n{$noteContent}";
        }

        if (! empty($customInstruction)) {
            $parts[] = "### ARAHAN / INSTRUKSI TAMBAHAN DARI MAHASISWA:\n{$customInstruction}";
        }

        if (! empty($referenceContext)) {
            $parts[] = "### KONTEKS REFERENSI ILMIAH PENDUKUNG:\n{$referenceContext}\n(Catatan: Padukan substansi/konsep referensi di atas ke dalam tulisan secara akademis dan hindari plagiarisme/copy-paste verbatim).";
        }

        $styleInstruction = match ($styleMode) {
            'concise' => 'Gaya bahasa: Padat, ringkas, lugas, dan to the point tanpa mengurangi substansi akademis.',
            'elaborative' => 'Gaya bahasa: Elaboratif, mendalam, memperjelas argumentasi dan konteks secara komprehensif.',
            default => 'Gaya bahasa: Akademik standar, formal, objektif, dan terstruktur sesuai kaidah skripsi.',
        };
        $parts[] = "### INSTRUKSI GAYA:\n{$styleInstruction}";
        $parts[] = "Tolong susun kembali teks draf di atas menjadi satu kesatuan paragraf/teks baru yang rapi, koheren, dan memenuhi seluruh arahan bimbingan serta referensi yang diberikan.";

        return implode("\n\n", $parts);
    }
}

