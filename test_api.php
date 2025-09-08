<?php

// Simple test to check API response
$url = 'http://localhost:8000/api/turf-owners/1';
$token = 'your_jwt_token_here'; // Replace with actual token

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Authorization: Bearer ' . $token,
    'Content-Type: application/json',
    'Accept: application/json'
]);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

echo "HTTP Code: " . $httpCode . "\n";
echo "Response: " . $response . "\n";

// Parse JSON response
$data = json_decode($response, true);
if ($data) {
    echo "\nParsed Data:\n";
    print_r($data);
} else {
    echo "\nFailed to parse JSON response\n";
}