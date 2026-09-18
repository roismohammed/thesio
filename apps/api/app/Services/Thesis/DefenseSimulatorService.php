<?php

namespace App\Services\Thesis;

use App\Models\Thesis;
use OpenAI\Laravel\Facades\OpenAI;
use RuntimeException;

class DefenseSimulatorService
{
    /**
     * Generate critical exam defense questions from thesis content.
     *
     * @return array<int, array{id: int, category: string, question: string, focus_hint: string}>
     */
    public function generateQuestions(Thesis $thesis): array
    {
        $thesis->load(['chapters.currentVersion']);

        $summary = "Judul Skripsi: " . $thesis->title . "\n";
        foreach ($thesis->chapters as $chapter) {
            $content = $chapter->currentVersion?->markdown_content ?? '';
            $summary .= "--- " . $chapter->title . " ---\n" . mb_substr($content, 0, 1500) . "\n\n";
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
Kamu adalah dewan penguji sidang skripsi (Dosen Penguji Utama). Tugasmu memberikan 4-5 pertanyaan kritis dan mendalam yang menguji penguasaan materi mahasiswa terkait:
1. Urgensi & Batasan Masalah (Bab 1)
2. Landasan Teori & Literatur Relevan (Bab 2)
3. Metodologi Penelitian & Validitas Data (Bab 3)
4. Hasil, Pembahasan, & Kontribusi Temuan (Bab 4-5)

Kembalikan HANYA JSON valid:
{
  "questions": [
    {
      "id": integer,
      "category": string (mis. "Metodologi" | "Kontribusi" | "Validitas Data" | "Urgensi Masalah"),
      "question": string,
      "focus_hint": string (petunjuk aspek kunci yang ingin didengar penguji)
    }
  ]
}
PROMPT,
                    ],
                    [
                        'role' => 'user',
                        'content' => mb_substr($summary, 0, 8000),
                    ],
                ],
            ]);

            $content = $response->choices[0]->message->content ?? null;
            if ($content === null) {
                throw new RuntimeException('LLM returned empty');
            }

            $decoded = json_decode($content, true);
            return $decoded['questions'] ?? $this->fallbackQuestions($thesis);
        } catch (\Throwable) {
            return $this->fallbackQuestions($thesis);
        }
    }

    /**
     * Evaluate student answer.
     *
     * @return array{score: int, grade: string, feedback: string, strengths: string[], improvements: string[]}
     */
    public function evaluateAnswer(string $question, string $answer): array
    {
        try {
            $response = OpenAI::chat()->create([
                'model' => config('openai.llm_model', env('LLM_MODEL', 'gpt-4o-mini')),
                'stream' => false,
                'response_format' => ['type' => 'json_object'],
                'messages' => [
                    [
                        'role' => 'system',
                        'content' => <<<'PROMPT'
Kamu adalah dosen penguji sidang skripsi yang menilai ketepatan dan ketegasan jawaban mahasiswa.
Berikan penilaian skor (0-100), feedback konstruktif, poin kelebihan, dan aspek perbaikan jawaban.

Kembalikan HANYA JSON valid:
{
  "score": integer (0-100),
  "grade": string ("A" | "B+" | "B" | "C" | "D"),
  "feedback": string,
  "strengths": [string],
  "improvements": [string]
}
PROMPT,
                    ],
                    [
                        'role' => 'user',
                        'content' => "Pertanyaan Penguji:\n{$question}\n\nJawaban Mahasiswa:\n{$answer}",
                    ],
                ],
            ]);

            $content = $response->choices[0]->message->content ?? null;
            if ($content === null) {
                throw new RuntimeException('LLM returned empty');
            }

            $decoded = json_decode($content, true);
            return [
                'score' => $decoded['score'] ?? 80,
                'grade' => $decoded['grade'] ?? 'B+',
                'feedback' => $decoded['feedback'] ?? 'Jawaban cukup lugas dan menjawab pertanyaan dasar.',
                'strengths' => $decoded['strengths'] ?? ['Penyampaian runut'],
                'improvements' => $decoded['improvements'] ?? ['Sertakan data atau rujukan spesifik'],
            ];
        } catch (\Throwable) {
            $length = mb_strlen(trim($answer));
            $score = $length > 100 ? 85 : ($length > 40 ? 75 : 60);
            return [
                'score' => $score,
                'grade' => $score >= 85 ? 'A' : ($score >= 70 ? 'B' : 'C'),
                'feedback' => 'Jawaban Anda telah tercatat dengan baik dalam simulasi.',
                'strengths' => ['Berani merespons dengan runtut'],
                'improvements' => ['Jelaskan argumen lebih mendalam dengan bukti empiris'],
            ];
        }
    }

    private function fallbackQuestions(Thesis $thesis): array
    {
        return [
            [
                'id' => 1,
                'category' => 'Urgensi Masalah',
                'question' => 'Mengapa penelitian ini penting untuk diangkat dan apa gap penelitian yang belum terselesaikan sebelumnya?',
                'focus_hint' => 'Jelaskan latar belakang masalah empiris dan orisinalitas riset Anda.',
            ],
            [
                'id' => 2,
                'category' => 'Metodologi',
                'question' => 'Bagaimana Anda memastikan validitas instrumen dan metode pengumpulan data yang digunakan bebas dari bias?',
                'focus_hint' => 'Tekankan teknik pengujian, triangulasi, atau pemilihan sampel.',
            ],
            [
                'id' => 3,
                'category' => 'Kontribusi',
                'question' => 'Apa kontribusi teoritis maupun praktis utama yang dihasilkan dari temuan skripsi ini?',
                'focus_hint' => 'Sebutkan implikasi langsung bagi akademisi dan praktisi bidang terkait.',
            ],
        ];
    }
}
