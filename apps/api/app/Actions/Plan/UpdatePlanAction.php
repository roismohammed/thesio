<?php

namespace App\Actions\Plan;

use App\Models\Plan;

class UpdatePlanAction
{
    public function execute(Plan $plan, array $data): Plan
    {
        $oldName = $plan->name;
        $oldPrice = $plan->price;

        $plan->update(array_filter([
            'name' => $data['name'] ?? null,
            'description' => array_key_exists('description', $data) ? $data['description'] : null,
            'price' => $data['price'] ?? null,
            'is_active' => array_key_exists('is_active', $data) ? $data['is_active'] : null,
        ], fn ($val) => $val !== null));

        if (isset($data['permission_ids'])) {
            $plan->permissions()->sync($data['permission_ids']);
        }

        activity('plans')
            ->performedOn($plan)
            ->withProperties([
                'old' => ['name' => $oldName, 'price' => $oldPrice],
                'attributes' => $plan->only(['name', 'description', 'price', 'is_active']),
            ])
            ->log("Memperbarui paket {$plan->name}.");

        return $plan->load('permissions');
    }
}
