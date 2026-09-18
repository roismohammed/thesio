<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class SuperAdminSeeder extends Seeder
{
    /**
     * Create the initial super-admin account from environment variables.
     */
    public function run(): void
    {
        $email = env('SUPER_ADMIN_EMAIL');

        if (! $email) {
            return;
        }

        $user = User::firstOrCreate(
            ['email' => $email],
            [
                'name' => env('SUPER_ADMIN_NAME', 'Super Admin'),
                'password' => Hash::make(env('SUPER_ADMIN_PASSWORD', 'password')),
            ],
        );

        $user->assignRole('super admin');
    }
}
