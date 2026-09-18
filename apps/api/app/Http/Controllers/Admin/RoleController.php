<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\Admin\StoreRoleRequest;
use App\Http\Requests\Auth\Admin\UpdateRoleRequest;
use App\Services\RoleManagementService;
use Illuminate\Http\JsonResponse;
use Spatie\Permission\Models\Role;

class RoleController extends Controller
{
    public function __construct(
        private readonly RoleManagementService $roleManagementService,
    ) {}

    /**
     * List all roles with their permissions.
     */
    public function index(): JsonResponse
    {
        return response()->json([
            'data' => $this->roleManagementService->all()->map(fn (Role $role): array => $this->serialize($role)),
        ]);
    }

    /**
     * Create a role.
     */
    public function store(StoreRoleRequest $request): JsonResponse
    {
        $role = $this->roleManagementService->create($request->validated());

        return response()->json([
            'data' => $this->serialize($role->load('permissions')),
        ], 201);
    }

    /**
     * View a single role.
     */
    public function show(Role $role): JsonResponse
    {
        return response()->json([
            'data' => $this->serialize($this->roleManagementService->show($role)),
        ]);
    }

    /**
     * Update a role.
     */
    public function update(UpdateRoleRequest $request, Role $role): JsonResponse
    {
        $role = $this->roleManagementService->update($role, $request->validated());

        return response()->json([
            'data' => $this->serialize($role->load('permissions')),
        ]);
    }

    /**
     * Delete a role.
     */
    public function destroy(Role $role): JsonResponse
    {
        $this->roleManagementService->delete($role);

        return response()->json(null, 204);
    }

    /**
     * @return array{id: int, name: string, guard_name: string, permissions: list<string>}
     */
    private function serialize(Role $role): array
    {
        return [
            'id' => $role->id,
            'name' => $role->name,
            'guard_name' => $role->guard_name,
            'permissions' => $role->permissions->pluck('name')->toArray(),
        ];
    }
}
