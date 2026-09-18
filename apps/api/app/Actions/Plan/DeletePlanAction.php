<?php

namespace App\Actions\Plan;

use App\Enums\SubscriptionStatusEnum;
use App\Models\Plan;
use Carbon\Carbon;
use Illuminate\Validation\ValidationException;

class DeletePlanAction
{
    public function execute(Plan $plan): void
    {
        $hasActiveSubscriptions = $plan->subscriptions()
            ->where('status', SubscriptionStatusEnum::ACTIVE->value)
            ->where('ends_at', '>=', Carbon::now())
            ->exists();

        if ($hasActiveSubscriptions) {
            throw ValidationException::withMessages([
                'plan' => 'Paket tidak dapat dihapus karena masih digunakan oleh langganan aktif mahasiswa. Silakan nonaktifkan paket jika tidak ingin ditawarkan lagi.',
            ]);
        }

        $name = $plan->name;
        $plan->delete();

        activity('plans')
            ->withProperties(['name' => $name])
            ->log("Menghapus paket {$name}.");
    }
}
