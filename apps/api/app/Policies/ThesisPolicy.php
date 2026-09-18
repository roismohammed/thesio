<?php

namespace App\Policies;

use App\Models\Thesis;
use App\Models\User;

class ThesisPolicy
{
    /**
     * Only the owning student may view a thesis.
     */
    public function view(User $user, Thesis $thesis): bool
    {
        return $user->is($thesis->user);
    }

    /**
     * Only the owning student may update a thesis.
     */
    public function update(User $user, Thesis $thesis): bool
    {
        return $user->is($thesis->user);
    }

    /**
     * Only the owning student may delete a thesis.
     */
    public function delete(User $user, Thesis $thesis): bool
    {
        return $user->is($thesis->user);
    }
}
