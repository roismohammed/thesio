<?php

namespace App\Services;

use App\Models\Payment;
use App\Models\Plan;
use App\Models\User;
use Illuminate\Support\Facades\Http;
use Illuminate\Validation\ValidationException;

class MidtransPaymentService
{
    /**
     * Request Snap transaction token & redirect URL from Midtrans.
     */
    public function createTransaction(Payment $payment, Plan $plan, User $user): string
    {
        $serverKey = config('midtrans.server_key');
        $snapUrl = config('midtrans.snap_url');
        $finishUrl = config('midtrans.finish_url');

        if (empty($serverKey)) {
            return $finishUrl.'?mock_payment='.$payment->id;
        }

        $payload = [
            'transaction_details' => [
                'order_id' => $payment->merchant_order_id,
                'gross_amount' => (int) $payment->amount,
            ],
            'item_details' => [
                [
                    'id' => (string) $plan->id,
                    'price' => (int) $payment->amount,
                    'quantity' => 1,
                    'name' => "Langganan Paket {$plan->name} Thesio",
                ],
            ],
            'customer_details' => [
                'first_name' => $user->name,
                'email' => $user->email,
            ],
            'callbacks' => [
                'finish' => $finishUrl,
            ],
        ];

        try {
            $response = Http::withBasicAuth($serverKey, '')
                ->timeout(15)
                ->post($snapUrl, $payload);

            if ($response->successful()) {
                $data = $response->json();
                if (isset($data['redirect_url'])) {
                    return $data['redirect_url'];
                }

                throw new \Exception('Respon Midtrans tidak menyertakan redirect_url.');
            }

            throw new \Exception('Koneksi ke Midtrans gagal: '.$response->body());
        } catch (\Throwable $e) {
            throw ValidationException::withMessages([
                'payment' => 'Gagal memulai transaksi Midtrans: '.$e->getMessage(),
            ]);
        }
    }
}
