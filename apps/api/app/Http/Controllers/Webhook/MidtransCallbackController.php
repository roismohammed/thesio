<?php

namespace App\Http\Controllers\Webhook;

use App\Actions\Payment\ActivatePaidSubscriptionAction;
use App\Actions\Payment\VerifyPaymentCallbackAction;
use App\Enums\PaymentStatusEnum;
use App\Http\Controllers\Controller;
use App\Models\Payment;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MidtransCallbackController extends Controller
{
    public function __construct(
        private readonly VerifyPaymentCallbackAction $verifyCallbackAction,
        private readonly ActivatePaidSubscriptionAction $activateSubscriptionAction,
    ) {}

    public function handleCallback(Request $request): JsonResponse
    {
        $payload = $request->all();

        $isValid = $this->verifyCallbackAction->execute($payload);

        if (! $isValid) {
            return response()->json(['message' => 'Invalid signature'], 400);
        }

        $orderId = $payload['order_id'] ?? null;
        $transactionStatus = $payload['transaction_status'] ?? null;
        $fraudStatus = $payload['fraud_status'] ?? null;

        if (! $orderId) {
            return response()->json(['message' => 'Missing order_id'], 400);
        }

        // Midtrans successful settlement or accepted capture
        if ($transactionStatus === 'settlement' || ($transactionStatus === 'capture' && $fraudStatus === 'accept')) {
            $payment = $this->activateSubscriptionAction->execute($orderId, $payload);

            if (! $payment) {
                return response()->json(['message' => 'Payment not found'], 404);
            }

            return response()->json(['message' => 'Payment settled and subscription activated']);
        }

        // Cancel / Expire / Deny status
        if (in_array($transactionStatus, ['deny', 'expire', 'cancel'], true)) {
            $payment = Payment::where('merchant_order_id', $orderId)->first();
            if ($payment && $payment->status === PaymentStatusEnum::PENDING) {
                $payment->update([
                    'status' => PaymentStatusEnum::FAILED,
                    'callback_raw' => $payload,
                ]);
            }
        }

        return response()->json(['message' => 'Callback processed', 'status' => $transactionStatus]);
    }
}
