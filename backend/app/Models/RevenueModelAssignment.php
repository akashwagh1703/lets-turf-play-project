<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RevenueModelAssignment extends Model
{
    use HasFactory;

    protected $fillable = [
        'owner_id',
        'revenue_model_id',
        'start_date',
        'end_date',
        'is_free_assignment',
        'notes',
        'status'
    ];

    protected $casts = [
        'is_free_assignment' => 'boolean',
        'start_date' => 'date',
        'end_date' => 'date'
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