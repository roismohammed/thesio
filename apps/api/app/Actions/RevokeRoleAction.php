<?php

namespace App\Actions;

use App\Models\User;
use RuntimeException;

class RevokeRoleAction
{
    /**
     * Remove a role from a user.
     *
     * @throws RuntimeException when the last `super admin` role would be
     *                          removed from the acting super admin's own account.
     */
    public function execute(User $user, string $roleName): void
    {
        $actor = request()->user();

        if ($actor && $actor->is($user) && $roleName === 'super admin') {
            $superAdmins = User::role('super admin')->where('id', '!=', $user->id)->count();
            if ($superAdmins === 0) {
                throw new RuntimeException('Anda tidak dapat menghapus peran super admin dari akun Anda sendiri.');
            }
        }

        $user->removeRole($roleName);

        activity('rbac')
            ->performedOn($user)
            ->causedBy($actor)
            ->log("Menghapus peran '{$roleName}' dari pengguna {$user->name} (id: {$user->id}).");
    }
}
