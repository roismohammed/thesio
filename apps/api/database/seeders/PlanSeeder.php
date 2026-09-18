<?php

namespace Database\Seeders;

use App\Models\Plan;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;

class PlanSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $starterPlan = Plan::firstOrCreate(
            ['name' => 'Starter'],
            [
                'description' => 'Paket dasar untuk pengerjaan skripsi mandiri.',
                'price' => 25000,
                'is_active' => true,
            ]
        );

        $proPlan = Plan::firstOrCreate(
            ['name' => 'Pro'],
            [
                'description' => 'Paket menengah dengan akses bimbingan dan kanban.',
                'price' => 80000,
                'is_active' => true,
            ]
        );

        $ultimatePlan = Plan::firstOrCreate(
            ['name' => 'Ultimate'],
            [
                'description' => 'Paket lengkap dengan semua fitur skripsi, bimbingan, kanban, dan academic tools.',
                'price' => 120000,
                'is_active' => true,
            ]
        );

        $pThesis = Permission::findOrCreate('access thesis', 'web');
        $pSupervision = Permission::findOrCreate('access supervision', 'web');
        $pKanban = Permission::findOrCreate('access kanban', 'web');
        $pAcademic = Permission::findOrCreate('access academic tools', 'web');

        $starterPlan->permissions()->syncWithoutDetaching([$pThesis->id]);
        $proPlan->permissions()->syncWithoutDetaching([$pThesis->id, $pSupervision->id, $pKanban->id]);
        $ultimatePlan->permissions()->syncWithoutDetaching([$pThesis->id, $pSupervision->id, $pKanban->id, $pAcademic->id]);
    }
}
