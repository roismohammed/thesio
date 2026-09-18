<?php

namespace App\Actions\Thesis;

use App\Models\TaskSuggestion;

class RejectTaskSuggestionAction
{
    /**
     * Mark a suggestion rejected. The row stays for signature dedup (D9) so
     * a matching suggestion never reappears on re-generation.
     */
    public function execute(TaskSuggestion $suggestion): void
    {
        $suggestion->status = 'rejected';
        $suggestion->save();
    }
}