<?php

namespace App\Actions;

use Spatie\Permission\Models\Role;

class UpdateRoleAction
{
    /**
     * Update a role's name and/or sync its permissions.
     *
     * @param  list<string>|null  $permissions
     */
    public function execute(Role $role, ?string $name = null, ?array $permissions = null): Role
    {
        if ($name !== null && $name !== $role->name) {
            $oldName = $role->name;
            $role->update(['name' => $name]);

            activity('rbac')
                ->performedOn($role)
                ->causedBy(request()->user())
                ->log("Mengubah peran '{$oldName}' menjadi '{$name}'.");
        }

        if ($permissions !== null) {
            $role->syncPermissions($permissions);

            activity('rbac')
                ->performedOn($role)
                ->causedBy(request()->user())
                ->log("Memperbarui izin peran '{$role->name}'.");
        }

        return $role;
    }
}
