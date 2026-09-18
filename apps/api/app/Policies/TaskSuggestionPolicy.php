<?php

namespace App\Policies;

use App\Models\TaskSuggestion;
use App\Models\User;

class TaskSuggestionPolicy
{
    /**
     * Only the owning student (via the suggestion's thesis) may view a suggestion.
     */
    public function view(User $user, TaskSuggestion $suggestion): bool
    {
        return $user->is($suggestion->thesis->user);
    }

    /**
     * Only the owning student may update (accept/reject) a suggestion.
     */
    public function update(User $user, TaskSuggestion $suggestion): bool
    {
        return $user->is($suggestion->thesis->user);
    }
}