<?php

namespace App\Services;

use App\Actions\CreateRoleAction;
use App\Actions\DeleteRoleAction;
use App\Actions\UpdateRoleAction;
use Illuminate\Support\Collection;
use Spatie\Permission\Models\Role;

class RoleManagementService
{
    public function __construct(
        private readonly CreateRoleAction $createRoleAction,
        private readonly UpdateRoleAction $updateRoleAction,
        private readonly DeleteRoleAction $deleteRoleAction,
    ) {}

    /**
     * @return Collection<int, Role>
     */
    public function all(): Collection
    {
        return Role::with('permissions')->get();
    }

    public function show(Role $role): Role
    {
        return $role->load('permissions');
    }

    /**
     * @param  array{name: string, permissions?: list<string>}  $data
     */
    public function create(array $data): Role
    {
        return $this->createRoleAction->execute($data['name'], $data['permissions'] ?? []);
    }

    /**
     * @param  array{name?: string, permissions?: list<string>}  $data
     */
    public function update(Role $role, array $data): Role
    {
        return $this->updateRoleAction->execute(
            $role,
            $data['name'] ?? null,
            $data['permissions'] ?? null,
        );
    }

    public function delete(Role $role): void
    {
        $this->deleteRoleAction->execute($role);
    }
}
