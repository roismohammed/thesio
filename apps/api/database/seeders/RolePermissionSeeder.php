<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

class RolePermissionSeeder extends Seeder
{
    /**
     * Seed the base roles and permissions.
     */
    public function run(): void
    {
        app()[PermissionRegistrar::class]->forgetCachedPermissions();

        $basePermissions = [
            'manage users',
            'manage roles',
            'manage permissions',
            'access thesis',
            'access supervision',
            'access kanban',
            'access academic tools',
        ];

        $createdPermissions = [];
        foreach ($basePermissions as $permissionName) {
            $createdPermissions[] = Permission::findOrCreate($permissionName, 'web');
        }

        $superAdmin = Role::findOrCreate('super admin', 'web');
        $superAdmin->syncPermissions($createdPermissions);

        Role::findOrCreate('user', 'web');
    }
}
