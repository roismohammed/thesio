<?php

namespace App\Actions\Payment;

class VerifyPaymentCallbackAction
{
    /**
     * Verify incoming Midtrans callback signature.
     * signature = sha512(order_id + status_code + gross_amount + serverKey)
     */
    public function execute(array $payload): bool
    {
        $orderId = $payload['order_id'] ?? null;
        $statusCode = $payload['status_code'] ?? null;
        $grossAmount = $payload['gross_amount'] ?? null;
        $signatureKey = $payload['signature_key'] ?? null;

        if (! $orderId || ! $statusCode || ! $grossAmount || ! $signatureKey) {
            return false;
        }

        $serverKey = config('midtrans.server_key');

        if (empty($serverKey)) {
            return false;
        }

        $expectedSignature = hash('sha512', $orderId.$statusCode.$grossAmount.$serverKey);

        return hash_equals($expectedSignature, (string) $signatureKey);
    }
}
