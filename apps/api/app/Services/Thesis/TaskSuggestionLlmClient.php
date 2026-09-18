<?php

namespace App\Services\Thesis;

use App\Models\Thesis;
use OpenAI\Laravel\Facades\OpenAI;
use RuntimeException;

/**
 * External LLM client for task suggestions (infra Service — external API
 * territory, per constitution Principle I). Assembles the thesis state as
 * context JSON, calls the OpenAI-compatible client with the fixed Indonesian
 * system prompt, and returns a validated suggestions array. Throws on any
 * HTTP/parse/schema failure; an empty suggestions array is valid success.
 */
class TaskSuggestionLlmClient
{
    /**
     * Generate task suggestions for a thesis.
     *
     * @return array<int, array{title: string, description: string, priority: int, source_type: string, chapter_id: int|null, supervision_note_id: int|null}>
     */
    public function generate(Thesis $thesis): array
    {
        try {
            $response = OpenAI::chat()->create([
                'model' => config('openai.llm_model', env('LLM_MODEL', 'gpt-4o-mini')),
                'stream' => false,
                'response_format' => ['type' => 'json_object'],
                'messages' => [
                    ['role' => 'system', 'content' => <<<'PROMPT'
                        Kamu adalah asisten yang membantu mahasiswa merencanakan pekerjaan skripsi.
                        Tugasmu menyarankan tugas konkret yang harus dikerjakan mahasiswa, berdasarkan:
                        1. Catatan notulen revisi dosen per bab (bagian yang ditandai perlu direvisi).
                        2. Bab skripsi yang belum lengkap (masih berstatus draft).
                        Acarakan saran pada deadline sidang yang sudah ditentukan.

                        Aturan:
                        - Untuk setiap saran, tautkan ke chapter_id dan/atau supervision_note_id asal
                          bila relevan; gunakan ID yang diberikan di konteks, atau null.
                        - Berikan priority integer; lebih kecil = lebih mendesak. Urutkan menurut
                          kepentingan: revisi notulen dosen lebih didahulukan daripada pelengkapan bab.
                        - Hanya sarankan tugas yang benar-benar relevan; jangan mengarang tugas tanpa
                          dasar dari notulen atau status bab.
                        - Jika tidak ada notulen dan semua bab sudah lengkap (bukan draft),
                          kembalikan array suggestions kosong.
                        - Jangan sarankan tugas yang sudah ada di daftar existing_tasks (hindari duplikat).
                        - Kembalikan HANYA JSON valid sesuai skema, tanpa penjelasan tambahan.

                        Skema JSON:
                        {
                          "suggestions": [
                            { "title": string, "description": string,
                              "chapter_id": integer|null, "supervision_note_id": integer|null,
                              "priority": integer,
                              "source_type": "note_revision" | "chapter_draft" }
                          ]
                        }
                        PROMPT,
                    ],
                    ['role' => 'user', 'content' => json_encode($this->context($thesis))],
                ],
            ]);

            $content = $response->choices[0]->message->content ?? null;

            return $this->validateSuggestions($content, $thesis);
        } catch (RuntimeException $e) {
            throw new RuntimeException('Task suggestion LLM call failed: '.$e->getMessage(), 0, $e);
        } catch (\Throwable $e) {
            throw new RuntimeException('Task suggestion LLM call failed: '.$e->getMessage(), 0, $e);
        }
    }

    /**
     * Build the user-content context JSON from the thesis state.
     */
    private function context(Thesis $thesis): array
    {
        $deadline = $thesis->defense_deadline_at;

        $chapters = $thesis->chapters
            ->filter(fn ($chapter) => in_array($chapter->status, ['draft', 'submitted'], true))
            ->map(fn ($chapter) => [
                'id' => $chapter->id,
                'title' => $chapter->title,
                'status' => $chapter->status,
            ])
            ->values()
            ->all();

        $notulen = $thesis->chapters
            ->filter(fn ($chapter) => $chapter->supervisionNote)
            ->map(fn ($chapter) => [
                'id' => $chapter->supervisionNote->id,
                'chapter_id' => $chapter->id,
                'content' => mb_substr($chapter->supervisionNote->content, 0, 2000),
            ])
            ->values()
            ->all();

        return [
            'thesis_title' => $thesis->title,
            'defense_deadline_at' => $deadline?->toDateString(),
            'defense_remaining_days' => $deadline === null ? null : (int) now()->startOfDay()->diffInDays($deadline->startOfDay()),
            'deadline_set' => $deadline !== null,
            'chapters' => $chapters,
            'notulen' => $notulen,
            'existing_tasks' => $thesis->tasks()
                ->where('status', '!=', 'done')
                ->get(['title', 'status'])
                ->map(fn ($task) => ['title' => $task->title, 'status' => $task->status])
                ->values()
                ->all(),
        ];
    }

    /**
     * Validate the raw LLM JSON response into a suggestions array.
     *
     * @return array<int, array{title: string, description: string, priority: int, source_type: string, chapter_id: int|null, supervision_note_id: int|null}>
     */
    private function validateSuggestions(?string $content, Thesis $thesis): array
    {
        if ($content === null) {
            throw new RuntimeException('LLM returned an empty response.');
        }

        $decoded = json_decode($content, true);
        if (! is_array($decoded) || ! isset($decoded['suggestions']) || ! is_array($decoded['suggestions'])) {
            throw new RuntimeException('LLM response is not valid JSON.');
        }

        $validChapterIds = $thesis->chapters->pluck('id')->all();
        $validNoteIds = $thesis->chapters
            ->flatMap(fn ($c) => $c->supervisionNote ? [$c->supervisionNote->id] : [])
            ->all();

        $suggestions = [];
        foreach ($decoded['suggestions'] as $raw) {
            if (! is_array($raw) || ! isset($raw['title']) || ! is_string($raw['title']) || trim($raw['title']) === '') {
                continue;
            }

            $sourceType = isset($raw['source_type']) && in_array($raw['source_type'], ['note_revision', 'chapter_draft'], true)
                ? $raw['source_type']
                : 'chapter_draft';

            $suggestions[] = [
                'title' => trim($raw['title']),
                'description' => (isset($raw['description']) && is_string($raw['description'])) ? $raw['description'] : '',
                'priority' => isset($raw['priority']) ? max(1, (int) $raw['priority']) : 999,
                'source_type' => $sourceType,
                'chapter_id' => in_array(($raw['chapter_id'] ?? null), $validChapterIds, true) ? (int) $raw['chapter_id'] : null,
                'supervision_note_id' => in_array(($raw['supervision_note_id'] ?? null), $validNoteIds, true) ? (int) $raw['supervision_note_id'] : null,
            ];
        }

        // Normalise priority: re-sort by LLM priority asc, then assign 1..N.
        usort($suggestions, fn (array $a, array $b) => $a['priority'] <=> $b['priority']);
        $normalised = [];
        foreach ($suggestions as $i => $suggestion) {
            $suggestion['priority'] = $i + 1;
            $normalised[] = $suggestion;
        }

        return $normalised;
    }
}