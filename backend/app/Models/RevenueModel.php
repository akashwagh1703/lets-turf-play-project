<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RevenueModel extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
        'features',
        'type',
        'price',
        'monthly_price',
        'yearly_price',
        'billing_cycle',
        'turf_limit',
        'staff_limit',
        'booking_limit',
        'commission_rate',
        'status',
        'is_popular',
        'sort_order'
    ];

    protected $casts = [
        'status' => 'boolean',
        'is_popular' => 'boolean',
        'price' => 'decimal:2',
        'monthly_price' => 'decimal:2',
        'yearly_price' => 'decimal:2',
        'commission_rate' => 'decimal:2',
        'sort_order' => 'integer',
        'turf_limit' => 'integer',
        'staff_limit' => 'integer',
        'booking_limit' => 'integer'
    ];

    public function getFormattedTypeAttribute()
    {
        return match($this->type) {
            'platform_only' => 'Platform Only',
            'platform_plus_commission' => 'Platform + Commission',
            'commission_only' => 'Commission Only',
            default => $this->type
        };
    }

    public function getYearlySavingsAttribute()
    {
        if (!$this->monthly_price || !$this->yearly_price) {
            return 0;
        }
        return ($this->monthly_price * 12) - $this->yearly_price;
    }

    public function getSavingsPercentageAttribute()
    {
        if (!$this->monthly_price || !$this->yearly_price) {
            return 0;
        }
        $monthlyCost = $this->monthly_price * 12;
        return round((($monthlyCost - $this->yearly_price) / $monthlyCost) * 100);
    }

    public function users()
    {
        return $this->hasMany(User::class);
    }
}