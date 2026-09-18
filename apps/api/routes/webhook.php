<?php

use App\Http\Controllers\Webhook\MidtransCallbackController;
use Illuminate\Support\Facades\Route;

Route::post('/api/midtrans/callback', [MidtransCallbackController::class, 'handleCallback']);
