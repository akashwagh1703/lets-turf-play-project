<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Turf;
use App\Models\Booking;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class BookingTest extends TestCase
{
    use RefreshDatabase;

    protected $user;
    protected $turf;

    protected function setUp(): void
    {
        parent::setUp();
        
        $this->user = User::factory()->create();
        $owner = User::factory()->create(['role' => 'turf_owner']);
        $this->turf = Turf::factory()->create(['owner_id' => $owner->id]);
    }

    public function test_user_can_create_booking()
    {
        $response = $this->actingAs($this->user)
            ->postJson('/api/bookings', [
                'turf_id' => $this->turf->id,
                'date' => now()->addDay()->toDateString(),
                'time_slots' => ['10:00-11:00'],
                'booking_type' => 'single'
            ]);

        $response->assertStatus(201)
                ->assertJsonStructure(['booking']);
        
        $this->assertDatabaseHas('bookings', [
            'turf_id' => $this->turf->id,
            'user_id' => $this->user->id
        ]);
    }

    public function test_user_cannot_book_past_date()
    {
        $response = $this->actingAs($this->user)
            ->postJson('/api/bookings', [
                'turf_id' => $this->turf->id,
                'date' => now()->subDay()->toDateString(),
                'time_slots' => ['10:00-11:00'],
                'booking_type' => 'single'
            ]);

        $response->assertStatus(422);
    }

    public function test_user_cannot_book_conflicting_slots()
    {
        // Create existing booking
        Booking::factory()->create([
            'turf_id' => $this->turf->id,
            'date' => now()->addDay()->toDateString(),
            'time_slots' => ['10:00-11:00']
        ]);

        $response = $this->actingAs($this->user)
            ->postJson('/api/bookings', [
                'turf_id' => $this->turf->id,
                'date' => now()->addDay()->toDateString(),
                'time_slots' => ['10:00-11:00'],
                'booking_type' => 'single'
            ]);

        $response->assertStatus(422);
    }
}