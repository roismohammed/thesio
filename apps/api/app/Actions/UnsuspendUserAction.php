<?php

namespace App\Actions;

use App\Models\User;

class UnsuspendUserAction
{
    /**
     * Unsuspend a user and clear disabled reason.
     */
    public function execute(User $user): User
    {
        $actor = request()->user();

        $user->is_disabled = false;
        $user->disabled_reason = null;
        $user->save();

        activity('rbac')
            ->performedOn($user)
            ->causedBy($actor)
            ->log("Mengaktifkan kembali pengguna {$user->name} ({$user->email}) — alasan penonaktifan dihapus.");

        return $user;
    }
}
