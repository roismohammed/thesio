<?php

namespace App\Actions;

use App\Models\User;

class UpdateProfileAction
{
    /**
     * Update a user's profile name/email.
     *
     * @param  array{name: string, email: string}  $data
     */
    public function execute(User $user, array $data): User
    {
        $user->fill([
            'name' => $data['name'],
            'email' => $data['email'],
        ])->save();

        activity('auth')
            ->performedOn($user)
            ->causedBy($user)
            ->log("Memperbarui profil pengguna {$user->name} ({$user->email}).");

        return $user;
    }
}
