<?php

namespace App\Services;

use App\Actions\ChangePasswordAction;
use App\Actions\UpdateProfileAction;
use App\Models\User;

class ProfileService
{
    public function __construct(
        private readonly UpdateProfileAction $updateProfileAction,
        private readonly ChangePasswordAction $changePasswordAction,
    ) {}

    /**
     * @return array{id: int, name: string, email: string}
     */
    public function show(User $user): array
    {
        return [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
        ];
    }

    /**
     * @param  array{name: string, email: string}  $data
     */
    public function update(User $user, array $data): User
    {
        return $this->updateProfileAction->execute($user, $data);
    }

    public function changePassword(User $user, string $currentPassword, string $newPassword): void
    {
        $this->changePasswordAction->execute($user, $currentPassword, $newPassword);
    }
}
