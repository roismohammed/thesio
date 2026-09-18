<?php

namespace App\Http\Controllers;

use App\Actions\Payment\ActivatePaidSubscriptionAction;
use App\Actions\Payment\CreatePaymentTransactionAction;
use App\Enums\PaymentStatusEnum;
use App\Enums\SubscriptionStatusEnum;
use App\Http\Requests\SubscribeToPlanRequest;
use App\Models\Payment;
use App\Models\Plan;
use App\Models\Subscription;
use App\Services\MidtransPaymentService;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SubscriptionController extends Controller
{
    public function __construct(
        private readonly CreatePaymentTransactionAction $createPaymentTransactionAction,
        private readonly MidtransPaymentService $midtransPaymentService,
    ) {}

    public function plans(): JsonResponse
    {
        $plans = Plan::with('permissions')
            ->where('is_active', true)
            ->orderBy('price')
            ->get();

        return response()->json([
            'data' => $plans,
        ]);
    }

    public function mySubscription(Request $request): JsonResponse
    {
        $user = $request->user();
        $now = Carbon::now();

        // Cari subscription aktif terkini
        $currentSubscription = Subscription::with('plan.permissions')
            ->where('user_id', $user->id)
            ->where('status', SubscriptionStatusEnum::ACTIVE->value)
            ->where('starts_at', '<=', $now)
            ->where('ends_at', '>=', $now)
            ->orderByDesc('ends_at')
            ->first();

        // Riwayat pembayaran
        $payments = $user->payments()
            ->with('plan')
            ->orderByDesc('created_at')
            ->get();

        return response()->json([
            'data' => [
                'current' => $currentSubscription,
                'payments' => $payments,
            ],
        ]);
    }

    public function subscribe(SubscribeToPlanRequest $request): JsonResponse
    {
        $user = $request->user();
        $plan = Plan::findOrFail($request->validated('plan_id'));

        $payment = $this->createPaymentTransactionAction->execute($user, $plan);
        $redirectUrl = $this->midtransPaymentService->createTransaction($payment, $plan, $user);

        return response()->json([
            'message' => 'Transaksi pembayaran berhasil dibuat.',
            'data' => [
                'payment' => $payment,
                'redirect_url' => $redirectUrl,
            ],
        ]);
    }

    public function mockPay(Payment $payment, ActivatePaidSubscriptionAction $activatePaidSubscriptionAction, Request $request): JsonResponse
    {
        if (app()->isProduction() || config('midtrans.is_production')) {
            return response()->json(['message' => 'Simulasi pembayaran dinonaktifkan di mode produksi.'], 403);
        }

        if ($payment->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Tidak memiliki akses ke pembayaran ini.'], 403);
        }

        if ($payment->status !== PaymentStatusEnum::PENDING) {
            return response()->json([
                'message' => 'Hanya pembayaran dengan status menunggu yang dapat disimulasikan.',
                'data' => $payment,
            ], 422);
        }

        $payment = $activatePaidSubscriptionAction->execute($payment->merchant_order_id, [
            'transaction_id' => 'MOCK-'.$payment->merchant_order_id,
            'payment_type' => 'mock_midtrans',
            'status_code' => '200',
            'transaction_status' => 'settlement',
        ]);

        if (! $payment) {
            return response()->json(['message' => 'Gagal memproses aktivasi pembayaran.'], 500);
        }

        $payment->load('plan');

        return response()->json([
            'message' => 'Pembayaran simulasi berhasil diselesaikan.',
            'data' => $payment,
        ]);
    }
}
