<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Create Super Admin
        User::create([
            'name' => 'Super Admin',
            'email' => 'admin@example.com',
            'password' => bcrypt('password'),
            'role' => 'super_admin',
        ]);

        // Create Revenue Models
        $basicPlan = \App\Models\RevenueModel::create([
            'name' => 'Basic Plan',
            'description' => 'Basic revenue sharing model for small turf owners',
            'type' => 'subscription',
            'price' => 500.00,
            'billing_cycle' => 'monthly',
            'commission_rate' => 10.00,
            'turf_limit' => 5,
            'staff_limit' => 10,
            'booking_limit' => 100,
            'features' => json_encode(['Basic Dashboard', 'Booking Management', 'Customer Support']),
        ]);

        $premiumPlan = \App\Models\RevenueModel::create([
            'name' => 'Premium Plan',
            'description' => 'Premium model with advanced features',
            'type' => 'subscription',
            'price' => 1000.00,
            'billing_cycle' => 'monthly',
            'commission_rate' => 8.00,
            'turf_limit' => 20,
            'staff_limit' => 50,
            'booking_limit' => 500,
            'features' => json_encode(['Advanced Analytics', 'Marketing Tools', 'Priority Support', 'Custom Branding']),
        ]);

        // Create Turf Owner
        $owner = User::create([
            'name' => 'Turf Owner',
            'email' => 'owner@example.com',
            'password' => bcrypt('password'),
            'role' => 'turf_owner',
        ]);

        // Create subscription for owner
        \App\Models\Subscription::create([
            'owner_id' => $owner->id,
            'revenue_model_id' => $basicPlan->id,
            'start_date' => now(),
            'end_date' => now()->addYear(),
            'amount_paid' => 6000.00,
            'status' => 'active',
        ]);

        // Create Staff
        User::create([
            'name' => 'Staff Member',
            'email' => 'staff@example.com',
            'password' => bcrypt('password'),
            'role' => 'staff',
        ]);

        // Create sample players
        $players = [
            ['name' => 'John Doe', 'email' => 'john@example.com', 'phone' => '1234567890', 'total_bookings' => 5, 'total_spent' => 2500.00],
            ['name' => 'Jane Smith', 'email' => 'jane@example.com', 'phone' => '0987654321', 'total_bookings' => 3, 'total_spent' => 1800.00],
            ['name' => 'Mike Johnson', 'email' => 'mike@example.com', 'phone' => '5555555555', 'total_bookings' => 8, 'total_spent' => 4200.00],
        ];

        foreach ($players as $playerData) {
            \App\Models\Player::create($playerData);
        }
    }
}
