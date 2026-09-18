<?php

namespace App\Actions\Thesis;

use App\Models\Task;

class MoveTaskAction
{
    /**
     * Move a task between columns and/or reorder it within a column (DnD
     * drop). Sets status + position, then re-normalizes sibling positions in
     * the target column to sequential integers. Does NOT touch due_at /
     * due_at_mode (move is not a deadline edit).
     */
    public function execute(Task $task, string $status, int $position): Task
    {
        $task->status = $status;
        $task->position = $position;
        $task->save();

        $siblings = Task::where('thesis_id', $task->thesis_id)
            ->where('status', $status)
            ->where('id', '!=', $task->id)
            ->orderBy('position')
            ->get()
            ->values();

        // Recompute a sequential 0..N order: insert the moved task at its
        // position, then stamp each sibling with its final slot.
        $order = $siblings->all();
        array_splice($order, min($position, count($order)), 0, [$task]);

        foreach ($order as $index => $item) {
            if ($item->position !== $index) {
                Task::whereKey($item->id)->update(['position' => $index]);
            }
        }

        $task->position = min($position, count($siblings));

        return $task;
    }
}