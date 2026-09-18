<?php

namespace App\Actions\Thesis;

use App\Models\GuidancePoint;
use App\Models\SupervisionGuide;

class AddGuidancePointAction
{
    /**
     * Add a custom (student) point to a guide. `origin`, `status`, and
     * `priority` are forced here; editing a point flags the guide as tailored.
     *
     * @param  array{title: string, description?: string|null, chapter_id?: int|null, supervision_note_id?: int|null}  $data
     */
    public function execute(SupervisionGuide $guide, array $data): GuidancePoint
    {
        $point = GuidancePoint::create([
            'supervision_guide_id' => $guide->id,
            'origin' => 'student',
            'title' => $data['title'],
            'description' => $data['description'] ?? null,
            'status' => 'pending',
            'priority' => 999,
            'chapter_id' => $data['chapter_id'] ?? null,
            'supervision_note_id' => $data['supervision_note_id'] ?? null,
        ]);

        $guide->markTailored();

        return $point;
    }
}
