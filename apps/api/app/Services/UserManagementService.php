<?php

namespace App\Services;

use App\Actions\AssignRoleAction;
use App\Actions\CreateUserAction;
use App\Actions\RevokeRoleAction;
use App\Actions\SuspendUserAction;
use App\Actions\UnsuspendUserAction;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Hash;

class UserManagementService
{
    public function __construct(
        private readonly CreateUserAction $createUserAction,
        private readonly AssignRoleAction $assignRoleAction,
        private readonly RevokeRoleAction $revokeRoleAction,
        private readonly SuspendUserAction $suspendUserAction,
        private readonly UnsuspendUserAction $unsuspendUserAction,
    ) {}

    /**
     * List users with optional search / role / disabled filters.
     *
     * @param  array{search?: string, role?: string, disabled?: bool}  $filters
     * @return LengthAwarePaginator<User>
     */
    public function list(array $filters): LengthAwarePaginator
    {
        $query = User::query();

        if (! empty($filters['search'])) {
            $term = $filters['search'];
            $query->where(function (Builder $q) use ($term): void {
                $q->where('name', 'like', "%{$term}%")
                    ->orWhere('email', 'like', "%{$term}%");
            });
        }

        if (! empty($filters['role'])) {
            $query->role($filters['role']);
        }

        if (array_key_exists('disabled', $filters) && $filters['disabled'] !== null) {
            $query->where('is_disabled', (bool) $filters['disabled']);
        }

        return $query->with('roles')->paginate(15);
    }

    /**
     * @param  array{name: string, email: string, password: string, roles?: list<string>}  $data
     */
    public function create(array $data): User
    {
        $user = $this->createUserAction->execute($data);

        foreach ($data['roles'] ?? [] as $roleName) {
            $this->assignRoleAction->execute($user, $roleName);
        }

        activity('rbac')
            ->performedOn($user)
            ->causedBy(request()->user())
            ->log("Membuat pengguna {$user->name} ({$user->email}) dengan peran ".implode(', ', $data['roles'] ?? []).'.');

        return $user;
    }

    /**
     * @param  array{name?: string, email?: string, password?: string, roles?: list<string>}  $data
     */
    public function update(User $user, array $data): User
    {
        $user->fill([
            'name' => $data['name'] ?? $user->name,
            'email' => $data['email'] ?? $user->email,
        ]);

        if (! empty($data['password'])) {
            $user->password = Hash::make($data['password']);
        }

        $user->save();

        if (array_key_exists('roles', $data)) {
            $user->syncRoles($data['roles'] ?? []);
        }

        activity('rbac')
            ->performedOn($user)
            ->causedBy(request()->user())
            ->log("Memperbarui data pengguna {$user->name} ({$user->email}).");

        return $user;
    }

    public function suspend(User $user, string $reason): User
    {
        return $this->suspendUserAction->execute($user, $reason);
    }

    public function unsuspend(User $user): User
    {
        return $this->unsuspendUserAction->execute($user);
    }

    public function delete(User $user): void
    {
        $actor = request()->user();

        if ($actor && $actor->is($user)) {
            throw new \RuntimeException('Anda tidak dapat menghapus akun Anda sendiri.');
        }

        activity('rbac')
            ->performedOn($user)
            ->causedBy($actor)
            ->log("Menghapus pengguna {$user->name} ({$user->email}).");

        $user->delete();
    }
}
