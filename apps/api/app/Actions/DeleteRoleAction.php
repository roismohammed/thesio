<?php

namespace App\Actions;

use RuntimeException;
use Spatie\Permission\Models\Role;

class DeleteRoleAction
{
    /**
     * Delete a role.
     *
     * @throws RuntimeException when the role is still assigned to any user.
     */
    public function execute(Role $role): void
    {
        if ($role->users()->exists()) {
            throw new RuntimeException("Peran '{$role->name}' masih digunakan oleh pengguna dan tidak dapat dihapus.");
        }

        activity('rbac')
            ->performedOn($role)
            ->causedBy(request()->user())
            ->log("Menghapus peran '{$role->name}'.");

        $role->delete();
    }
}
