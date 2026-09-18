<?php

use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\Auth\PasswordResetController;
use App\Http\Controllers\Auth\ProfileController;
use App\Http\Controllers\Auth\RegisteredUserController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Auth Routes
|--------------------------------------------------------------------------
|
| Guest and authenticated session routes for the SPA. Loaded via the `then`
| callback in bootstrap/app.php. Runs the full `web` middleware group (session
| + cookies) so Sanctum cookie sessions persist, under the `api/` prefix.
|
*/

Route::middleware('web')->prefix('api')->group(function (): void {
    Route::middleware('guest')->group(function (): void {
        Route::post('auth/login', [AuthController::class, 'login']);
        Route::post('auth/register', [RegisteredUserController::class, 'store']);
        Route::post('forgot-password', [PasswordResetController::class, 'storeLink']);
        Route::post('reset-password', [PasswordResetController::class, 'storeReset']);
    });

    Route::middleware('auth')->group(function (): void {
        Route::post('auth/logout', [AuthController::class, 'logout']);
        Route::get('auth/me', [AuthController::class, 'me']);

        Route::get('profile', [ProfileController::class, 'show']);
        Route::patch('profile', [ProfileController::class, 'update']);
        Route::patch('profile/password', [ProfileController::class, 'password']);
    });
});
