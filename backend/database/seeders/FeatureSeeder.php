<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Feature;

class FeatureSeeder extends Seeder
{
    public function run()
    {
        $features = [
            ['name' => 'Basic Dashboard', 'description' => 'Access to basic dashboard with essential metrics', 'category' => 'basic', 'is_premium' => false, 'status' => true],
            ['name' => 'Email Support', 'description' => 'Email customer support', 'category' => 'basic', 'is_premium' => false, 'status' => true],
            ['name' => 'Advanced Analytics', 'description' => 'Detailed analytics and reporting', 'category' => 'analytics', 'is_premium' => true, 'status' => true],
            ['name' => 'Priority Support', 'description' => '24/7 priority customer support', 'category' => 'basic', 'is_premium' => true, 'status' => true],
            ['name' => 'Custom Reports', 'description' => 'Generate custom reports and exports', 'category' => 'analytics', 'is_premium' => true, 'status' => true],
            ['name' => 'API Access', 'description' => 'Full API access for integrations', 'category' => 'advanced', 'is_premium' => true, 'status' => true],
        ];

        foreach ($features as $feature) {
            Feature::create($feature);
        }
    }
}