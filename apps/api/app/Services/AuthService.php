<?php

namespace App\Services;

use App\Models\User;
use App\Support\PermissionResolver;
use Illuminate\Support\Facades\Auth;

class AuthService
{
    /**
     * Sign a user in with the given credentials.
     *
     * @return array{data: array{id: int, name: string, email: string, is_disabled: bool, roles: list<string>, permissions: list<string>}, disabled: bool}|null
     *                                                                                                                                                          Null when credentials are invalid; `disabled: true` when the account is disabled.
     */
    public function login(string $email, string $password): ?array
    {
        $user = User::where('email', $email)->first();

        if (! $user) {
            activity('auth')->log(
                "Percobaan masuk gagal untuk akun {$email}.",
            );

            return null;
        }

        if ($user->is_disabled) {
            activity('auth')->log(
                "Percobaan masuk ditolak untuk akun {$email} (akun dinonaktifkan).",
            );

            return [
                'data' => $this->me($user),
                'disabled' => true,
            ];
        }

        if (! Auth::attempt(['email' => $email, 'password' => $password])) {
            $user->logFailedSignIn();

            return null;
        }

        $user->logSignedIn();

        return [
            'data' => $this->me($user),
            'disabled' => false,
        ];
    }

    /**
     * Sign the current user out.
     */
    public function logout(User $user): void
    {
        $user->logSignedOut();
        Auth::logout();

        request()->session()->invalidate();
        request()->session()->regenerateToken();
    }

    /**
     * Return the authenticated user's session payload.
     *
     * @return array{id: int, name: string, email: string, is_disabled: bool, roles: list<string>, permissions: list<string>}
     */
    public function me(User $user): array
    {
        return [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'is_disabled' => (bool) $user->is_disabled,
            'roles' => $user->getRoleNames()->toArray(),
            'permissions' => PermissionResolver::getActivePermissions($user),
        ];
    }
}
