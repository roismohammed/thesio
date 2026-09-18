<?php

namespace App\Actions\Payment;

use App\Enums\PaymentStatusEnum;
use App\Models\Payment;
use App\Models\Plan;
use App\Models\User;
use Illuminate\Support\Str;

class CreatePaymentTransactionAction
{
    public function execute(User $user, Plan $plan): Payment
    {
        $merchantOrderId = 'TH-'.$user->id.'-'.time().'-'.Str::upper(Str::random(4));

        $payment = Payment::create([
            'user_id' => $user->id,
            'plan_id' => $plan->id,
            'amount' => $plan->price,
            'status' => PaymentStatusEnum::PENDING,
            'merchant_order_id' => $merchantOrderId,
        ]);

        activity('payments')
            ->performedOn($payment)
            ->causedBy($user)
            ->withProperties([
                'merchant_order_id' => $merchantOrderId,
                'plan_name' => $plan->name,
                'amount' => $plan->price,
            ])
            ->log("Membuat transaksi pembayaran {$merchantOrderId} untuk paket {$plan->name} sebesar Rp ".number_format($plan->price, 0, ',', '.').'.');

        return $payment;
    }
}
