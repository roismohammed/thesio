<?php

namespace App\Actions\Thesis;

use App\Models\Thesis;

class DeleteThesisAction
{
    /**
     * Delete a thesis and cascade its chapters + children.
     */
    public function execute(Thesis $thesis): void
    {
        foreach ($thesis->chapters as $chapter) {
            $chapter->references()->delete();
            $chapter->supervisionNote()?->delete();
            $chapter->paraphrases()->delete();
            $chapter->versions()->delete();
        }

        $thesis->chapters()->delete();
        $thesis->delete();
    }
}
