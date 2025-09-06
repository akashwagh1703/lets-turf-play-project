<?php

namespace Database\Factories;

use App\Models\Notification;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class NotificationFactory extends Factory
{
    protected $model = Notification::class;

    public function definition()
    {
        return [
            'user_id' => User::factory(),
            'type' => $this->faker->randomElement(['booking_confirmation', 'payment_success', 'booking_reminder']),
            'title' => $this->faker->sentence(3),
            'message' => $this->faker->sentence(10),
            'data' => null,
            'read_at' => null
        ];
    }

    public function read()
    {
        return $this->state(function (array $attributes) {
            return [
                'read_at' => $this->faker->dateTimeBetween('-1 week', 'now')
            ];
        });
    }
}