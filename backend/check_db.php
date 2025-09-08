<?php

require_once 'vendor/autoload.php';

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
    // Check table structure
    echo "Checking users table structure:\n";
    $columns = Capsule::select("SHOW COLUMNS FROM users");
    foreach ($columns as $column) {
        echo "- {$column->Field} ({$column->Type})\n";
    }
    
    echo "\nChecking for turf owners:\n";
    $users = Capsule::table('users')->where('role', 'turf_owner')->get();
    
    if ($users->count() > 0) {
        foreach ($users as $user) {
            echo "User ID: {$user->id}\n";
            echo "Name: {$user->name}\n";
            echo "Email: {$user->email}\n";
            echo "Phone: " . ($user->phone ?? 'NULL') . "\n";
            echo "Business Name: " . ($user->business_name ?? 'NULL') . "\n";
            echo "Business Description: " . ($user->business_description ?? 'NULL') . "\n";
            echo "Business Address: " . ($user->business_address ?? 'NULL') . "\n";
            echo "Business Type: " . ($user->business_type ?? 'NULL') . "\n";
            echo "GST Number: " . ($user->gst_number ?? 'NULL') . "\n";
            echo "PAN Number: " . ($user->pan_number ?? 'NULL') . "\n";
            echo "Bank Account: " . ($user->bank_account ?? 'NULL') . "\n";
            echo "Bank IFSC: " . ($user->bank_ifsc ?? 'NULL') . "\n";
            echo "Status: " . ($user->status ? 'Active' : 'Inactive') . "\n";
            echo "---\n";
        }
    } else {
        echo "No turf owners found\n";
    }
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}