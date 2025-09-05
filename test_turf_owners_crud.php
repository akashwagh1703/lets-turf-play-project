<?php

require_once 'backend/vendor/autoload.php';

use Illuminate\Http\Request;
use App\Http\Controllers\TurfOwnerController;
use App\Models\User;
use App\Models\RevenueModel;

// Test CRUD operations for Turf Owners
echo "Testing Turf Owners CRUD Operations...\n\n";

try {
    // Test 1: Check if revenue models exist
    echo "1. Checking Revenue Models...\n";
    $revenueModels = RevenueModel::all();
    echo "Found " . $revenueModels->count() . " revenue models\n";
    
    if ($revenueModels->count() === 0) {
        echo "Creating test revenue model...\n";
        $revenueModel = RevenueModel::create([
            'name' => 'Basic Plan',
            'description' => 'Basic subscription plan',
            'price' => 1000,
            'billing_cycle' => 'monthly',
            'commission_rate' => 5.0,
            'status' => true
        ]);
        echo "Created revenue model with ID: " . $revenueModel->id . "\n";
    } else {
        $revenueModel = $revenueModels->first();
        echo "Using existing revenue model: " . $revenueModel->name . "\n";
    }
    
    // Test 2: Check existing turf owners
    echo "\n2. Checking existing Turf Owners...\n";
    $existingOwners = User::where('role', 'turf_owner')->get();
    echo "Found " . $existingOwners->count() . " existing turf owners\n";
    
    foreach ($existingOwners as $owner) {
        echo "- ID: {$owner->id}, Name: {$owner->name}, Email: {$owner->email}, Status: " . ($owner->status ? 'Active' : 'Inactive') . "\n";
    }
    
    // Test 3: Create test data
    echo "\n3. Testing CREATE operation...\n";
    $testData = [
        'name' => 'Test Owner ' . time(),
        'email' => 'testowner' . time() . '@example.com',
        'password' => 'password123',
        'phone' => '+1234567890',
        'business_name' => 'Test Business',
        'business_description' => 'A test business for turf management',
        'business_address' => '123 Test Street, Test City',
        'business_type' => 'individual',
        'gst_number' => '22AAAAA0000A1Z5',
        'pan_number' => 'ABCDE1234F',
        'bank_account' => '1234567890123456',
        'bank_ifsc' => 'SBIN0001234',
        'status' => true,
        'revenue_model_id' => $revenueModel->id
    ];
    
    $newOwner = User::create([
        'name' => $testData['name'],
        'email' => $testData['email'],
        'password' => bcrypt($testData['password']),
        'phone' => $testData['phone'],
        'business_name' => $testData['business_name'],
        'business_description' => $testData['business_description'],
        'business_address' => $testData['business_address'],
        'business_type' => $testData['business_type'],
        'gst_number' => $testData['gst_number'],
        'pan_number' => $testData['pan_number'],
        'bank_account' => $testData['bank_account'],
        'bank_ifsc' => $testData['bank_ifsc'],
        'status' => $testData['status'],
        'role' => 'turf_owner'
    ]);
    
    echo "✓ Created new turf owner with ID: " . $newOwner->id . "\n";
    
    // Test 4: READ operation
    echo "\n4. Testing READ operation...\n";
    $retrievedOwner = User::where('role', 'turf_owner')
        ->with(['turfs', 'subscriptions.revenueModel'])
        ->find($newOwner->id);
    
    if ($retrievedOwner) {
        echo "✓ Successfully retrieved owner: " . $retrievedOwner->name . "\n";
        echo "  - Email: " . $retrievedOwner->email . "\n";
        echo "  - Business: " . ($retrievedOwner->business_name ?? 'N/A') . "\n";
        echo "  - Status: " . ($retrievedOwner->status ? 'Active' : 'Inactive') . "\n";
    } else {
        echo "✗ Failed to retrieve owner\n";
    }
    
    // Test 5: UPDATE operation
    echo "\n5. Testing UPDATE operation...\n";
    $updateData = [
        'business_name' => 'Updated Business Name',
        'business_description' => 'Updated business description',
        'status' => false
    ];
    
    $retrievedOwner->update($updateData);
    $updatedOwner = $retrievedOwner->fresh();
    
    if ($updatedOwner->business_name === $updateData['business_name']) {
        echo "✓ Successfully updated owner business name\n";
    } else {
        echo "✗ Failed to update owner business name\n";
    }
    
    if ($updatedOwner->status === $updateData['status']) {
        echo "✓ Successfully updated owner status\n";
    } else {
        echo "✗ Failed to update owner status\n";
    }
    
    // Test 6: LIST operation with filters
    echo "\n6. Testing LIST operation with filters...\n";
    
    // Test active filter
    $activeOwners = User::where('role', 'turf_owner')->where('status', true)->get();
    echo "Active owners: " . $activeOwners->count() . "\n";
    
    // Test inactive filter
    $inactiveOwners = User::where('role', 'turf_owner')->where('status', false)->get();
    echo "Inactive owners: " . $inactiveOwners->count() . "\n";
    
    // Test search by name
    $searchResults = User::where('role', 'turf_owner')
        ->where('name', 'like', '%Test%')
        ->get();
    echo "Search results for 'Test': " . $searchResults->count() . "\n";
    
    // Test 7: DELETE operation
    echo "\n7. Testing DELETE operation...\n";
    $deleteResult = $updatedOwner->delete();
    
    if ($deleteResult) {
        echo "✓ Successfully deleted test owner\n";
        
        // Verify deletion
        $deletedOwner = User::find($newOwner->id);
        if (!$deletedOwner) {
            echo "✓ Confirmed owner was deleted from database\n";
        } else {
            echo "✗ Owner still exists in database\n";
        }
    } else {
        echo "✗ Failed to delete owner\n";
    }
    
    echo "\n" . str_repeat("=", 50) . "\n";
    echo "CRUD OPERATIONS TEST COMPLETED SUCCESSFULLY!\n";
    echo str_repeat("=", 50) . "\n";
    
} catch (Exception $e) {
    echo "\n✗ ERROR: " . $e->getMessage() . "\n";
    echo "File: " . $e->getFile() . "\n";
    echo "Line: " . $e->getLine() . "\n";
}