<?php

namespace App\Http\Resources\Thesis;

use App\Models\TaskSuggestion;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin TaskSuggestion */
class TaskSuggestionResource extends JsonResource
{
    /**
     * Transform the suggestion resource. `due_at_suggestion` is computed
     * server-side via the proportional formula (D2) so the student can weigh
     * the deadline before accepting.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $dueAtSuggestion = null;

        $deadline = $this->thesis->defense_deadline_at;
        if ($deadline !== null) {
            // Best-effort suggestion deadline: place the suggestion before the
            // defense deadline using the same proportional approach — slot is
            // computed against the current open task count + this suggestion.
            $openCount = $this->thesis->tasks()
                ->where('status', '!=', 'done')
                ->where('due_at_mode', 'auto')
                ->count();

            $now = now();
            $n = $openCount + 1;
            $slot = ($deadline->getTimestamp() - $now->getTimestamp()) / ($n + 1);
            $dueAtSuggestion = $deadline->copy()->subMilliseconds((int) round($n * $slot * 1000))->toIso8601String();
        }

        return [
            'id' => $this->id,
            'thesis_id' => $this->thesis_id,
            'title' => $this->title,
            'description' => $this->description,
            'priority' => $this->priority,
            'source_type' => $this->source_type,
            'chapter_id' => $this->chapter_id,
            'supervision_note_id' => $this->supervision_note_id,
            'status' => $this->status,
            'due_at_suggestion' => $dueAtSuggestion,
            'generated_at' => $this->generated_at?->toIso8601String(),
        ];
    }
}