<?php

namespace App\Services\Thesis;

use App\Actions\Thesis\DeleteSupervisionNoteAction;
use App\Actions\Thesis\UpsertSupervisionNoteAction;
use App\Models\Chapter;
use App\Models\SupervisionNote;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

class SupervisionNoteService
{
    public function __construct(
        private readonly UpsertSupervisionNoteAction $upsertAction,
        private readonly DeleteSupervisionNoteAction $deleteAction,
    ) {}

    /**
     * Show the chapter's note, or null when none exists yet. "No note yet"
     * is a valid initial state (not an error) — matches the chapter show
     * endpoint which returns supervision_note: null.
     */
    public function show(Chapter $chapter): ?SupervisionNote
    {
        return $chapter->supervisionNote;
    }

    public function upsert(Chapter $chapter, string $content): SupervisionNote
    {
        $note = $this->upsertAction->execute($chapter, $content);

        $created = $note->wasRecentlyCreated ? 'Menambahkan' : 'Memperbarui';

        activity('thesis')
            ->performedOn($chapter)
            ->causedBy(request()->user())
            ->log("{$created} notulen bimbingan pada bab '{$chapter->title}'.");

        return $note;
    }

    public function delete(Chapter $chapter): void
    {
        $note = $chapter->supervisionNote;

        if (! $note) {
            throw new NotFoundHttpException;
        }

        activity('thesis')
            ->performedOn($chapter)
            ->causedBy(request()->user())
            ->log("Menghapus notulen bimbingan pada bab '{$chapter->title}'.");

        $this->deleteAction->execute($note);
    }
}
