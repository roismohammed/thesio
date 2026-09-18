<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\Admin\StorePermissionRequest;
use App\Services\PermissionManagementService;
use Illuminate\Http\JsonResponse;
use Spatie\Permission\Models\Permission;

class PermissionController extends Controller
{
    public function __construct(
        private readonly PermissionManagementService $permissionManagementService,
    ) {}

    /**
     * List all permissions.
     */
    public function index(): JsonResponse
    {
        return response()->json([
            'data' => $this->permissionManagementService->all()->map(fn (Permission $permission): array => $this->serialize($permission)),
        ]);
    }

    /**
     * Create a permission.
     */
    public function store(StorePermissionRequest $request): JsonResponse
    {
        $permission = $this->permissionManagementService->create($request->validated()['name']);

        return response()->json([
            'data' => $this->serialize($permission),
        ], 201);
    }

    /**
     * Delete a permission.
     */
    public function destroy(Permission $permission): JsonResponse
    {
        $this->permissionManagementService->delete($permission);

        return response()->json(null, 204);
    }

    /**
     * @return array{id: int, name: string, guard_name: string}
     */
    private function serialize(Permission $permission): array
    {
        return [
            'id' => $permission->id,
            'name' => $permission->name,
            'guard_name' => $permission->guard_name,
        ];
    }
}
