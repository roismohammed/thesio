<?php

namespace App\Services;

use App\Actions\CreatePermissionAction;
use Illuminate\Support\Collection;
use RuntimeException;
use Spatie\Permission\Models\Permission;

class PermissionManagementService
{
    public function __construct(
        private readonly CreatePermissionAction $createPermissionAction,
    ) {}

    /**
     * @return Collection<int, Permission>
     */
    public function all(): Collection
    {
        return Permission::orderBy('name')->get();
    }

    public function create(string $name): Permission
    {
        return $this->createPermissionAction->execute($name);
    }

    public function delete(Permission $permission): void
    {
        if ($permission->roles()->exists()) {
            throw new RuntimeException("Izin '{$permission->name}' masih terpasang pada peran dan tidak dapat dihapus.");
        }

        activity('rbac')
            ->performedOn($permission)
            ->causedBy(request()->user())
            ->log("Menghapus izin '{$permission->name}'.");

        $permission->delete();
    }
}
