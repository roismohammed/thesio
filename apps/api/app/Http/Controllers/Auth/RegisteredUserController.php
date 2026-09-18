<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\RegisterRequest;
use App\Services\AuthService;
use App\Services\RegistrationService;
use Illuminate\Http\JsonResponse;

class RegisteredUserController extends Controller
{
    public function __construct(
        private readonly RegistrationService $registrationService,
        private readonly AuthService $authService,
    ) {}

    /**
     * Register a new account, sign the user in, and return the session payload.
     */
    public function store(RegisterRequest $request): JsonResponse
    {
        $validated = $request->validated();

        $user = $this->registrationService->register($validated);

        $request->session()->regenerate();
        auth()->login($user);

        return response()->json([
            'data' => $this->authService->me($user),
        ], 201);
    }
}
