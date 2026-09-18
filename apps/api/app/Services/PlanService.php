<?php

namespace App\Services;

use App\Actions\Plan\CreatePlanAction;
use App\Actions\Plan\DeletePlanAction;
use App\Actions\Plan\UpdatePlanAction;
use App\Models\Plan;
use Illuminate\Database\Eloquent\Collection;

class PlanService
{
    public function __construct(
        private readonly CreatePlanAction $createPlanAction,
        private readonly UpdatePlanAction $updatePlanAction,
        private readonly DeletePlanAction $deletePlanAction,
    ) {}

    public function listPlans(): Collection
    {
        return Plan::with('permissions')->orderBy('price')->get();
    }

    public function create(array $data): Plan
    {
        return $this->createPlanAction->execute($data);
    }

    public function update(Plan $plan, array $data): Plan
    {
        return $this->updatePlanAction->execute($plan, $data);
    }

    public function delete(Plan $plan): void
    {
        $this->deletePlanAction->execute($plan);
    }
}
