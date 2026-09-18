<?php

namespace App\Actions\Thesis;

use App\Models\Task;
use App\Models\TaskSuggestion;
use App\Models\Thesis;
use Illuminate\Support\Facades\DB;

class AcceptTaskSuggestionAction
{
    /**
     * Accept a suggestion: create a Task (origin suggestion) and mark the
     * suggestion accepted, all in one transaction. Deadline assignment is
     * orchestrated by the service afterwards.
     */
    public function execute(Thesis $thesis, TaskSuggestion $suggestion): Task
    {
        return DB::transaction(function () use ($thesis, $suggestion): Task {
            $task = Task::create([
                'thesis_id' => $thesis->id,
                'title' => $suggestion->title,
                'description' => $suggestion->description,
                'status' => 'todo',
                'priority' => $suggestion->priority,
                'position' => 999,
                'due_at' => null,
                'due_at_mode' => 'auto',
                'origin' => 'suggestion',
                'chapter_id' => $suggestion->chapter_id,
                'supervision_note_id' => $suggestion->supervision_note_id,
                'task_suggestion_id' => $suggestion->id,
            ]);

            $suggestion->status = 'accepted';
            $suggestion->save();

            return $task;
        });
    }
}