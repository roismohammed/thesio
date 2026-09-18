<?php

namespace App\Http\Resources\Thesis;

use App\Models\Task;
use App\Services\Thesis\TaskService;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin Task */
class TaskResource extends JsonResource
{
    /**
     * Transform the task resource into an array. `urgency` is always
     * computed server-side so the board shows indicators without extra
     * client logic.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $urgency = app(TaskService::class)->urgency($this->due_at);

        return [
            'id' => $this->id,
            'thesis_id' => $this->thesis_id,
            'title' => $this->title,
            'description' => $this->description,
            'status' => $this->status,
            'priority' => $this->priority,
            'position' => $this->position,
            'due_at' => $this->due_at?->toIso8601String(),
            'due_at_mode' => $this->due_at_mode,
            'origin' => $this->origin,
            'chapter_id' => $this->chapter_id,
            'supervision_note_id' => $this->supervision_note_id,
            'task_suggestion_id' => $this->task_suggestion_id,
            'urgency' => $urgency,
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}