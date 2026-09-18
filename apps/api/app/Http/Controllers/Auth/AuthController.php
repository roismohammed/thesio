<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Services\AuthService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AuthController extends Controller
{
    public function __construct(
        private readonly AuthService $authService,
    ) {}

    /**
     * Sign the user in.
     */
    public function login(LoginRequest $request): JsonResponse
    {
        $validated = $request->validated();

        $result = $this->authService->login($validated['email'], $validated['password']);

        if ($result === null) {
            return response()->json([
                'message' => 'Email atau sandi salah.',
            ], 422);
        }

        if ($result['disabled']) {
            return response()->json([
                'message' => 'Akun ini telah dinonaktifkan. Hubungi administrator.',
            ], 403);
        }

        return response()->json([
            'data' => $result['data'],
        ]);
    }

    /**
     * Sign the user out.
     */
    public function logout(Request $request): JsonResponse
    {
        $user = $request->user();

        if ($user) {
            $this->authService->logout($user);
        }

        return response()->json(null, 204);
    }

    /**
     * Return the authenticated user.
     */
    public function me(Request $request): JsonResponse
    {
        return response()->json([
            'data' => $this->authService->me($request->user()),
        ]);
    }
}
