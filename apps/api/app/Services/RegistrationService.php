<?php

namespace App\Services;

use App\Actions\AssignRoleAction;
use App\Actions\CreateUserAction;
use App\Actions\Subscription\CreateTrialSubscriptionAction;
use App\Models\User;

class RegistrationService
{
    public function __construct(
        private readonly CreateUserAction $createUserAction,
        private readonly AssignRoleAction $assignRoleAction,
        private readonly CreateTrialSubscriptionAction $createTrialSubscriptionAction,
    ) {}

    /**
     * Create a new account and assign the default `user` role.
     *
     * @param  array{name: string, email: string, password: string}  $data
     */
    public function register(array $data): User
    {
        $user = $this->createUserAction->execute($data);
        $this->assignRoleAction->execute($user, 'user');

        try {
            $this->createTrialSubscriptionAction->execute($user);
        } catch (\Throwable) {
            // Silently ignore trial creation failure so user registration succeeds
        }

        activity('auth')
            ->performedOn($user)
            ->log("Mendaftarkan pengguna baru {$user->name} ({$user->email}).");

        return $user;
    }
}
