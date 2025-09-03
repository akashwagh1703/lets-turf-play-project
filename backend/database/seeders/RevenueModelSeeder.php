<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\RevenueModel;

class RevenueModelSeeder extends Seeder
{
    public function run()
    {
        $models = [
            [
                'name' => 'Free Plan',
                'description' => 'Basic features for getting started',
                'type' => 'platform_only',
                'monthly_fee' => 0,
                'yearly_fee' => 0,
                'commission_percentage' => 0,
                'features' => 'Basic dashboard,1 turf management,Limited bookings',
                'max_turfs' => 1,
                'max_staff' => 0,
                'is_popular' => false,
                'sort_order' => 1,
                'status' => true
            ],
            [
                'name' => 'Platform Only',
                'description' => 'Full platform access with monthly fee',
                'type' => 'platform_only',
                'monthly_fee' => 999,
                'yearly_fee' => 9999,
                'commission_percentage' => 0,
                'features' => 'Full dashboard,Up to 10 turfs,Up to 20 staff,Advanced analytics',
                'max_turfs' => 10,
                'max_staff' => 20,
                'is_popular' => true,
                'sort_order' => 2,
                'status' => true
            ],
            [
                'name' => 'Platform+Commission',
                'description' => 'Platform access plus commission on bookings',
                'type' => 'platform_plus_commission',
                'monthly_fee' => 499,
                'yearly_fee' => 4999,
                'commission_percentage' => 5,
                'features' => 'Full dashboard,Unlimited turfs,Unlimited staff,Premium support',
                'max_turfs' => -1,
                'max_staff' => -1,
                'is_popular' => false,
                'sort_order' => 3,
                'status' => true
            ],
            [
                'name' => 'Commission Only',
                'description' => 'Pay only commission on successful bookings',
                'type' => 'commission_only',
                'monthly_fee' => 0,
                'yearly_fee' => 0,
                'commission_percentage' => 10,
                'features' => 'Basic dashboard,Up to 5 turfs,Up to 10 staff,Standard support',
                'max_turfs' => 5,
                'max_staff' => 10,
                'is_popular' => false,
                'sort_order' => 4,
                'status' => true
            ]
        ];

        foreach ($models as $model) {
            RevenueModel::updateOrCreate(
                ['name' => $model['name']],
                $model
            );
        }
    }
}