<?php

namespace App\Actions\Thesis;

use App\Models\Chapter;
use App\Models\ChapterVersion;

class RevertChapterVersionAction
{
    /**
     * Point a chapter's current version at an earlier version. Other versions
     * are retained.
     */
    public function execute(Chapter $chapter, ChapterVersion $version): Chapter
    {
        $chapter->current_version_id = $version->id;
        $chapter->save();

        return $chapter;
    }
}
