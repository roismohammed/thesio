<?php

namespace App\Http\Resources\Thesis;

use App\Models\GuidancePoint;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin GuidancePoint */
class GuidancePointResource extends JsonResource
{
    /**
     * Transform the guidance point resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'origin' => $this->origin,
            'title' => $this->title,
            'description' => $this->description,
            'status' => $this->status,
            'priority' => $this->priority,
            'chapter_id' => $this->chapter_id,
            'supervision_note_id' => $this->supervision_note_id,
        ];
    }
}
