<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\Admin\StoreUserRequest;
use App\Http\Requests\Auth\Admin\SuspendUserRequest;
use App\Http\Requests\Auth\Admin\UpdateUserRequest;
use App\Models\User;
use App\Services\UserManagementService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class UserController extends Controller
{
    public function __construct(
        private readonly UserManagementService $userManagementService,
    ) {}

    /**
     * List users with optional filters.
     */
    public function index(Request $request): JsonResponse
    {
        $users = $this->userManagementService->list([
            'search' => $request->query('search'),
            'role' => $request->query('role'),
            'disabled' => $request->boolean('disabled') ? true : ($request->query('disabled') === null ? null : false),
        ]);

        return response()->json([
            'data' => $users->map(fn (User $user): array => $this->serialize($user)),
            'meta' => [
                'current_page' => $users->currentPage(),
                'last_page' => $users->lastPage(),
                'total' => $users->total(),
            ],
        ]);
    }

    /**
     * Create a user.
     */
    public function store(StoreUserRequest $request): JsonResponse
    {
        $user = $this->userManagementService->create($request->validated());

        return response()->json([
            'data' => $this->serialize($user->load('roles')),
        ], 201);
    }

    /**
     * View a single user.
     */
    public function show(User $user): JsonResponse
    {
        return response()->json([
            'data' => $this->serialize($user->load('roles')),
        ]);
    }

    /**
     * Update a user.
     */
    public function update(UpdateUserRequest $request, User $user): JsonResponse
    {
        $user = $this->userManagementService->update($user, $request->validated());

        return response()->json([
            'data' => $this->serialize($user->load('roles')),
        ]);
    }

    /**
     * Suspend a user with a reason.
     */
    public function suspend(SuspendUserRequest $request, User $user): JsonResponse
    {
        $user = $this->userManagementService->suspend($user, $request->validated('reason'));

        return response()->json([
            'data' => $this->serialize($user->load('roles')),
        ]);
    }

    /**
     * Unsuspend a user.
     */
    public function unsuspend(Request $request, User $user): JsonResponse
    {
        $user = $this->userManagementService->unsuspend($user);

        return response()->json([
            'data' => $this->serialize($user->load('roles')),
        ]);
    }

    /**
     * Delete a user.
     */
    public function destroy(User $user): JsonResponse
    {
        $this->userManagementService->delete($user);

        return response()->json(null, 204);
    }

    /**
     * @return array{id: int, name: string, email: string, is_disabled: bool, disabled_reason: ?string, roles: list<string>}
     */
    private function serialize(User $user): array
    {
        return [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'is_disabled' => (bool) $user->is_disabled,
            'disabled_reason' => $user->disabled_reason,
            'roles' => $user->roles->pluck('name')->toArray(),
        ];
    }
}
