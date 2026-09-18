<?php

namespace App\Actions\Thesis;

use App\Models\Thesis;

class CreateThesisAction
{
    /**
     * Create a thesis owned by the given user.
     *
     * @param  array{title: string, status?: string}  $data
     */
    public function execute(int $userId, array $data): Thesis
    {
        return Thesis::create([
            'user_id' => $userId,
            'title' => $data['title'],
            'status' => $data['status'] ?? 'in_progress',
        ]);
    }
}
