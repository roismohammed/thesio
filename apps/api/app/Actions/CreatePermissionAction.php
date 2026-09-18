<?php

namespace App\Actions;

use Spatie\Permission\Models\Permission;

class CreatePermissionAction
{
    /**
     * Create a permission.
     */
    public function execute(string $name): Permission
    {
        $permission = Permission::create(['name' => $name, 'guard_name' => 'web']);

        activity('rbac')
            ->performedOn($permission)
            ->causedBy(request()->user())
            ->log("Membuat izin '{$permission->name}'.");

        return $permission;
    }
}
