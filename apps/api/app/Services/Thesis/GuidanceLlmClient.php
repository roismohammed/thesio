<?php

namespace App\Services\Thesis;

use App\Models\GuidancePoint;
use App\Models\Thesis;
use Illuminate\Support\Collection;
use OpenAI\Laravel\Facades\OpenAI;
use RuntimeException;

/**
 * External LLM client for guidance generation (infra Service — external API
 * territory, per constitution Principle I). Assembles the user-content
 * context JSON, calls the OpenAI-compatible client, and returns a validated
 * points array. Throws on any HTTP/parse/schema failure; an empty points
 * array is a valid success.
 */
class GuidanceLlmClient
{
    /**
     * Generate discussion points for a thesis' next supervision agenda.
     *
     * @return array<int, array{title: string, description: string, chapter_id: int|null, supervision_note_id: int|null, priority: int}>
     */
    public function generate(Thesis $thesis, Collection $previousOpenPoints): array
    {
        try {
            $response = OpenAI::chat()->create([
                'model' => config('openai.llm_model', env('LLM_MODEL', 'gpt-4o-mini')),
                'stream' => false,
                'response_format' => ['type' => 'json_object'],
                'messages' => [
                    ['role' => 'system', 'content' => <<<'PROMPT'
                        Kamu adalah asisten bimbingan skripsi. Tugasmu menyusun agenda bimbingan:
                        daftar poin diskusi apa yang harus dibawa mahasiswa ke dosen pembimbing pada
                        sesi bimbingan berikutnya, berdasarkan catatan notulen bimbingan sebelumnya,
                        deadline sidang, dan status bab skripsi.

                        Aturan:
                        - Prioritaskan poin berdasarkan sisa waktu menuju deadline sidang; makin dekat
                          deadline, poin mendesak muncul lebih dulu (priority lebih kecil = lebih mendesak).
                        - Untuk setiap poin, tautkan ke chapter_id dan/atau supervision_note_id asal
                          bila relevan; gunakan ID yang diberikan di konteks, atau null.
                        - Hanya angkat poin yang benar-benar relevan; jangan mengarang poin tanpa dasar.
                        - Jika tidak ada notulen dan semua bab sudah final/selesai, kembalikan array
                          points kosong.
                        - Kembalikan HANYA JSON valid sesuai skema, tanpa penjelasan tambahan.

                        Skema JSON:
                        {
                          "points": [
                            { "title": string, "description": string,
                              "chapter_id": integer|null, "supervision_note_id": integer|null,
                              "priority": integer }
                          ]
                        }
                        PROMPT,
                    ],
                    ['role' => 'user', 'content' => json_encode($this->context($thesis, $previousOpenPoints))],
                ],
            ]);

            $content = $response->choices[0]->message->content ?? null;

            return $this->validatePoints($content, $thesis);
        } catch (RuntimeException $e) {
            return $this->fail($e);
        } catch (\Throwable $e) {
            return $this->fail($e);
        }
    }

    /**
     * Build the user-content context JSON from the thesis state.
     */
    private function context(Thesis $thesis, Collection $previousOpenPoints): array
    {
        $deadline = $thesis->defense_deadline_at;

        $chapters = $thesis->chapters->map(fn ($chapter) => [
            'id' => $chapter->id,
            'title' => $chapter->title,
            'status' => $chapter->status,
            'has_readable_content' => filled($chapter->currentVersion?->markdown_content),
        ])->values()->all();

        $notulen = $thesis->chapters->flatMap(function ($chapter) {
            return $chapter->supervisionNote ? [[
                'id' => $chapter->supervisionNote->id,
                'chapter_id' => $chapter->id,
                'content' => mb_substr($chapter->supervisionNote->content, 0, 2000),
                'created_at' => $chapter->supervisionNote->created_at?->toIso8601String(),
            ]] : [];
        })->values()->all();

        return [
            'thesis_title' => $thesis->title,
            'defense_deadline_at' => $deadline?->toDateString(),
            'defense_remaining_days' => $deadline === null ? null : (int) now()->startOfDay()->diffInDays($deadline->startOfDay()),
            'deadline_set' => $deadline !== null,
            'chapters' => $chapters,
            'notulen' => $notulen,
            'previous_open_points' => $previousOpenPoints->map(fn (GuidancePoint $p) => [
                'title' => $p->title,
                'from_supervision_note_id' => $p->supervision_note_id,
            ])->values()->all(),
        ];
    }

    /**
     * Validate the raw LLM JSON response into a fixtures points array.
     *
     * @return array<int, array{title: string, description: string, chapter_id: int|null, supervision_note_id: int|null, priority: int}>
     */
    private function validatePoints(?string $content, Thesis $thesis): array
    {
        if ($content === null) {
            throw new RuntimeException('LLM returned an empty response.');
        }

        $decoded = json_decode($content, true);
        if (! is_array($decoded) || ! isset($decoded['points']) || ! is_array($decoded['points'])) {
            throw new RuntimeException('LLM response is not valid JSON.');
        }

        $validChapterIds = $thesis->chapters->pluck('id')->all();
        $validNoteIds = $thesis->chapters
            ->flatMap(fn ($c) => $c->supervisionNote ? [$c->supervisionNote->id] : [])
            ->all();

        $points = [];
        foreach ($decoded['points'] as $raw) {
            if (! is_array($raw) || ! isset($raw['title']) || ! is_string($raw['title']) || trim($raw['title']) === '') {
                continue;
            }

            $chapterId = $raw['chapter_id'] ?? null;
            $noteId = $raw['supervision_note_id'] ?? null;
            $points[] = [
                'title' => trim($raw['title']),
                'description' => (isset($raw['description']) && is_string($raw['description'])) ? $raw['description'] : '',
                'chapter_id' => in_array($chapterId, $validChapterIds, true) ? (int) $chapterId : null,
                'supervision_note_id' => in_array($noteId, $validNoteIds, true) ? (int) $noteId : null,
                'priority' => isset($raw['priority']) ? max(1, (int) $raw['priority']) : 999,
            ];
        }

        // Normalise priority: re-sort by LLM priority asc, then assign 1..N.
        usort($points, fn (array $a, array $b) => $a['priority'] <=> $b['priority']);
        $normalised = [];
        foreach ($points as $i => $point) {
            $point['priority'] = $i + 1;
            $normalised[] = $point;
        }

        return $normalised;
    }

    /**
     * Wrap any failure into a RuntimeException.
     */
    private function fail(\Throwable $e): never
    {
        throw new RuntimeException('Guidance LLM call failed: '.$e->getMessage(), 0, $e);
    }
}
