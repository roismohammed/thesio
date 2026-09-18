<?php

namespace App\Actions\Thesis;

use App\Models\Thesis;

class UpdateThesisAction
{
    /**
     * Update a thesis title/status.
     *
     * @param  array{title?: string, status?: string}  $data
     */
    public function execute(Thesis $thesis, array $data): Thesis
    {
        $thesis->fill([
            'title' => $data['title'] ?? $thesis->title,
            'status' => $data['status'] ?? $thesis->status,
        ]);

        // defense deadline handled separately so it can be cleared (null is valid)
        if (array_key_exists('defense_deadline_at', $data)) {
            $thesis->defense_deadline_at = $data['defense_deadline_at'];
        }

        $thesis->save();

        return $thesis;
    }
}
