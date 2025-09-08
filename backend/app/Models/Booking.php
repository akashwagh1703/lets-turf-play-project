<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Booking extends Model
{
    use HasFactory;

    protected $fillable = [
        'turf_id',
        'player_id',
        'user_id',
        'booking_type',
        'booking_plan',
        'date',
        'plan_start_date',
        'plan_end_date',
        'recurring_days',
        'start_time',
        'end_time',
        'selected_slots',
        'customer_name',
        'customer_phone',
        'customer_email',
        'amount',
        'advance_amount',
        'remaining_amount',
        'commission',
        'status',
        'notes'
    ];
    
    protected $attributes = [
        'booking_type' => 'online',
        'booking_plan' => 'single',
        'status' => 'pending',
        'advance_amount' => 0,
        'remaining_amount' => 0
    ];

    protected $casts = [
        'date' => 'date',
        'plan_start_date' => 'date',
        'plan_end_date' => 'date',
        'recurring_days' => 'array',
        'selected_slots' => 'array',
        'amount' => 'decimal:2',
        'advance_amount' => 'decimal:2',
        'remaining_amount' => 'decimal:2',
        'commission' => 'decimal:2',
    ];

    public function turf()
    {
        return $this->belongsTo(Turf::class);
    }

    public function player()
    {
        return $this->belongsTo(Player::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function getTimeSlotAttribute()
    {
        return $this->start_time . ' - ' . $this->end_time;
    }

    public function isRecurring()
    {
        return in_array($this->booking_plan, ['daily', 'weekly', 'monthly']);
    }

    public function getRemainingDaysAttribute()
    {
        if (!$this->plan_end_date) return 0;
        return now()->diffInDays($this->plan_end_date, false);
    }
    
    public function validateSlots()
    {
        if (!$this->selected_slots || !is_array($this->selected_slots)) {
            return false;
        }
        
        foreach ($this->selected_slots as $slot) {
            if (!isset($slot['start_time']) || !isset($slot['end_time'])) {
                return false;
            }
            
            if (strtotime($slot['start_time']) >= strtotime($slot['end_time'])) {
                return false;
            }
        }
        
        return true;
    }
    
    public function getTotalSlotsAttribute()
    {
        return $this->selected_slots ? count($this->selected_slots) : 1;
    }

    public function payments()
    {
        return $this->hasMany(Payment::class);
    }

    public function getPaymentStatusAttribute()
    {
        $payment = $this->payments()->latest()->first();
        return $payment ? $payment->status : 'pending';
    }
}