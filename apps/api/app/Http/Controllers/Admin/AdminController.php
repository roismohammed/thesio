<?php

namespace App\Http\Controllers\Admin;

use App\Actions\Admin\GetAdminDashboardStatsAction;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;

class AdminController extends Controller
{
    /**
     * SaaS analytics dashboard metrics for super admin.
     */
    public function index(GetAdminDashboardStatsAction $action): JsonResponse
    {
        return response()->json([
            'data' => $action->execute(),
        ]);
    }
}
