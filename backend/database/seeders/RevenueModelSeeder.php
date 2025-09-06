<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\RevenueModel;

class RevenueModelSeeder extends Seeder
{
    public function run()
    {
        RevenueModel::create([
            'name' => 'Basic',
            'description' => 'Perfect for small turf owners getting started',
            'price' => 0,
            'duration_type' => 'monthly',
            'duration_value' => 1,
            'is_free' => true,
            'max_turfs' => 2,
            'max_staff' => 5,
            'max_bookings_per_month' => 50,
            'selected_features' => [1, 2],
            'status' => true
        ]);

        RevenueModel::create([
            'name' => 'Premium',
            'description' => 'Great for growing turf businesses',
            'price' => 999,
            'duration_type' => 'monthly',
            'duration_value' => 1,
            'is_free' => false,
            'max_turfs' => 10,
            'max_staff' => 25,
            'max_bookings_per_month' => 500,
            'selected_features' => [1, 2, 3, 4],
            'status' => true
        ]);

        RevenueModel::create([
            'name' => 'Enterprise',
            'description' => 'For large turf management companies',
            'price' => 2999,
            'duration_type' => 'monthly',
            'duration_value' => 1,
            'is_free' => false,
            'max_turfs' => -1,
            'max_staff' => -1,
            'max_bookings_per_month' => -1,
            'selected_features' => [1, 2, 3, 4, 5, 6],
            'status' => true
        ]);
    }
}