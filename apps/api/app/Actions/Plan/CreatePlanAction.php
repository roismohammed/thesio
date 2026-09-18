<?php

namespace App\Actions\Plan;

use App\Models\Plan;

class CreatePlanAction
{
    public function execute(array $data): Plan
    {
        $plan = Plan::create([
            'name' => $data['name'],
            'description' => $data['description'] ?? null,
            'price' => $data['price'],
            'is_active' => $data['is_active'] ?? true,
        ]);

        if (isset($data['permission_ids'])) {
            $plan->permissions()->sync($data['permission_ids']);
        }

        $permCount = count($data['permission_ids'] ?? []);

        activity('plans')
            ->performedOn($plan)
            ->withProperties([
                'name' => $plan->name,
                'price' => $plan->price,
                'permission_ids' => $data['permission_ids'] ?? [],
            ])
            ->log("Membuat paket {$plan->name} seharga Rp ".number_format($plan->price, 0, ',', '.')." dengan {$permCount} menu diizinkan.");

        return $plan->load('permissions');
    }
}
