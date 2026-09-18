<?php

namespace App\Actions\Payment;

use App\Enums\PaymentStatusEnum;
use App\Enums\SubscriptionStatusEnum;
use App\Enums\SubscriptionTypeEnum;
use App\Models\Payment;
use App\Models\Subscription;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class ActivatePaidSubscriptionAction
{
    /**
     * Idempotently activate a paid subscription once payment succeeds.
     */
    public function execute(string $merchantOrderId, array $callbackData = []): ?Payment
    {
        return DB::transaction(function () use ($merchantOrderId, $callbackData) {
            $payment = Payment::where('merchant_order_id', $merchantOrderId)->lockForUpdate()->first();

            if (! $payment) {
                return null;
            }

            // Idempotency: if already paid, return as no-op
            if ($payment->status === PaymentStatusEnum::PAID) {
                return $payment;
            }

            $user = $payment->user;
            $plan = $payment->plan;
            $now = Carbon::now();

            // Expire any active trial subscription when transitioning to paid
            Subscription::where('user_id', $user->id)
                ->where('type', SubscriptionTypeEnum::TRIAL->value)
                ->where('status', SubscriptionStatusEnum::ACTIVE->value)
                ->update(['status' => SubscriptionStatusEnum::EXPIRED->value]);

            // Check if user currently has an active paid subscription to extend (renewal)
            $latestActivePaid = Subscription::where('user_id', $user->id)
                ->where('type', SubscriptionTypeEnum::PAID->value)
                ->where('status', SubscriptionStatusEnum::ACTIVE->value)
                ->where('ends_at', '>=', $now)
                ->orderByDesc('ends_at')
                ->first();

            $startsAt = $now;
            $baseEndsAt = $latestActivePaid ? $latestActivePaid->ends_at : $now;
            $endsAt = $baseEndsAt->copy()->addDays(30);

            // Create new paid subscription
            $subscription = Subscription::create([
                'user_id' => $user->id,
                'plan_id' => $plan->id,
                'type' => SubscriptionTypeEnum::PAID,
                'status' => SubscriptionStatusEnum::ACTIVE,
                'starts_at' => $startsAt,
                'ends_at' => $endsAt,
            ]);

            // Update payment record (Midtrans: payment_type, transaction_id)
            $payment->update([
                'status' => PaymentStatusEnum::PAID,
                'subscription_id' => $subscription->id,
                'reference' => $callbackData['transaction_id'] ?? $callbackData['reference'] ?? null,
                'payment_method' => $callbackData['payment_type'] ?? $callbackData['paymentMethod'] ?? null,
                'callback_raw' => $callbackData,
                'paid_at' => $now,
            ]);

            activity('payments')
                ->performedOn($payment)
                ->causedBy($user)
                ->withProperties([
                    'merchant_order_id' => $merchantOrderId,
                    'subscription_id' => $subscription->id,
                    'amount' => $payment->amount,
                ])
                ->log("Pembayaran {$merchantOrderId} sebesar Rp ".number_format($payment->amount, 0, ',', '.')." berhasil diproses. Langganan aktif hingga {$endsAt->format('d-m-Y')}.");

            return $payment;
        });
    }
}
