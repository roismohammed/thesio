<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Auth\Events\PasswordReset;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;

class PasswordResetService
{
    /**
     * Send a reset link for the given email. Always returns a neutral
     * confirmation regardless of whether the account exists.
     */
    public function sendResetLink(string $email): string
    {
        $user = User::where('email', $email)->first();

        if (! $user) {
            return Password::INVALID_USER;
        }

        $status = Password::sendResetLink(['email' => $email]);

        if ($status === Password::RESET_LINK_SENT) {
            activity('auth')
                ->performedOn($user)
                ->log("Mengirim tautan pemulihan sandi untuk akun {$email}.");
        }

        return $status;
    }

    /**
     * Reset the password using the broker, or throw a PasswordResetException.
     *
     * @param  array{token: string, email: string, password: string}  $data
     */
    public function reset(array $data): void
    {
        $status = Password::reset(
            $data,
            function (User $user, string $password): void {
                $user->password = Hash::make($password);
                $user->save();

                event(new PasswordReset($user));

                activity('auth')
                    ->performedOn($user)
                    ->log("Mengganti sandi lewat alur pemulihan untuk akun {$user->email}.");
            },
        );

        if ($status !== Password::PASSWORD_RESET) {
            throw new \RuntimeException('Tautan atur ulang tidak valid atau telah kedaluwarsa.');
        }
    }
}
