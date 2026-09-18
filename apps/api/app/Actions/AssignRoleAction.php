<?php

namespace App\Actions;

use App\Models\User;
use Spatie\Permission\Models\Role;

class AssignRoleAction
{
    /**
     * Assign a role to a user via spatie and record a narrative log entry.
     */
    public function execute(User $user, string $roleName): void
    {
        $user->assignRole($roleName);

        activity('rbac')
            ->performedOn($user)
            ->causedBy(request()->user())
            ->log("Menambahkan peran '{$roleName}' kepada pengguna {$user->name} (id: {$user->id}).");
    }
}
