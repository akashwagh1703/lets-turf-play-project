<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use Carbon\Carbon;
use Database\Seeders\FeatureSeeder;
use Database\Seeders\RevenueModelSeeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Create Super Admin
        User::create([
            'name' => 'Super Admin',
            'email' => 'admin@example.com',
            'password' => Hash::make('password'),
            'role' => 'super_admin',
            'email_verified_at' => Carbon::now(),
        ]);

        // Create Turf Owner
        $turfOwner = User::create([
            'name' => 'Turf Owner',
            'email' => 'owner@example.com',
            'password' => Hash::make('password'),
            'role' => 'turf_owner',
            'email_verified_at' => Carbon::now(),
        ]);

        // Create Staff
        User::create([
            'name' => 'Staff Member',
            'email' => 'staff@example.com',
            'password' => Hash::make('password'),
            'role' => 'staff',
            'email_verified_at' => Carbon::now(),
        ]);

        // Create Sample Staff Users
        $staff1 = User::create([
            'name' => 'John Staff',
            'email' => 'john@example.com',
            'password' => Hash::make('password'),
            'role' => 'staff',
            'email_verified_at' => Carbon::now(),
        ]);

        $staff2 = User::create([
            'name' => 'Jane Staff',
            'email' => 'jane@example.com',
            'password' => Hash::make('password'),
            'role' => 'staff',
            'email_verified_at' => Carbon::now(),
        ]);

        // Create Sample Turfs
        \DB::table('turfs')->insert([
            [
                'owner_id' => $turfOwner->id,
                'turf_name' => 'Elite Sports Arena',
                'location' => 'Mumbai, Maharashtra',
                'capacity' => 22,
                'price_per_hour' => 1500.00,
                'sport_type' => 'Football',
                'status' => true,
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ],
            [
                'owner_id' => $turfOwner->id,
                'turf_name' => 'Champions Ground',
                'location' => 'Delhi, India',
                'capacity' => 18,
                'price_per_hour' => 1200.00,
                'sport_type' => 'Cricket',
                'status' => true,
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ]
        ]);

        // Create Sample Staff
        \DB::table('staff')->insert([
            [
                'owner_id' => $turfOwner->id,
                'staff_name' => 'Raj Kumar',
                'email' => 'raj@example.com',
                'phone' => '9876543210',
                'status' => true,
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ],
            [
                'owner_id' => $turfOwner->id,
                'staff_name' => 'Priya Sharma',
                'email' => 'priya@example.com',
                'phone' => '9876543211',
                'status' => true,
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ]
        ]);

        // Create Sample Bookings
        \DB::table('bookings')->insert([
            [
                'turf_id' => 1,
                'user_id' => $staff1->id,
                'booking_type' => 'online',
                'date' => Carbon::today()->format('Y-m-d'),
                'start_time' => '18:00:00',
                'end_time' => '19:00:00',
                'amount' => 1500.00,
                'status' => 'confirmed',
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ],
            [
                'turf_id' => 2,
                'user_id' => $staff2->id,
                'booking_type' => 'online',
                'date' => Carbon::tomorrow()->format('Y-m-d'),
                'start_time' => '19:00:00',
                'end_time' => '20:00:00',
                'amount' => 1200.00,
                'status' => 'pending',
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ]
        ]);

        // Note: Subscriptions require revenue_model_id which needs to be created first
        
        // Seed features and revenue models
        $this->call(FeatureSeeder::class);
        $this->call(RevenueModelSeeder::class);
    }
}