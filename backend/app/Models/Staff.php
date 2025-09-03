<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Staff extends Model
{
    use HasFactory;

    protected $fillable = [
        'owner_id',
        'user_id',
        'staff_name',
        'email',
        'phone',
        'position',
        'salary',
        'shift_timing',
        'status',
    ];

    protected $casts = [
        'status' => 'boolean',
        'salary' => 'decimal:2',
    ];

    public function owner()
    {
        return $this->belongsTo(User::class, 'owner_id');
    }
}