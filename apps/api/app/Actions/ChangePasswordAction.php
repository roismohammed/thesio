<?php

namespace App\Actions;

use App\Models\User;
use Illuminate\Support\Facades\Hash;
use RuntimeException;

class ChangePasswordAction
{
    /**
     * Change a user's password after verifying the current one.
     *
     * @throws RuntimeException when the current password is incorrect.
     */
    public function execute(User $user, string $currentPassword, string $newPassword): void
    {
        if (! Hash::check($currentPassword, $user->password)) {
            throw new RuntimeException('Sandi saat ini salah.');
        }

        $user->password = Hash::make($newPassword);
        $user->save();

        activity('auth')
            ->performedOn($user)
            ->causedBy($user)
            ->log('Mengganti sandi akun sendiri.');
    }
}
