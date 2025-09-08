<?php

namespace Database\Factories;

use App\Models\Booking;
use App\Models\Turf;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class BookingFactory extends Factory
{
    protected $model = Booking::class;

    public function definition()
    {
        $timeSlots = [
            '06:00-07:00', '07:00-08:00', '08:00-09:00', '09:00-10:00',
            '10:00-11:00', '11:00-12:00', '12:00-13:00', '13:00-14:00',
            '14:00-15:00', '15:00-16:00', '16:00-17:00', '17:00-18:00',
            '18:00-19:00', '19:00-20:00', '20:00-21:00', '21:00-22:00'
        ];

        return [
            'turf_id' => Turf::factory(),
            'user_id' => User::factory(),
            'booking_type' => $this->faker->randomElement(['online', 'offline']),
            'booking_plan' => $this->faker->randomElement(['single', 'daily', 'weekly', 'monthly']),
            'date' => $this->faker->dateTimeBetween('now', '+1 month'),
            'selected_slots' => [
                [
                    'start_time' => '10:00',
                    'end_time' => '11:00'
                ]
            ],
            'customer_name' => $this->faker->name,
            'customer_phone' => $this->faker->phoneNumber,
            'customer_email' => $this->faker->email,
            'amount' => $this->faker->randomFloat(2, 500, 2000),
            'status' => $this->faker->randomElement(['pending', 'confirmed', 'cancelled']),
            'notes' => $this->faker->optional()->sentence
        ];
    }

    public function confirmed()
    {
        return $this->state(function (array $attributes) {
            return [
                'status' => 'confirmed'
            ];
        });
    }

    public function pending()
    {
        return $this->state(function (array $attributes) {
            return [
                'status' => 'pending'
            ];
        });
    }

    public function cancelled()
    {
        return $this->state(function (array $attributes) {
            return [
                'status' => 'cancelled'
            ];
        });
    }
}