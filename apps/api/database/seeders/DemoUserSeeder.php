<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

// ponytail: kredensial hardcoded untuk dev/local; produksi tetap pakai SuperAdminSeeder (env-based).
class DemoUserSeeder extends Seeder
{
    /**
     * Create a demo super-admin and a regular user account.
     */
    public function run(): void
    {
        if (app()->isProduction()) {
            return;
        }

        $superAdmin = User::firstOrCreate(
            ['email' => 'superadmin@thesio.test'],
            [
                'name' => 'Super Admin',
                'password' => Hash::make('password'),
            ],
        );
        $superAdmin->assignRole('super admin');

        $user = User::firstOrCreate(
            ['email' => 'user@thesio.test'],
            [
                'name' => 'Pengguna Demo',
                'password' => Hash::make('password'),
            ],
        );
        $user->assignRole('user');
    }
}