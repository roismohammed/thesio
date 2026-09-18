<?php

namespace App\Services\Thesis;

use App\Actions\Thesis\AcceptTaskSuggestionAction;
use App\Actions\Thesis\CreateTaskSuggestionAction;
use App\Actions\Thesis\RejectTaskSuggestionAction;
use App\Models\Task;
use App\Models\TaskSuggestion;
use App\Models\Thesis;
use Illuminate\Support\Collection;
use RuntimeException;

class TaskSuggestionService
{
    /**
     * Guard message when there is no eligible source for suggestions.
     */
    public const NO_ELIGIBLE_SOURCE_MESSAGE = 'Belum ada chapter belum lengkap atau notulen revisi untuk disarankan.';

    public function __construct(
        private readonly CreateTaskSuggestionAction $createTaskSuggestionAction,
        private readonly AcceptTaskSuggestionAction $acceptTaskSuggestionAction,
        private readonly RejectTaskSuggestionAction $rejectTaskSuggestionAction,
        private readonly TaskSuggestionLlmClient $llmClient,
        private readonly TaskService $taskService,
    ) {}

    /**
     * Generate suggestions on demand. Idempotent unless `force` is set:
     * returns existing pending suggestions without calling the LLM. Throws a
     * RuntimeException when no eligible source exists (422) or the LLM fails.
     *
     * @return Collection<int, TaskSuggestion>
     */
    public function generate(Thesis $thesis, bool $force = false): Collection
    {
        if (! $this->hasEligibleSource($thesis)) {
            throw new RuntimeException(self::NO_ELIGIBLE_SOURCE_MESSAGE);
        }

        if (! $force) {
            $pending = $this->listPending($thesis);
            if ($pending->isNotEmpty()) {
                return $pending;
            }
        }

        $thesis->load(['chapters.supervisionNote']);

        $suggestions = $this->llmClient->generate($thesis);

        $persisted = $this->createTaskSuggestionAction->execute($thesis, $suggestions);

        activity('thesis')
            ->performedOn($thesis)
            ->causedBy(request()->user())
            ->log("Membuat saran tugas skripsi untuk '{$thesis->title}' — {$persisted} saran dari notulen revisi dan bab belum lengkap.");

        return $this->listPending($thesis);
    }

    /**
     * Active (pending) suggestions, sorted by priority asc.
     *
     * @return Collection<int, TaskSuggestion>
     */
    public function listPending(Thesis $thesis): Collection
    {
        return TaskSuggestion::where('thesis_id', $thesis->id)
            ->where('status', 'pending')
            ->orderBy('priority')
            ->get();
    }

    /**
     * Accept a suggestion: create a task, assign its initial deadline, and
     * record the mutation.
     */
    public function accept(Thesis $thesis, TaskSuggestion $suggestion): Task
    {
        $task = $this->acceptTaskSuggestionAction->execute($thesis, $suggestion);
        $this->taskService->assignInitialDeadline($task);

        activity('thesis')
            ->performedOn($thesis)
            ->causedBy(request()->user())
            ->log("Menerima saran tugas '{$task->title}' menjadi tugas skripsi '{$thesis->title}' — tenggat {$task->due_at?->toDateString()}.");

        return $task;
    }

    /**
     * Reject a suggestion and record the mutation.
     */
    public function reject(Thesis $thesis, TaskSuggestion $suggestion): void
    {
        $title = $suggestion->title;
        $this->rejectTaskSuggestionAction->execute($suggestion);

        activity('thesis')
            ->performedOn($thesis)
            ->causedBy(request()->user())
            ->log("Menolak saran tugas '{$title}' pada skripsi '{$thesis->title}'.");
    }

    /**
     * At least one draft/submitted chapter or one supervision note must exist
     * to ground suggestions.
     */
    private function hasEligibleSource(Thesis $thesis): bool
    {
        $hasDraftChapter = $thesis->chapters()
            ->whereIn('status', ['draft', 'submitted'])
            ->exists();

        $hasNote = $thesis->chapters()
            ->whereHas('supervisionNote')
            ->exists();

        return $hasDraftChapter || $hasNote;
    }
}