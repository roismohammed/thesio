<?php

namespace App\Policies;

use App\Models\Task;
use App\Models\User;

class TaskPolicy
{
    /**
     * Only the owning student (via the task's thesis) may view a task.
     */
    public function view(User $user, Task $task): bool
    {
        return $user->is($task->thesis->user);
    }

    /**
     * Only the owning student may update a task.
     */
    public function update(User $user, Task $task): bool
    {
        return $user->is($task->thesis->user);
    }

    /**
     * Only the owning student may delete a task.
     */
    public function delete(User $user, Task $task): bool
    {
        return $user->is($task->thesis->user);
    }
}