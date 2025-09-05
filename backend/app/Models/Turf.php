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
        'contact_number',
        'email',
        'price_per_hour',
        'opening_time',
        'closing_time',
        'turf_type',
        'surface_type',
        'size',
        'parking_available',
        'changing_rooms',
        'washrooms',
        'lighting',
        'water_facility',
        'first_aid',
        'security',
        'description',
        'rules',
        'facilities',
        'images',
        'videos',
        'documents',
        'hashtags',
    ];

    protected $casts = [
        'status' => 'boolean',
        'price_per_hour' => 'decimal:2',
        'parking_available' => 'boolean',
        'changing_rooms' => 'boolean',
        'washrooms' => 'boolean',
        'lighting' => 'boolean',
        'water_facility' => 'boolean',
        'first_aid' => 'boolean',
        'security' => 'boolean',
        'images' => 'array',
        'videos' => 'array',
        'documents' => 'array',
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