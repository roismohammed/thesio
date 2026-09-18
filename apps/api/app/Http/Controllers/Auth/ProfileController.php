<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\PasswordChangeRequest;
use App\Http\Requests\Auth\ProfileUpdateRequest;
use App\Services\ProfileService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use RuntimeException;

class ProfileController extends Controller
{
    public function __construct(
        private readonly ProfileService $profileService,
    ) {}

    /**
     * Show the authenticated user's profile.
     */
    public function show(Request $request): JsonResponse
    {
        return response()->json([
            'data' => $this->profileService->show($request->user()),
        ]);
    }

    /**
     * Update the authenticated user's profile.
     */
    public function update(ProfileUpdateRequest $request): JsonResponse
    {
        $user = $this->profileService->update($request->user(), $request->validated());

        return response()->json([
            'data' => $this->profileService->show($user),
        ]);
    }

    /**
     * Change the authenticated user's password.
     */
    public function password(PasswordChangeRequest $request): JsonResponse
    {
        try {
            $this->profileService->changePassword(
                $request->user(),
                $request->validated()['current_password'],
                $request->validated()['password'],
            );

            return response()->json([
                'message' => 'Sandi berhasil diubah.',
            ]);
        } catch (RuntimeException $e) {
            return response()->json([
                'message' => $e->getMessage(),
            ], 422);
        }
    }
}
