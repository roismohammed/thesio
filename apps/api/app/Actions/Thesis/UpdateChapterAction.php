<?php

namespace App\Actions\Thesis;

use App\Models\Chapter;

class UpdateChapterAction
{
    /**
     * Update a chapter's title/position/status.
     *
     * @param  array{title?: string, position?: int|null, status?: string}  $data
     */
    public function execute(Chapter $chapter, array $data): Chapter
    {
        $chapter->fill([
            'title' => $data['title'] ?? $chapter->title,
            'status' => $data['status'] ?? $chapter->status,
        ]);

        if (array_key_exists('position', $data)) {
            $chapter->position = $data['position'];
        }

        $chapter->save();

        return $chapter;
    }
}
