<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\NewPasswordRequest;
use App\Http\Requests\Auth\PasswordResetLinkRequest;
use App\Services\PasswordResetService;
use Illuminate\Http\JsonResponse;

class PasswordResetController extends Controller
{
    public function __construct(
        private readonly PasswordResetService $passwordResetService,
    ) {}

    /**
     * Request a password reset link. Always responds with a neutral confirmation.
     */
    public function storeLink(PasswordResetLinkRequest $request): JsonResponse
    {
        $this->passwordResetService->sendResetLink($request->validated()['email']);

        return response()->json([
            'message' => 'Jika email terdaftar, tautan pemulihan telah dikirim.',
        ]);
    }

    /**
     * Reset the password with a valid token.
     */
    public function storeReset(NewPasswordRequest $request): JsonResponse
    {
        try {
            $this->passwordResetService->reset($request->validated());

            return response()->json([
                'message' => 'Sandi berhasil diatur ulang.',
            ]);
        } catch (\RuntimeException $e) {
            return response()->json([
                'message' => $e->getMessage(),
            ], 422);
        }
    }
}
