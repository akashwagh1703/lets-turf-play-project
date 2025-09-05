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
    echo "Testing API response structure:\n\n";
    
    // Simulate what the controller does
    $owner = Capsule::table('users')
        ->where('role', 'turf_owner')
        ->where('id', 4) // Test with user ID 4 which has data
        ->first();
    
    if ($owner) {
        echo "Raw database record:\n";
        echo json_encode($owner, JSON_PRETTY_PRINT) . "\n\n";
        
        // Simulate the API response structure
        $response = [
            'success' => true,
            'message' => 'Success',
            'data' => $owner
        ];
        
        echo "Simulated API response:\n";
        echo json_encode($response, JSON_PRETTY_PRINT) . "\n";
    } else {
        echo "User not found\n";
    }
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}