<?php

namespace App\Services\Thesis;

use App\Actions\Thesis\CreateThesisAction;
use App\Actions\Thesis\DeleteThesisAction;
use App\Actions\Thesis\UpdateThesisAction;
use App\Models\Thesis;
use Illuminate\Support\Collection;

class ThesisService
{
    public function __construct(
        private readonly CreateThesisAction $createThesisAction,
        private readonly UpdateThesisAction $updateThesisAction,
        private readonly DeleteThesisAction $deleteThesisAction,
    ) {}

    /**
     * List the authenticated student's theses.
     *
     * @return Collection<int, Thesis>
     */
    public function list(int $userId): Collection
    {
        return Thesis::where('user_id', $userId)
            ->withCount('chapters')
            ->orderByDesc('updated_at')
            ->get();
    }

    /**
     * Show a thesis with its chapters.
     */
    public function show(Thesis $thesis): Thesis
    {
        return $thesis->load(['chapters.currentVersion']);
    }

    /**
     * @param  array{title: string}  $data
     */
    public function create(int $userId, array $data): Thesis
    {
        $thesis = $this->createThesisAction->execute($userId, $data);

        activity('thesis')
            ->performedOn($thesis)
            ->causedBy(request()->user())
            ->log("Membuat skripsi '{$thesis->title}'.");

        return $thesis;
    }

    /**
     * @param  array{title?: string, status?: string}  $data
     */
    public function update(Thesis $thesis, array $data): Thesis
    {
        $oldTitle = $thesis->title;
        $oldDeadline = $thesis->defense_deadline_at;
        $thesis = $this->updateThesisAction->execute($thesis, $data);

        activity('thesis')
            ->performedOn($thesis)
            ->causedBy(request()->user())
            ->log("Memperbarui skripsi '{$oldTitle}' menjadi '{$thesis->title}'.");

        if (array_key_exists('defense_deadline_at', $data)
            && ! $thesis->defense_deadline_at?->equalTo($oldDeadline)
            && $thesis->defense_deadline_at !== null) {
            activity('thesis')
                ->performedOn($thesis)
                ->causedBy(request()->user())
                ->log("Menetapkan deadline sidang skripsi '{$thesis->title}' pada {$thesis->defense_deadline_at->toDateString()}.");
        }

        return $thesis;
    }

    public function delete(Thesis $thesis): void
    {
        activity('thesis')
            ->performedOn($thesis)
            ->causedBy(request()->user())
            ->log("Menghapus skripsi '{$thesis->title}'.");

        $this->deleteThesisAction->execute($thesis);
    }
}
