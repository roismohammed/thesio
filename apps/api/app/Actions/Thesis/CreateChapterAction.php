<?php

namespace App\Actions\Thesis;

use App\Models\Chapter;

class CreateChapterAction
{
    /**
     * Create a chapter under a thesis.
     *
     * @param  array{title: string, position?: int, status?: string}  $data
     */
    public function execute(int $thesisId, array $data): Chapter
    {
        return Chapter::create([
            'thesis_id' => $thesisId,
            'title' => $data['title'],
            'position' => $data['position'] ?? null,
            'status' => $data['status'] ?? 'draft',
        ]);
    }
}
