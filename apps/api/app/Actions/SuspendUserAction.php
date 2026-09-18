<?php

namespace App\Actions;

use App\Models\User;
use Illuminate\Validation\ValidationException;

class SuspendUserAction
{
    /**
     * Suspend a user with a reason.
     *
     * @throws ValidationException when the acting super admin disables their own account.
     */
    public function execute(User $user, string $reason): User
    {
        $actor = request()->user();

        if ($actor && $actor->is($user)) {
            throw ValidationException::withMessages([
                'user' => 'Anda tidak dapat menonaktifkan akun Anda sendiri.',
            ]);
        }

        $user->is_disabled = true;
        $user->disabled_reason = $reason;
        $user->save();

        activity('rbac')
            ->performedOn($user)
            ->causedBy($actor)
            ->log("Menonaktifkan pengguna {$user->name} ({$user->email}) — alasan: {$reason}.");

        return $user;
    }
}
