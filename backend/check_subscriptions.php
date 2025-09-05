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
    echo "Subscriptions table structure:\n";
    $columns = Capsule::select("SHOW COLUMNS FROM subscriptions");
    foreach ($columns as $column) {
        echo "- {$column->Field} ({$column->Type})\n";
    }
    
    echo "\nSubscriptions data:\n";
    $subscriptions = Capsule::table('subscriptions')->get();
    
    if ($subscriptions->count() > 0) {
        foreach ($subscriptions as $sub) {
            echo "ID: {$sub->id}\n";
            echo "Owner ID: {$sub->owner_id}\n";
            echo "Revenue Model ID: {$sub->revenue_model_id}\n";
            echo "Status: {$sub->status}\n";
            echo "Start Date: {$sub->start_date}\n";
            echo "End Date: {$sub->end_date}\n";
            echo "Amount Paid: " . ($sub->amount_paid ?? 'NULL') . "\n";
            echo "---\n";
        }
    } else {
        echo "No subscriptions found\n";
    }
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}