<?php

namespace App\Actions\Thesis;

use App\Models\Task;
use App\Models\Thesis;

class CreateTaskAction
{
    /**
     * Persist a new manual task. Status, origin, deadline mode, and position
     * are enforced server-side; the due date is computed by the deadline
     * service when a defense deadline is set (else null — D8).
     *
     * @param  array{title: string, description?: string|null, priority?: int|null, chapter_id?: int|null, supervision_note_id?: int|null}  $data
     */
    public function execute(Thesis $thesis, array $data): Task
    {
        $task = Task::create([
            'thesis_id' => $thesis->id,
            'title' => $data['title'],
            'description' => $data['description'] ?? null,
            'status' => 'todo',
            'priority' => $data['priority'] ?? 999,
            'position' => 999,
            'due_at' => null,
            'due_at_mode' => 'auto',
            'origin' => 'manual',
            'chapter_id' => $data['chapter_id'] ?? null,
            'supervision_note_id' => $data['supervision_note_id'] ?? null,
        ]);

        return $task;
    }
}