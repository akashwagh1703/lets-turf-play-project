<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Tymon\JWTAuth\Contracts\JWTSubject;

class User extends Authenticatable implements JWTSubject
{
    use HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'phone',
        'status',
        'revenue_model_id',
        'billing_cycle',
        'subscription_start_date',
        'subscription_end_date',
        'subscription_active',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
        'status' => 'boolean',
        'subscription_active' => 'boolean',
        'subscription_start_date' => 'date',
        'subscription_end_date' => 'date',
    ];

    public function getJWTIdentifier()
    {
        return $this->getKey();
    }

    public function getJWTCustomClaims()
    {
        return [];
    }

    public function turfs()
    {
        return $this->hasMany(Turf::class, 'owner_id');
    }

    public function staff()
    {
        return $this->hasMany(Staff::class, 'owner_id');
    }

    public function subscriptions()
    {
        return $this->hasMany(Subscription::class, 'owner_id');
    }

    public function revenueModel()
    {
        return $this->belongsTo(RevenueModel::class);
    }
}