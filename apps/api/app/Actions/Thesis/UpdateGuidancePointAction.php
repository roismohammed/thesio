<?php

namespace App\Actions\Thesis;

use App\Models\GuidancePoint;
use App\Models\SupervisionGuide;
use RuntimeException;

class UpdateGuidancePointAction
{
    /**
     * Update a point's status; title/description only for student-owned
     * points. Flips the guide as tailored.
     *
     * @param  array{status?: string, title?: string, description?: string}  $data
     */
    public function execute(SupervisionGuide $guide, GuidancePoint $point, array $data): GuidancePoint
    {
        if (isset($data['status'])) {
            $point->status = $data['status'];
        }

        if (array_key_exists('title', $data) || array_key_exists('description', $data)) {
            if ($point->origin !== 'student') {
                throw new RuntimeException('Poin dari sistem tidak dapat diubah judul atau keterangannya.');
            }

            if (array_key_exists('title', $data)) {
                $point->title = $data['title'];
            }
            if (array_key_exists('description', $data)) {
                $point->description = $data['description'];
            }
        }

        $point->save();

        $guide->markTailored();

        return $point;
    }
}
