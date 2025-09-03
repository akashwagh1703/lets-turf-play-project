<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class SimpleRevenueModelSeeder extends Seeder
{
    public function run()
    {
        DB::table('revenue_models')->insert([
            [
                'name' => 'Platform Only - Basic',
                'description' => 'Monthly or yearly platform usage fee only. No commission on bookings.',
                'features' => 'Full platform access, Customer support, Basic analytics',
                'type' => 'platform_only',
                'monthly_fee' => 99.00,
                'yearly_fee' => 999.00,
                'commission_percentage' => 0.00,
                'status' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Platform Plus Commission',
                'description' => 'Reduced platform fee plus commission on every booking. Best value for active turfs.',
                'features' => 'Full platform access, Customer support, Advanced analytics, Marketing tools',
                'type' => 'platform_plus_commission',
                'monthly_fee' => 49.00,
                'yearly_fee' => 499.00,
                'commission_percentage' => 5.00,
                'status' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Commission Only',
                'description' => 'No platform fee. Pay only commission on successful bookings.',
                'features' => 'Basic platform access, Email support, Basic analytics',
                'type' => 'commission_only',
                'monthly_fee' => 0.00,
                'yearly_fee' => 0.00,
                'commission_percentage' => 8.00,
                'status' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }
}