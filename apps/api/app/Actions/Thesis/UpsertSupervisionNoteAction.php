<?php

namespace App\Actions\Thesis;

use App\Models\Chapter;
use App\Models\SupervisionNote;

class UpsertSupervisionNoteAction
{
    /**
     * Create-or-update the single supervision note for a chapter.
     */
    public function execute(Chapter $chapter, string $content): SupervisionNote
    {
        return SupervisionNote::updateOrCreate(
            ['chapter_id' => $chapter->id],
            ['content' => $content],
        );
    }
}
