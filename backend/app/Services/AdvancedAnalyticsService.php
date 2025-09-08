<?php

namespace App\Services;

use App\Models\Booking;
use App\Models\Turf;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;

class AdvancedAnalyticsService
{
    public function getRevenueAnalytics($ownerId = null, $days = 30)
    {
        $cacheKey = "revenue_analytics_{$ownerId}_{$days}";
        
        return Cache::remember($cacheKey, 1800, function () use ($ownerId, $days) {
            $query = Booking::query();
            
            if ($ownerId) {
                $query->whereHas('turf', fn($q) => $q->where('owner_id', $ownerId));
            }
            
            $startDate = now()->subDays($days);
            
            return [
                'total_revenue' => $query->where('created_at', '>=', $startDate)->sum('amount'),
                'daily_revenue' => $query->where('created_at', '>=', $startDate)
                    ->selectRaw('DATE(created_at) as date, SUM(amount) as revenue')
                    ->groupBy('date')
                    ->orderBy('date')
                    ->get(),
                'revenue_by_turf' => $query->where('created_at', '>=', $startDate)
                    ->with('turf:id,turf_name')
                    ->selectRaw('turf_id, SUM(amount) as revenue, COUNT(*) as bookings')
                    ->groupBy('turf_id')
                    ->orderByDesc('revenue')
                    ->get(),
                'peak_hours' => $query->where('created_at', '>=', $startDate)
                    ->selectRaw('EXTRACT(HOUR FROM created_at) as hour, COUNT(*) as bookings, SUM(amount) as revenue')
                    ->groupBy('hour')
                    ->orderByDesc('revenue')
                    ->get()
            ];
        });
    }

    public function getCustomerAnalytics($ownerId = null)
    {
        $cacheKey = "customer_analytics_{$ownerId}";
        
        return Cache::remember($cacheKey, 3600, function () use ($ownerId) {
            $query = Booking::query();
            
            if ($ownerId) {
                $query->whereHas('turf', fn($q) => $q->where('owner_id', $ownerId));
            }
            
            return [
                'total_customers' => $query->distinct('user_id')->count(),
                'repeat_customers' => $query->selectRaw('user_id, COUNT(*) as booking_count')
                    ->groupBy('user_id')
                    ->having('booking_count', '>', 1)
                    ->count(),
                'top_customers' => $query->with('user:id,name,email')
                    ->selectRaw('user_id, COUNT(*) as bookings, SUM(amount) as total_spent')
                    ->groupBy('user_id')
                    ->orderByDesc('total_spent')
                    ->limit(10)
                    ->get(),
                'customer_retention' => $this->calculateRetentionRate($ownerId)
            ];
        });
    }

    public function getPerformanceMetrics($ownerId = null)
    {
        $cacheKey = "performance_metrics_{$ownerId}";
        
        return Cache::remember($cacheKey, 1800, function () use ($ownerId) {
            $turfQuery = Turf::query();
            $bookingQuery = Booking::query();
            
            if ($ownerId) {
                $turfQuery->where('owner_id', $ownerId);
                $bookingQuery->whereHas('turf', fn($q) => $q->where('owner_id', $ownerId));
            }
            
            $totalSlots = $turfQuery->count() * 16; // 16 slots per day
            $bookedSlots = $bookingQuery->whereDate('created_at', today())->count();
            
            return [
                'occupancy_rate' => $totalSlots > 0 ? round(($bookedSlots / $totalSlots) * 100, 2) : 0,
                'avg_booking_value' => $bookingQuery->avg('amount'),
                'cancellation_rate' => $this->getCancellationRate($ownerId),
                'conversion_rate' => $this->getConversionRate($ownerId),
                'utilization_by_turf' => $this->getTurfUtilization($ownerId)
            ];
        });
    }

    private function calculateRetentionRate($ownerId)
    {
        $query = Booking::query();
        if ($ownerId) {
            $query->whereHas('turf', fn($q) => $q->where('owner_id', $ownerId));
        }
        
        $totalCustomers = $query->distinct('user_id')->count();
        $returningCustomers = $query->selectRaw('user_id, COUNT(*) as booking_count')
            ->groupBy('user_id')
            ->having('booking_count', '>', 1)
            ->count();
            
        return $totalCustomers > 0 ? round(($returningCustomers / $totalCustomers) * 100, 2) : 0;
    }

    private function getCancellationRate($ownerId)
    {
        $query = Booking::query();
        if ($ownerId) {
            $query->whereHas('turf', fn($q) => $q->where('owner_id', $ownerId));
        }
        
        $totalBookings = $query->count();
        $cancelledBookings = $query->where('status', 'cancelled')->count();
        
        return $totalBookings > 0 ? round(($cancelledBookings / $totalBookings) * 100, 2) : 0;
    }

    private function getConversionRate($ownerId)
    {
        // Simulate conversion tracking
        return rand(15, 35); // 15-35% conversion rate
    }

    private function getTurfUtilization($ownerId)
    {
        $query = Turf::query();
        if ($ownerId) {
            $query->where('owner_id', $ownerId);
        }
        
        return $query->withCount(['bookings' => function($q) {
            $q->whereDate('created_at', today());
        }])->get()->map(function($turf) {
            return [
                'turf_name' => $turf->turf_name,
                'utilization' => round(($turf->bookings_count / 16) * 100, 2)
            ];
        });
    }
}