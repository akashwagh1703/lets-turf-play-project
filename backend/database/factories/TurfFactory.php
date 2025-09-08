<?php

namespace Database\Factories;

use App\Models\Turf;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class TurfFactory extends Factory
{
    protected $model = Turf::class;

    public function definition()
    {
        return [
            'owner_id' => User::factory(),
            'turf_name' => $this->faker->company . ' Turf',
            'location' => $this->faker->address,
            'capacity' => $this->faker->numberBetween(10, 50),
            'price_per_hour' => $this->faker->randomFloat(2, 500, 2000),
            'status' => $this->faker->boolean(80),
            'sport_type' => $this->faker->randomElement(['football', 'cricket', 'badminton', 'tennis']),
            'pricing_structure' => [
                'weekday' => [
                    'morning' => $this->faker->randomFloat(2, 500, 800),
                    'afternoon' => $this->faker->randomFloat(2, 600, 900),
                    'evening' => $this->faker->randomFloat(2, 800, 1200),
                    'night' => $this->faker->randomFloat(2, 700, 1000)
                ],
                'weekend' => [
                    'morning' => $this->faker->randomFloat(2, 700, 1000),
                    'afternoon' => $this->faker->randomFloat(2, 800, 1200),
                    'evening' => $this->faker->randomFloat(2, 1000, 1500),
                    'night' => $this->faker->randomFloat(2, 900, 1300)
                ]
            ]
        ];
    }

    public function active()
    {
        return $this->state(function (array $attributes) {
            return [
                'status' => true
            ];
        });
    }

    public function inactive()
    {
        return $this->state(function (array $attributes) {
            return [
                'status' => false
            ];
        });
    }
}