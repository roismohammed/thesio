<?php

namespace App\Services\Thesis;

use App\Actions\Thesis\CreateTaskAction;
use App\Actions\Thesis\DeleteTaskAction;
use App\Actions\Thesis\MoveTaskAction;
use App\Actions\Thesis\UpdateTaskAction;
use App\Models\Task;
use App\Models\Thesis;

class TaskCrudService
{
    public function __construct(
        private readonly CreateTaskAction $createTaskAction,
        private readonly UpdateTaskAction $updateTaskAction,
        private readonly DeleteTaskAction $deleteTaskAction,
        private readonly MoveTaskAction $moveTaskAction,
        private readonly TaskService $taskService,
    ) {}

    /**
     * Create a manual task, assign its initial deadline, and record the
     * mutation.
     *
     * @param  array{title: string, description?: string|null, priority?: int|null, chapter_id?: int|null, supervision_note_id?: int|null}  $data
     */
    public function create(Thesis $thesis, array $data): Task
    {
        $task = $this->createTaskAction->execute($thesis, $data);
        $this->taskService->assignInitialDeadline($task);

        activity('thesis')
            ->performedOn($thesis)
            ->causedBy(request()->user())
            ->log("Membuat tugas '{$task->title}' untuk skripsi '{$thesis->title}'.");

        return $task;
    }

    /**
     * Update a task and record the mutation. A manual-due-date change gets
     * its own narrative entry.
     *
     * @param  array{title?: string, description?: string|null, priority?: int|null, due_at?: string|null, chapter_id?: int|null, supervision_note_id?: int|null, status?: string}  $data
     */
    public function update(Thesis $thesis, Task $task, array $data): Task
    {
        $oldDueAt = $task->due_at?->toDateString();
        $task = $this->updateTaskAction->execute($task, $data);

        if (array_key_exists('due_at', $data) && $data['due_at'] !== null && $data['due_at'] !== $oldDueAt) {
            activity('thesis')
                ->performedOn($thesis)
                ->causedBy(request()->user())
                ->log("Mengatur tenggat tugas '{$task->title}' manual ke {$task->due_at->toDateString()} pada skripsi '{$thesis->title}'.");
        } else {
            activity('thesis')
                ->performedOn($thesis)
                ->causedBy(request()->user())
                ->log("Memperbarui tugas '{$task->title}' pada skripsi '{$thesis->title}'.");
        }

        return $task;
    }

    /**
     * Move a task to another column / position and record the mutation.
     */
    public function move(Thesis $thesis, Task $task, string $status, int $position): Task
    {
        $task = $this->moveTaskAction->execute($task, $status, $position);

        activity('thesis')
            ->performedOn($thesis)
            ->causedBy(request()->user())
            ->log("Memindahkan tugas '{$task->title}' ke kolom {$status} pada skripsi '{$thesis->title}'.");

        return $task;
    }

    /**
     * Delete a task and record the mutation.
     */
    public function delete(Thesis $thesis, Task $task): void
    {
        activity('thesis')
            ->performedOn($thesis)
            ->causedBy(request()->user())
            ->log("Menghapus tugas '{$task->title}' dari papan skripsi '{$thesis->title}'.");

        $this->deleteTaskAction->execute($task);
    }
}