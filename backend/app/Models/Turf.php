<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Turf extends Model
{
    use HasFactory;

    protected $fillable = [
        'owner_id',
        'turf_name',
        'location',
        'capacity',
        'status',
        'price_per_hour',
        'sport_type',
        'facilities',
        'description',
    ];

    protected $casts = [
        'status' => 'boolean',
        'price_per_hour' => 'decimal:2',
    ];

    public function owner()
    {
        return $this->belongsTo(User::class, 'owner_id');
    }

    public function bookings()
    {
        return $this->hasMany(Booking::class);
    }
}