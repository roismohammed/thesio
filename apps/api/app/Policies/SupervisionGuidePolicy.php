<?php

namespace App\Policies;

use App\Models\SupervisionGuide;
use App\Models\User;

class SupervisionGuidePolicy
{
    /**
     * Only the owning student (via the guide's thesis) may view a guide.
     */
    public function view(User $user, SupervisionGuide $guide): bool
    {
        return $user->is($guide->thesis->user);
    }

    /**
     * Only the owning student may update a guide's points.
     */
    public function update(User $user, SupervisionGuide $guide): bool
    {
        return $user->is($guide->thesis->user);
    }
}
