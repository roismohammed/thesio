<?php

namespace App\Support;

use App\Enums\SubscriptionStatusEnum;
use App\Models\Subscription;
use App\Models\User;
use Carbon\Carbon;
use Spatie\Permission\Models\Permission;

class PermissionResolver
{
    /**
     * Determine whether the given user has active access to a specific permission key.
     * Super admins automatically have full access.
     */
    public static function hasActiveAccess(User $user, string $permissionKey): bool
    {
        if ($user->hasRole('super admin')) {
            return true;
        }

        return in_array($permissionKey, static::getActivePermissions($user), true);
    }

    /**
     * Get list of active permissions for the given user.
     * Includes Spatie direct permissions and dynamic permissions from active subscriptions.
     * Super admins receive all system permissions.
     *
     * @return list<string>
     */
    public static function getActivePermissions(User $user): array
    {
        if ($user->hasRole('super admin')) {
            return Permission::pluck('name')->toArray();
        }

        $now = Carbon::now();

        $activeSubscriptions = Subscription::query()
            ->with(['plan.permissions'])
            ->where('user_id', $user->id)
            ->where('status', SubscriptionStatusEnum::ACTIVE->value)
            ->where('starts_at', '<=', $now)
            ->where('ends_at', '>=', $now)
            ->get();

        $subPermissions = $activeSubscriptions
            ->pluck('plan')
            ->filter()
            ->flatMap(fn ($plan) => $plan->permissions->pluck('name'));

        $directPermissions = $user->getAllPermissions()->pluck('name');

        return $subPermissions
            ->merge($directPermissions)
            ->unique()
            ->values()
            ->toArray();
    }
}
