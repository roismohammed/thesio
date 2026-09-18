<?php

use App\Http\Controllers\Admin\AdminController;
use App\Http\Controllers\Admin\PermissionController;
use App\Http\Controllers\Admin\PlanController;
use App\Http\Controllers\Admin\RoleController;
use App\Http\Controllers\Admin\ThesisOverviewController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\Admin\UserMonitoringController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Admin Routes
|--------------------------------------------------------------------------
|
| Super-admin-only management routes. Loaded via `then` callback in
| bootstrap/app.php — wrapped in `api` middleware group + `api/admin`
| prefix manually (not covered by the automatic `withRouting(api:)`).
| Protected server-side by the `role:super-admin` middleware (authoritative),
| enforced again client-side in the SPA.
|
*/

Route::middleware(['web', 'auth', 'role:super admin'])->prefix('api/admin')->group(function (): void {
    Route::get('/', [AdminController::class, 'index']);

    Route::post('users/{user}/suspend', [UserController::class, 'suspend']);
    Route::post('users/{user}/unsuspend', [UserController::class, 'unsuspend']);
    Route::apiResource('users', UserController::class);
    Route::apiResource('roles', RoleController::class);
    Route::apiResource('permissions', PermissionController::class)->except(['show', 'update']);
    Route::apiResource('plans', PlanController::class);
    Route::get('monitoring/users', [UserMonitoringController::class, 'index']);
    Route::get('monitoring/users/{user}', [UserMonitoringController::class, 'show']);

    Route::get('theses', [ThesisOverviewController::class, 'index']);
    Route::get('theses/{thesis}', [ThesisOverviewController::class, 'show']);
});
