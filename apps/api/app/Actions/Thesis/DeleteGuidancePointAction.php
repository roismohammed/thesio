<?php

namespace App\Actions\Thesis;

use App\Models\GuidancePoint;
use App\Models\SupervisionGuide;

class DeleteGuidancePointAction
{
    /**
     * Remove a point and flag the guide as tailored.
     */
    public function execute(SupervisionGuide $guide, GuidancePoint $point): void
    {
        $point->delete();

        $guide->markTailored();
    }
}
