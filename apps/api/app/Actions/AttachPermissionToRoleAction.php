<?php

namespace App\Actions;

use Spatie\Permission\Models\Role;

class AttachPermissionToRoleAction
{
    /**
     * Attach a single permission to a role.
     */
    public function execute(Role $role, string $permissionName): void
    {
        $role->givePermissionTo($permissionName);

        activity('rbac')
            ->performedOn($role)
            ->causedBy(request()->user())
            ->log("Menambahkan izin '{$permissionName}' ke peran '{$role->name}'.");
    }
}
