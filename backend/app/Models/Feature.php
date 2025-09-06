<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Feature extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
        'category',
        'is_premium',
        'status'
    ];

    protected $casts = [
        'is_premium' => 'boolean',
        'status' => 'boolean'
    ];
}