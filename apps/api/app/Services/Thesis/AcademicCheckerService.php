<?php

namespace App\Services\Thesis;

use OpenAI\Laravel\Facades\OpenAI;
use RuntimeException;

class AcademicCheckerService
{
    /**
     * Analyze chapter text for Indonesian academic writing, PUEBI/KBBI grammar, and clarity.
     *
     * @return array{overall_score: int, summary: string, suggestions: array<int, array{type: string, original: string, suggestion: string, reason: string}>}
     */
    public function analyze(string $text): array
    {
        $truncatedText = mb_substr(trim($text), 0, 10000);

        if ($truncatedText === '') {
            return [
                'overall_score' => 100,
                'summary' => 'Teks kosong, tidak ada evaluasi tata bahasa.',
                'suggestions' => [],
            ];
        }

        try {
            $response = OpenAI::chat()->create([
                'model' => config('openai.llm_model', env('LLM_MODEL', 'gpt-4o-mini')),
                'stream' => false,
                'response_format' => ['type' => 'json_object'],
                'messages' => [
                    [
                        'role' => 'system',
                        'content' => <<<'PROMPT'
Kamu adalah pakar tata bahasa Indonesia (PUEBI/KBBI) dan penulisan karya ilmiah/skripsi.
Tugasmu adalah menganalisis teks bab skripsi mahasiswa dan mengidentifikasi kesalahan kepatuhan bahasa baku, ejaan/typo, kalimat tidak efektif/ambigu, dan saran gaya bahasa akademik (academic tone).

Kembalikan HANYA JSON valid dengan skema:
{
  "overall_score": integer (skor 0-100 atas kualitas bahasa akademik),
  "summary": string (ringkasan temuan bahasa secara umum),
  "suggestions": [
    {
      "type": string (pilih salah satu: "spelling" | "grammar" | "academic_tone" | "effective_sentence"),
      "original": string (potongan kalimat/kata asli yang keliru),
      "suggestion": string (perbaikan yang direkomendasikan),
      "reason": string (alasan atau kaidah PUEBI/KBBI)
    }
  ]
}
PROMPT,
                    ],
                    [
                        'role' => 'user',
                        'content' => $truncatedText,
                    ],
                ],
            ]);

            $content = $response->choices[0]->message->content ?? null;
            if ($content === null) {
                throw new RuntimeException('LLM returned empty response.');
            }

            $data = json_decode($content, true);
            if (! is_array($data)) {
                throw new RuntimeException('Invalid JSON from LLM.');
            }

            return [
                'overall_score' => isset($data['overall_score']) ? (int) $data['overall_score'] : 85,
                'summary' => isset($data['summary']) ? (string) $data['summary'] : 'Analisis selesai.',
                'suggestions' => isset($data['suggestions']) && is_array($data['suggestions']) ? $data['suggestions'] : [],
            ];
        } catch (\Throwable $e) {
            // Fallback heuristic analysis if LLM unavailable
            return $this->fallbackAnalysis($truncatedText);
        }
    }

    private function fallbackAnalysis(string $text): array
    {
        $suggestions = [];
        $rules = [
            ['pattern' => '/\bdimana\b/i', 'replacement' => 'tempat / di mana', 'type' => 'grammar', 'reason' => 'Penggunaan "dimana" sebagai kata hubung tidak baku dalam bahasa Indonesia baku.'],
            ['pattern' => '/\bmerubah\b/i', 'replacement' => 'mengubah', 'type' => 'spelling', 'reason' => 'Bentuk baku menurut KBBI dari kata dasar "ubah" adalah "mengubah".'],
            ['pattern' => '/\bmempengaruhi\b/i', 'replacement' => 'memengaruhi', 'type' => 'spelling', 'reason' => 'Huruf "p" luluh saat diberi awalan me-, sehingga bentuk baku adalah "memengaruhi".'],
            ['pattern' => '/\bkarena itu\b/i', 'replacement' => 'Oleh karena itu,', 'type' => 'academic_tone', 'reason' => 'Gunakan konjungsi antarkalimat yang baku di awal kalimat.'],
        ];

        foreach ($rules as $rule) {
            if (preg_match($rule['pattern'], $text, $matches)) {
                $suggestions[] = [
                    'type' => $rule['type'],
                    'original' => $matches[0],
                    'suggestion' => $rule['replacement'],
                    'reason' => $rule['reason'],
                ];
            }
        }

        return [
            'overall_score' => count($suggestions) > 0 ? 80 : 95,
            'summary' => count($suggestions) > 0 ? 'Ditemukan beberapa ketidaksesuaian kata baku.' : 'Tidak ditemukan kesalahan ejaan umum.',
            'suggestions' => $suggestions,
        ];
    }
}
