<?php

require_once 'vendor/autoload.php';

use App\Models\User;
use Illuminate\Database\Capsule\Manager as Capsule;

$capsule = new Capsule;

$capsule->addConnection([
    'driver' => 'mysql',
    'host' => 'localhost',
    'database' => 'lets_turf_play',
    'username' => 'root',
    'password' => '',
    'charset' => 'utf8',
    'collation' => 'utf8_unicode_ci',
    'prefix' => '',
]);

$capsule->setAsGlobal();
$capsule->bootEloquent();

try {
    echo "Testing show endpoint logic:\n\n";
    
    // Simulate what the controller does
    $owner = Capsule::table('users')
        ->where('role', 'turf_owner')
        ->where('id', 4)
        ->first();
    
    if ($owner) {
        echo "User found: {$owner->name}\n";
        
        // Get subscriptions
        $subscriptions = Capsule::table('subscriptions')
            ->where('owner_id', $owner->id)
            ->get();
            
        echo "Subscriptions count: " . $subscriptions->count() . "\n";
        
        if ($subscriptions->count() > 0) {
            foreach ($subscriptions as $sub) {
                echo "Subscription ID: {$sub->id}, Revenue Model ID: {$sub->revenue_model_id}\n";
                
                // Get revenue model
                $revenueModel = Capsule::table('revenue_models')
                    ->where('id', $sub->revenue_model_id)
                    ->first();
                    
                if ($revenueModel) {
                    echo "Revenue Model: {$revenueModel->name}\n";
                    echo "Price: " . ($revenueModel->price ?? 'NULL') . "\n";
                    echo "Commission Rate: " . ($revenueModel->commission_rate ?? 'NULL') . "\n";
                    echo "Billing Cycle: " . ($revenueModel->billing_cycle ?? 'NULL') . "\n";
                }
            }
        }
        
        // Simulate the full response structure
        $response = [
            'success' => true,
            'message' => 'Success',
            'data' => [
                'id' => $owner->id,
                'name' => $owner->name,
                'email' => $owner->email,
                'phone' => $owner->phone,
                'business_name' => $owner->business_name,
                'business_description' => $owner->business_description,
                'business_logo' => $owner->business_logo,
                'business_address' => $owner->business_address,
                'business_type' => $owner->business_type,
                'gst_number' => $owner->gst_number,
                'pan_number' => $owner->pan_number,
                'bank_account' => $owner->bank_account,
                'bank_ifsc' => $owner->bank_ifsc,
                'status' => $owner->status,
                'created_at' => $owner->created_at,
                'subscriptions' => $subscriptions->toArray()
            ]
        ];
        
        echo "\nSimulated API response:\n";
        echo json_encode($response, JSON_PRETTY_PRINT) . "\n";
        
    } else {
        echo "User not found\n";
    }
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}