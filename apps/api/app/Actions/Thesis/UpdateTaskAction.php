<?php

namespace App\Actions\Thesis;

use App\Models\Task;

class UpdateTaskAction
{
    /**
     * Update a task's editable fields. When an explicit due date is present
     * in the input, the deadline becomes manual (FR-010/FR-012); when `due_at`
     * is explicitly nulled, the mode is left unchanged.
     *
     * @param  array{title?: string, description?: string|null, priority?: int|null, due_at?: string|null, chapter_id?: int|null, supervision_note_id?: int|null, status?: string}  $data
     */
    public function execute(Task $task, array $data): Task
    {
        $fill = array_intersect_key($data, array_flip([
            'title', 'description', 'priority', 'chapter_id', 'supervision_note_id', 'status',
        ]));

        if ($fill !== []) {
            $task->fill($fill);
        }

        if (array_key_exists('due_at', $data)) {
            $task->due_at = $data['due_at'] !== null ? new \DateTimeImmutable($data['due_at']) : null;

            if ($data['due_at'] !== null) {
                $task->due_at_mode = 'manual';
            }
        }

        $task->save();

        return $task;
    }
}