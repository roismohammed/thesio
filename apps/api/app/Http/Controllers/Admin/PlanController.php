<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StorePlanRequest;
use App\Http\Requests\Admin\UpdatePlanRequest;
use App\Models\Plan;
use App\Services\PlanService;
use Illuminate\Http\JsonResponse;

class PlanController extends Controller
{
    public function __construct(
        private readonly PlanService $planService,
    ) {}

    public function index(): JsonResponse
    {
        $plans = $this->planService->listPlans();

        return response()->json([
            'data' => $plans,
        ]);
    }

    public function store(StorePlanRequest $request): JsonResponse
    {
        $plan = $this->planService->create($request->validated());

        return response()->json([
            'message' => 'Paket berhasil dibuat.',
            'data' => $plan,
        ], 201);
    }

    public function show(Plan $plan): JsonResponse
    {
        return response()->json([
            'data' => $plan->load('permissions'),
        ]);
    }

    public function update(UpdatePlanRequest $request, Plan $plan): JsonResponse
    {
        $updated = $this->planService->update($plan, $request->validated());

        return response()->json([
            'message' => 'Paket berhasil diperbarui.',
            'data' => $updated,
        ]);
    }

    public function destroy(Plan $plan): JsonResponse
    {
        $this->planService->delete($plan);

        return response()->json([
            'message' => 'Paket berhasil dihapus.',
        ]);
    }
}
