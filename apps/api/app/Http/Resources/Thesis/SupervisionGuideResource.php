<?php

namespace App\Http\Resources\Thesis;

use App\Models\SupervisionGuide;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin SupervisionGuide */
class SupervisionGuideResource extends JsonResource
{
    /**
     * Transform the supervision guide resource into an array.
     *
     * `is_unread` is provided by the controller via ->additional() where the
     * read-tracking side effect would otherwise shift the value after the
     * fact.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $thesis = $this->thesis;

        $defenseRemainingDays = null;
        if ($thesis->defense_deadline_at !== null) {
            $defenseRemainingDays = (int) now()->startOfDay()->diffInDays($thesis->defense_deadline_at->startOfDay());
        }

        return [
            'id' => $this->id,
            'thesis_id' => $this->thesis_id,
            'origin' => $this->origin,
            'status' => $this->status,
            'is_tailored' => $this->is_tailored,
            'generated_at' => $this->generated_at?->toIso8601String(),
            'defense_deadline_at' => $thesis->defense_deadline_at?->toIso8601String(),
            'defense_remaining_days' => $defenseRemainingDays,
            'is_unread' => $this->additional['is_unread'] ?? false,
            'points' => GuidancePointResource::collection($this->whenLoaded('points')),
        ];
    }
}
