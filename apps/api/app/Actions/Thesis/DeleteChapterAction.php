<?php

namespace App\Actions\Thesis;

use App\Models\Chapter;

class DeleteChapterAction
{
    /**
     * Delete a chapter and cascade its versions/references/note/paraphrases.
     */
    public function execute(Chapter $chapter): void
    {
        $chapter->references()->delete();
        $chapter->supervisionNote()?->delete();
        $chapter->paraphrases()->delete();
        $chapter->versions()->delete();
        $chapter->delete();
    }
}
