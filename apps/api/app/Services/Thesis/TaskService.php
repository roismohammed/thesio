<?php

namespace App\Services\Thesis;

use App\Models\Task;
use App\Models\Thesis;
use Carbon\Carbon;
use Illuminate\Support\Collection;

/**
 * Task deadline orchestration (constitution I — service territory).
 *
 * Deadline computation is a pure, deterministic proportional distribution
 * working backwards from the defense deadline (research D2): auto-deadline
 * tasks not yet done are slotted so the most-urgent (lowest priority number)
 * task gets the earliest due date, keeping priority order consistent on
 * recalc (SC-004).
 */
class TaskService
{
    /**
     * Recompute and persist due dates for all auto-deadline, not-done tasks
     * of a thesis. Manual-deadline and done tasks are untouched (FR-010).
     * Skips entirely when no defense deadline is set (D8).
     *
     * @return int number of tasks whose due date changed
     */
    public function recalcDeadlines(Thesis $thesis): int
    {
        $count = $this->persistDeadlines($thesis);

        if ($count > 0) {
            activity('thesis')
                ->performedOn($thesis)
                ->causedBy(request()->user())
                ->log("Menghitung ulang tenggat {$count} tugas skripsi '{$thesis->title}' karena deadline sidang diperbarui.");
        }

        return $count;
    }

    /**
     * Compute and persist the deadline distribution after a single task is
     * created or accepted, so the new task slots into the board. Logs its own
     * narrative at the call site (create/accept), not here.
     *
     * @return int number of tasks whose due date changed
     */
    public function assignInitialDeadline(Task $task): int
    {
        return $this->persistDeadlines($task->thesis);
    }

    /**
     * Compute the proportional distribution, save dirty auto tasks, and
     * return how many changed. No-op when the thesis has no deadline.
     */
    private function persistDeadlines(Thesis $thesis): int
    {
        $deadline = $thesis->defense_deadline_at;

        if ($deadline === null) {
            return 0;
        }

        $tasks = $thesis->tasks()
            ->where('status', '!=', 'done')
            ->where('due_at_mode', 'auto')
            ->orderBy('priority')
            ->get();

        if ($tasks->isEmpty()) {
            return 0;
        }

        $now = now();
        $n = $tasks->count();
        $slot = ($deadline->getTimestamp() - $now->getTimestamp()) / ($n + 1);

        $count = 0;
        foreach ($tasks->values() as $i => $task) {
            $dueAt = $deadline->copy()->subMilliseconds((int) round(($n - $i) * $slot * 1000));
            $task->due_at = $dueAt;

            if ($task->isDirty('due_at')) {
                $count++;
                $task->save();
            }
        }

        return $count;
    }

    /**
     * In-memory proportional distribution (research D2) for a thesis' auto,
     * not-done tasks, sorted by priority asc. Returns the tasks with fresh
     * due_at values; does not persist.
     *
     * @return Collection<int, Task>
     */
    public function computeDeadlines(Thesis $thesis): Collection
    {
        $tasks = $thesis->tasks()
            ->where('status', '!=', 'done')
            ->where('due_at_mode', 'auto')
            ->orderBy('priority')
            ->get();

        $deadline = $thesis->defense_deadline_at;

        if ($deadline === null || $tasks->isEmpty()) {
            return collect();
        }

        $now = now();
        $n = $tasks->count();
        $slot = ($deadline->getTimestamp() - $now->getTimestamp()) / ($n + 1);

        foreach ($tasks->values() as $i => $task) {
            $dueAt = $deadline->copy()->subMilliseconds((int) round(($n - $i) * $slot * 1000));
            $task->due_at = $dueAt;
        }

        return $tasks;
    }

    /**
     * Urgency bucket for a due date (research D3). Pure helper.
     *
     * @return 'late'|'soon'|'safe'|'none'
     */
    public function urgency(?Carbon $dueAt, ?Carbon $now = null): string
    {
        $now = $now ?? now();

        if ($dueAt === null) {
            return 'none';
        }

        if ($dueAt->lt($now)) {
            return 'late';
        }

        $soonDays = (int) config('thesis.task_urgent_within_days', 7);

        if ($dueAt->lt($now->copy()->addDays($soonDays))) {
            return 'soon';
        }

        return 'safe';
    }
}