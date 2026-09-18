<?php

use App\Http\Controllers\SubscriptionController;
use Illuminate\Support\Facades\Route;

Route::get('/api/plans', [SubscriptionController::class, 'plans']);

Route::middleware(['web', 'auth'])->group(function () {
    Route::get('/api/my/subscription', [SubscriptionController::class, 'mySubscription']);
    Route::post('/api/subscriptions', [SubscriptionController::class, 'subscribe']);

    if (! app()->isProduction()) {
        Route::post('/api/payments/{payment}/mock-pay', [SubscriptionController::class, 'mockPay']);
    }
});
