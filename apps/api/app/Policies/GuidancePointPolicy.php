<?php

namespace App\Policies;

use App\Models\GuidancePoint;
use App\Models\User;

class GuidancePointPolicy
{
    /**
     * Only the owning student (via the point's guide → thesis) may view.
     */
    public function view(User $user, GuidancePoint $point): bool
    {
        return $user->is($point->supervisionGuide->thesis->user);
    }

    /**
     * Only the owning student may update a point.
     */
    public function update(User $user, GuidancePoint $point): bool
    {
        return $user->is($point->supervisionGuide->thesis->user);
    }
}
