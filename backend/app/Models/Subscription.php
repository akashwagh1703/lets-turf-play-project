<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Subscription extends Model
{
    use HasFactory;

    protected $fillable = [
        'owner_id',
        'revenue_model_id',
        'start_date',
        'end_date',
        'amount_paid',
        'payment_status',
        'status',
        'features_used'
    ];

    protected $casts = [
        'features_used' => 'array',
        'start_date' => 'date',
        'end_date' => 'date',
        'amount_paid' => 'decimal:2'
    ];

    public function owner()
    {
        return $this->belongsTo(User::class, 'owner_id');
    }

    public function revenueModel()
    {
        return $this->belongsTo(RevenueModel::class);
    }
}