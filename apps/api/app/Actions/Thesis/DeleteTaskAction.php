<?php

namespace App\Actions\Thesis;

use App\Models\Task;

class DeleteTaskAction
{
    /**
     * Remove a task from the board.
     */
    public function execute(Task $task): void
    {
        $task->delete();
    }
}