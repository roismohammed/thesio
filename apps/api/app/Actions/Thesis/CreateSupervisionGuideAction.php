<?php

namespace App\Actions\Thesis;

use App\Models\GuidancePoint;
use App\Models\SupervisionGuide;
use App\Models\Thesis;
use App\Services\Thesis\GuidanceLlmClient;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class CreateSupervisionGuideAction
{
    public function __construct(
        private readonly GuidanceLlmClient $guidanceLlmClient,
    ) {}

    /**
     * Generate a new current agenda for a thesis: archive the prior current
     * guide, call the LLM, and persist the guide + points in one transaction.
     * The thesis must already have its chapters + supervision notes loaded.
     *
     * @param  Collection<int, GuidancePoint>  $previousOpenPoints
     */
    public function execute(Thesis $thesis, string $origin, Collection $previousOpenPoints): SupervisionGuide
    {
        $points = $this->guidanceLlmClient->generate($thesis, $previousOpenPoints);

        return DB::transaction(function () use ($thesis, $origin, $points): SupervisionGuide {
            SupervisionGuide::where('thesis_id', $thesis->id)
                ->where('status', 'current')
                ->update(['status' => 'archived']);

            $guide = SupervisionGuide::create([
                'thesis_id' => $thesis->id,
                'origin' => $origin,
                'status' => 'current',
                'is_tailored' => false,
                'generated_at' => now(),
            ]);

            foreach ($points as $point) {
                GuidancePoint::create([
                    'supervision_guide_id' => $guide->id,
                    'origin' => 'system',
                    'title' => $point['title'],
                    'description' => $point['description'],
                    'status' => 'pending',
                    'priority' => $point['priority'],
                    'chapter_id' => $point['chapter_id'],
                    'supervision_note_id' => $point['supervision_note_id'],
                ]);
            }

            return $guide;
        });
    }
}
