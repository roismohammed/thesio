<?php

namespace App\Actions;

use Spatie\Permission\Models\Role;

class DetachPermissionFromRoleAction
{
    /**
     * Detach a single permission from a role.
     */
    public function execute(Role $role, string $permissionName): void
    {
        $role->revokePermissionTo($permissionName);

        activity('rbac')
            ->performedOn($role)
            ->causedBy(request()->user())
            ->log("Menghapus izin '{$permissionName}' dari peran '{$role->name}'.");
    }
}
