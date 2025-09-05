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
    echo "Revenue Models table structure:\n";
    $columns = Capsule::select("SHOW COLUMNS FROM revenue_models");
    foreach ($columns as $column) {
        echo "- {$column->Field} ({$column->Type})\n";
    }
    
    echo "\nRevenue Models data:\n";
    $models = Capsule::table('revenue_models')->get();
    
    if ($models->count() > 0) {
        foreach ($models as $model) {
            echo "ID: {$model->id}\n";
            echo "Name: {$model->name}\n";
            echo "Type: {$model->type}\n";
            echo "Monthly Fee: " . ($model->monthly_fee ?? 'NULL') . "\n";
            echo "Yearly Fee: " . ($model->yearly_fee ?? 'NULL') . "\n";
            echo "Commission: " . ($model->commission_percentage ?? 'NULL') . "%\n";
            echo "Status: " . ($model->status ? 'Active' : 'Inactive') . "\n";
            echo "---\n";
        }
    } else {
        echo "No revenue models found\n";
    }
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}