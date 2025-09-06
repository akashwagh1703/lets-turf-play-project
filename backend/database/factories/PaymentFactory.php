<?php

namespace Database\Factories;

use App\Models\Payment;
use App\Models\Booking;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class PaymentFactory extends Factory
{
    protected $model = Payment::class;

    public function definition()
    {
        return [
            'booking_id' => Booking::factory(),
            'user_id' => User::factory(),
            'amount' => $this->faker->randomFloat(2, 100, 5000),
            'currency' => 'INR',
            'payment_method' => $this->faker->randomElement(['card', 'upi', 'netbanking']),
            'gateway' => $this->faker->randomElement(['razorpay', 'stripe', 'payu']),
            'gateway_transaction_id' => 'txn_' . $this->faker->unique()->alphaNum(10),
            'status' => $this->faker->randomElement(['pending', 'completed', 'failed']),
            'gateway_response' => null,
            'processed_at' => $this->faker->optional()->dateTimeBetween('-1 month', 'now')
        ];
    }

    public function completed()
    {
        return $this->state(function (array $attributes) {
            return [
                'status' => 'completed',
                'processed_at' => now()
            ];
        });
    }

    public function pending()
    {
        return $this->state(function (array $attributes) {
            return [
                'status' => 'pending',
                'processed_at' => null
            ];
        });
    }
}