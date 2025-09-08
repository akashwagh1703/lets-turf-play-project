<?php

namespace App\Services;

use App\Models\Turf;
use App\Models\Booking;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;

class QueryOptimizationService
{
    public function getOptimizedTurfs($ownerId = null, $filters = [])
    {
        $cacheKey = 'turfs_' . ($ownerId ?? 'all') . '_' . md5(serialize($filters));
        
        return Cache::remember($cacheKey, 300, function () use ($ownerId, $filters) {
            $query = Turf::with(['owner:id,name,email'])
                ->select('id', 'owner_id', 'turf_name', 'location', 'capacity', 'status', 'price_per_hour')
                ->when($ownerId, fn($q) => $q->where('owner_id', $ownerId))
                ->when($filters['status'] ?? null, fn($q) => $q->where('status', $filters['status']))
                ->when($filters['location'] ?? null, fn($q) => $q->where('location', 'like', '%' . $filters['location'] . '%'));

            return $query->orderBy('created_at', 'desc')->get();
        });
    }

    public function getOptimizedBookings($userId = null, $filters = [])
    {
        $query = Booking::with(['turf:id,turf_name,location', 'user:id,name,email'])
            ->select('id', 'turf_id', 'user_id', 'date', 'time_slots', 'total_amount', 'status', 'created_at')
            ->when($userId, fn($q) => $q->where('user_id', $userId))
            ->when($filters['status'] ?? null, fn($q) => $q->where('status', $filters['status']))
            ->when($filters['date_from'] ?? null, fn($q) => $q->where('date', '>=', $filters['date_from']))
            ->when($filters['date_to'] ?? null, fn($q) => $q->where('date', '<=', $filters['date_to']));

        return $query->orderBy('created_at', 'desc')->paginate(20);
    }

    public function getDashboardStats($userId, $role)
    {
        $cacheKey = "dashboard_stats_{$userId}_{$role}";
        
        return Cache::remember($cacheKey, 600, function () use ($userId, $role) {
            if ($role === 'turf_owner') {
                return [
                    'total_turfs' => Turf::where('owner_id', $userId)->count(),
                    'active_turfs' => Turf::where('owner_id', $userId)->where('status', 'active')->count(),
                    'total_bookings' => Booking::whereHas('turf', fn($q) => $q->where('owner_id', $userId))->count(),
                    'monthly_revenue' => Booking::whereHas('turf', fn($q) => $q->where('owner_id', $userId))
                        ->where('created_at', '>=', now()->startOfMonth())
                        ->sum('total_amount')
                ];
            }

            return [
                'total_bookings' => Booking::where('user_id', $userId)->count(),
                'upcoming_bookings' => Booking::where('user_id', $userId)
                    ->where('date', '>=', now()->toDateString())
                    ->count(),
                'total_spent' => Booking::where('user_id', $userId)->sum('total_amount')
            ];
        });
    }

    public function getAvailableSlots($turfId, $date)
    {
        $cacheKey = "available_slots_{$turfId}_{$date}";
        
        return Cache::remember($cacheKey, 1800, function () use ($turfId, $date) {
            $bookedSlots = Booking::where('turf_id', $turfId)
                ->where('date', $date)
                ->where('status', '!=', 'cancelled')
                ->pluck('time_slots')
                ->flatten()
                ->unique()
                ->values()
                ->toArray();

            $allSlots = [
                '06:00-07:00', '07:00-08:00', '08:00-09:00', '09:00-10:00',
                '10:00-11:00', '11:00-12:00', '12:00-13:00', '13:00-14:00',
                '14:00-15:00', '15:00-16:00', '16:00-17:00', '17:00-18:00',
                '18:00-19:00', '19:00-20:00', '20:00-21:00', '21:00-22:00'
            ];

            return array_diff($allSlots, $bookedSlots);
        });
    }

    public function clearCache($pattern = null)
    {
        if ($pattern) {
            Cache::flush(); // In production, use more specific cache clearing
        } else {
            Cache::flush();
        }
    }
}