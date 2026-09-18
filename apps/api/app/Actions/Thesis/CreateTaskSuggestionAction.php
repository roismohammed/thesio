<?php

namespace App\Actions\Thesis;

use App\Models\TaskSuggestion;
use App\Models\Thesis;
use App\Services\Thesis\TaskSuggestionLlmClient;

class CreateTaskSuggestionAction
{
    public function __construct(
        private readonly TaskSuggestionLlmClient $llmClient,
    ) {}

    /**
     * Call the LLM and persist new suggestions. Suggestions whose signature
     * already exists for this thesis (any status) are skipped — a rejected
     * suggestion must never reappear (research D9). On LLM failure nothing is
     * persisted (no partial results).
     *
     * @param  array<int, array{title: string, description: string, priority: int, source_type: string, chapter_id: int|null, supervision_note_id: int|null}>  $suggestions
     */
    public function execute(Thesis $thesis, array $suggestions): int
    {
        $existing = TaskSuggestion::where('thesis_id', $thesis->id)
            ->pluck('signature')
            ->all();

        $persisted = 0;
        foreach ($suggestions as $raw) {
            $signature = TaskSuggestion::signatureFor(
                $raw['source_type'],
                $raw['supervision_note_id'] ?? $raw['chapter_id'],
                $raw['title'],
            );

            if (in_array($signature, $existing, true)) {
                continue;
            }

            TaskSuggestion::create([
                'thesis_id' => $thesis->id,
                'title' => $raw['title'],
                'description' => $raw['description'],
                'priority' => $raw['priority'],
                'source_type' => $raw['source_type'],
                'chapter_id' => $raw['chapter_id'],
                'supervision_note_id' => $raw['supervision_note_id'],
                'signature' => $signature,
                'status' => 'pending',
                'generated_at' => now(),
            ]);

            $existing[] = $signature;
            $persisted++;
        }

        return $persisted;
    }
}