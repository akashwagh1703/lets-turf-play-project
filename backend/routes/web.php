<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return response()->json(['message' => 'Lets Turf Play API', 'version' => '1.0']);
});

Route::fallback(function () {
    return response()->json(['message' => 'API endpoint not found'], 404);
});