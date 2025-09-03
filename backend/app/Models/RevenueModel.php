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
        'monthly_fee',
        'yearly_fee',
        'commission_percentage',
        'status',
        'is_popular',
        'sort_order',
        'max_turfs',
        'max_staff'
    ];

    protected $casts = [
        'status' => 'boolean',
        'is_popular' => 'boolean',
        'monthly_fee' => 'decimal:2',
        'yearly_fee' => 'decimal:2',
        'commission_percentage' => 'decimal:2',
        'sort_order' => 'integer',
        'max_turfs' => 'integer',
        'max_staff' => 'integer'
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
        if (!$this->monthly_fee || !$this->yearly_fee) {
            return 0;
        }
        return ($this->monthly_fee * 12) - $this->yearly_fee;
    }

    public function getSavingsPercentageAttribute()
    {
        if (!$this->monthly_fee || !$this->yearly_fee) {
            return 0;
        }
        $monthlyCost = $this->monthly_fee * 12;
        return round((($monthlyCost - $this->yearly_fee) / $monthlyCost) * 100);
    }

    public function users()
    {
        return $this->hasMany(User::class);
    }
}