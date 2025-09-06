<?php

namespace App\Services;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Redis;

class PerformanceOptimizationService
{
    public function optimizeQueries()
    {
        // Enable query caching
        DB::enableQueryLog();
        
        // Optimize database connections
        config(['database.connections.pgsql.options' => [
            \PDO::ATTR_PERSISTENT => true,
            \PDO::ATTR_EMULATE_PREPARES => false,
        ]]);
    }

    public function cacheFrequentData()
    {
        // Cache dashboard stats for 10 minutes
        Cache::remember('dashboard_stats', 600, function () {
            return [
                'total_turfs' => \App\Models\Turf::count(),
                'total_bookings' => \App\Models\Booking::count(),
                'total_revenue' => \App\Models\Booking::sum('amount'),
                'active_users' => \App\Models\User::where('status', true)->count()
            ];
        });

        // Cache turf availability for 30 minutes
        $turfs = \App\Models\Turf::all();
        foreach ($turfs as $turf) {
            Cache::remember("turf_availability_{$turf->id}_" . date('Y-m-d'), 1800, function () use ($turf) {
                return $this->getAvailableSlots($turf->id, date('Y-m-d'));
            });
        }
    }

    public function optimizeImages()
    {
        // Image optimization settings
        return [
            'quality' => 85,
            'format' => 'webp',
            'sizes' => [
                'thumbnail' => [150, 150],
                'medium' => [300, 300],
                'large' => [800, 600]
            ]
        ];
    }

    public function enableCompression()
    {
        // Enable gzip compression
        if (!ob_get_level()) {
            ob_start('ob_gzhandler');
        }
    }

    public function getPerformanceMetrics()
    {
        return [
            'memory_usage' => memory_get_usage(true),
            'peak_memory' => memory_get_peak_usage(true),
            'execution_time' => microtime(true) - LARAVEL_START,
            'query_count' => count(DB::getQueryLog()),
            'cache_hits' => Cache::get('cache_hits', 0),
            'cache_misses' => Cache::get('cache_misses', 0)
        ];
    }

    private function getAvailableSlots($turfId, $date)
    {
        $bookedSlots = \App\Models\Booking::where('turf_id', $turfId)
            ->where('date', $date)
            ->pluck('selected_slots')
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
    }
}