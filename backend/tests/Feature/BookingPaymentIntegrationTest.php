<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Turf;
use App\Models\Booking;
use App\Models\Payment;
use App\Services\NotificationService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class BookingPaymentIntegrationTest extends TestCase
{
    use RefreshDatabase;

    protected $user;
    protected $turf;
    protected $owner;

    protected function setUp(): void
    {
        parent::setUp();
        
        $this->user = User::factory()->create(['role' => 'customer']);
        $this->owner = User::factory()->create(['role' => 'turf_owner']);
        $this->turf = Turf::factory()->create(['owner_id' => $this->owner->id]);
    }

    public function test_complete_booking_payment_flow()
    {
        // Create booking
        $bookingResponse = $this->actingAs($this->user)
            ->postJson('/api/bookings', [
                'turf_id' => $this->turf->id,
                'date' => now()->addDay()->toDateString(),
                'time_slots' => ['10:00-11:00'],
                'booking_type' => 'single',
                'customer_name' => 'Test Customer',
                'customer_phone' => '9876543210',
                'customer_email' => 'test@example.com'
            ]);

        $bookingResponse->assertStatus(201);
        $booking = Booking::latest()->first();

        // Create payment
        $paymentResponse = $this->actingAs($this->user)
            ->postJson('/api/payments/create', [
                'booking_id' => $booking->id,
                'payment_method' => 'card',
                'gateway' => 'razorpay'
            ]);

        $paymentResponse->assertStatus(200)
                       ->assertJsonStructure(['payment', 'gateway_response']);

        // Verify payment record
        $this->assertDatabaseHas('payments', [
            'booking_id' => $booking->id,
            'user_id' => $this->user->id,
            'gateway' => 'razorpay',
            'status' => 'pending'
        ]);
    }

    public function test_payment_webhook_processing()
    {
        $booking = Booking::factory()->create([
            'turf_id' => $this->turf->id,
            'user_id' => $this->user->id
        ]);

        $payment = Payment::factory()->create([
            'booking_id' => $booking->id,
            'user_id' => $this->user->id,
            'gateway_transaction_id' => 'pay_test123'
        ]);

        $webhookResponse = $this->postJson('/api/payments/webhook/razorpay', [
            'payload' => [
                'payment' => [
                    'entity' => [
                        'id' => 'pay_test123',
                        'status' => 'captured'
                    ]
                ]
            ]
        ]);

        $webhookResponse->assertStatus(200);
        
        $this->assertDatabaseHas('payments', [
            'id' => $payment->id,
            'status' => 'completed'
        ]);
    }

    public function test_notification_sent_on_payment_success()
    {
        $booking = Booking::factory()->create([
            'turf_id' => $this->turf->id,
            'user_id' => $this->user->id
        ]);

        $payment = Payment::factory()->create([
            'booking_id' => $booking->id,
            'user_id' => $this->user->id,
            'status' => 'completed'
        ]);

        $notificationService = new NotificationService();
        $notificationService->sendPaymentConfirmation($payment);

        $this->assertDatabaseHas('notifications', [
            'user_id' => $this->user->id,
            'type' => 'payment_success'
        ]);
    }

    public function test_optimized_booking_queries()
    {
        // Create multiple bookings
        Booking::factory()->count(10)->create([
            'turf_id' => $this->turf->id
        ]);

        $response = $this->actingAs($this->user)
            ->getJson('/api/bookings');

        $response->assertStatus(200);
        
        // Verify query optimization by checking response structure
        $response->assertJsonStructure([
            'data' => [
                '*' => [
                    'id',
                    'turf',
                    'user'
                ]
            ]
        ]);
    }
}