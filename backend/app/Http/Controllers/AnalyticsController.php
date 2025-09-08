<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Booking;
use App\Models\Turf;

class AnalyticsController extends Controller
{
    public function advanced(Request $request)
    {
        $user = auth()->user();
        $days = $request->get('days', 30);
        
        if ($user->role !== 'turf_owner') {
            return response()->json(['error' => 'Access denied'], 403);
        }
        
        $turfIds = Turf::where('owner_id', $user->id)->pluck('id');
        $startDate = now()->subDays($days);
        
        $analytics = [
            'total_revenue' => Booking::whereIn('turf_id', $turfIds)->where('created_at', '>=', $startDate)->sum('amount'),
            'total_bookings' => Booking::whereIn('turf_id', $turfIds)->where('created_at', '>=', $startDate)->count(),
            'confirmed_bookings' => Booking::whereIn('turf_id', $turfIds)->where('created_at', '>=', $startDate)->where('status', 'confirmed')->count(),
        ];
        
        return response()->json($analytics);
    }
    
    public function notifications($userId)
    {
        return response()->json(['notifications' => []]);
    }
}