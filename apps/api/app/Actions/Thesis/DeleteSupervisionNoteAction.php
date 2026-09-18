<?php

namespace App\Actions\Thesis;

use App\Models\SupervisionNote;

class DeleteSupervisionNoteAction
{
    /**
     * Delete a chapter's supervision note.
     */
    public function execute(SupervisionNote $note): void
    {
        $note->delete();
    }
}
