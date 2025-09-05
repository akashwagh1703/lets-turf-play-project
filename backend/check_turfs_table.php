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
    echo "Turfs table structure:\n";
    $columns = Capsule::select("SHOW COLUMNS FROM turfs");
    foreach ($columns as $column) {
        echo "- {$column->Field} ({$column->Type})\n";
    }
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}