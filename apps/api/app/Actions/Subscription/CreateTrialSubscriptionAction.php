<?php

namespace App\Actions\Subscription;

use App\Enums\SubscriptionStatusEnum;
use App\Enums\SubscriptionTypeEnum;
use App\Models\Plan;
use App\Models\Subscription;
use App\Models\User;
use Carbon\Carbon;

class CreateTrialSubscriptionAction
{
    public function execute(User $user): ?Subscription
    {
        // Check if trial already exists for this user (lifetime unique)
        $existingTrial = Subscription::where('user_id', $user->id)
            ->where('type', SubscriptionTypeEnum::TRIAL->value)
            ->first();

        if ($existingTrial) {
            return $existingTrial;
        }

        // Get highest active plan by price
        $highestPlan = Plan::where('is_active', true)
            ->orderByDesc('price')
            ->first();

        if (! $highestPlan) {
            return null;
        }

        $now = Carbon::now();
        $endsAt = $now->copy()->addDays(14);

        $subscription = Subscription::create([
            'user_id' => $user->id,
            'plan_id' => $highestPlan->id,
            'type' => SubscriptionTypeEnum::TRIAL,
            'status' => SubscriptionStatusEnum::ACTIVE,
            'starts_at' => $now,
            'ends_at' => $endsAt,
        ]);

        activity('subscriptions')
            ->performedOn($subscription)
            ->causedBy($user)
            ->withProperties([
                'plan_name' => $highestPlan->name,
                'starts_at' => $now->toIso8601String(),
                'ends_at' => $endsAt->toIso8601String(),
            ])
            ->log("Mengaktifkan trial 14 hari paket {$highestPlan->name} untuk mahasiswa {$user->name}.");

        return $subscription->load('plan');
    }
}
