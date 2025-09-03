<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Player extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'name',
        'email',
        'phone',
        'date_of_birth',
        'gender',
        'address',
        'city',
        'total_bookings',
        'total_spent',
        'last_booking_at',
        'status',
    ];

    protected $casts = [
        'date_of_birth' => 'date',
        'last_booking_at' => 'datetime',
        'total_spent' => 'decimal:2',
        'status' => 'boolean',
    ];

    public function bookings()
    {
        return $this->hasMany(Booking::class);
    }
}