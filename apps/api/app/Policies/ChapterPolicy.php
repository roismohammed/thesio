<?php

namespace App\Policies;

use App\Models\Chapter;
use App\Models\User;

class ChapterPolicy
{
    /**
     * Default to the owning student resolving through the chapter's thesis.
     */
    private function owns(User $user, Chapter $chapter): bool
    {
        return $user->is($chapter->thesis->user);
    }

    public function view(User $user, Chapter $chapter): bool
    {
        return $this->owns($user, $chapter);
    }

    public function update(User $user, Chapter $chapter): bool
    {
        return $this->owns($user, $chapter);
    }

    public function delete(User $user, Chapter $chapter): bool
    {
        return $this->owns($user, $chapter);
    }
}
