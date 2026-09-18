<?php

namespace App\Actions;

use Spatie\Permission\Models\Role;

class CreateRoleAction
{
    /**
     * Create a role and optionally attach permissions.
     *
     * @param  list<string>  $permissions
     */
    public function execute(string $name, array $permissions = []): Role
    {
        $role = Role::create(['name' => $name, 'guard_name' => 'web']);

        if ($permissions) {
            $role->syncPermissions($permissions);
        }

        activity('rbac')
            ->performedOn($role)
            ->causedBy(request()->user())
            ->log("Membuat peran '{$role->name}'.");

        return $role;
    }
}
