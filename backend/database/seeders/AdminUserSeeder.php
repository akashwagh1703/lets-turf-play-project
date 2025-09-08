<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class AdminUserSeeder extends Seeder
{
    public function run()
    {
        User::create([
            'name' => 'Super Admin',
            'email' => 'admin@example.com',
            'password' => Hash::make('password'),
            'role' => 'super_admin'
        ]);

        User::create([
            'name' => 'Turf Owner',
            'email' => 'owner@example.com',
            'password' => Hash::make('password'),
            'role' => 'turf_owner'
        ]);

        User::create([
            'name' => 'Staff Member',
            'email' => 'staff@example.com',
            'password' => Hash::make('password'),
            'role' => 'staff'
        ]);
    }
}