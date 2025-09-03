<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Booking;
use App\Models\User;
use App\Models\Turf;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class AnalyticsController extends Controller
{
    public function advanced(Request $request)
    {
        $days = $request->get('days', 30);
        $startDate = Carbon::now()->subDays($days);
        
        return response()->json([
            'revenue' => $this->getRevenueData($startDate),
            'bookings' => $this->getBookingPatterns($startDate),
            'userGrowth' => $this->getUserGrowthData($startDate),
            'turfUtilization' => $this->getTurfUtilizationData($startDate)
        ]);
    }

    private function getRevenueData($startDate)
    {
        return Booking::where('created_at', '>=', $startDate)
            ->where('status', 'confirmed')
            ->selectRaw('DATE(created_at) as date, SUM(amount) as amount')
            ->groupBy('date')
            ->orderBy('date')
            ->get()
            ->map(function ($item) {
                return [
                    'date' => Carbon::parse($item->date)->format('M d'),
                    'amount' => (float) ($item->amount ?? 0)
                ];
            });
    }

    private function getBookingPatterns($startDate)
    {
        return Booking::where('created_at', '>=', $startDate)
            ->selectRaw('HOUR(created_at) as hour, COUNT(*) as count')
            ->groupBy('hour')
            ->orderBy('hour')
            ->get()
            ->map(function ($item) {
                return [
                    'hour' => ($item->hour ?? 0) . ':00',
                    'count' => $item->count
                ];
            });
    }

    private function getUserGrowthData($startDate)
    {
        return User::where('created_at', '>=', $startDate)
            ->selectRaw('DATE_FORMAT(created_at, "%Y-%m") as month, COUNT(*) as users')
            ->groupBy('month')
            ->orderBy('month')
            ->get()
            ->map(function ($item) {
                return [
                    'month' => Carbon::createFromFormat('Y-m', $item->month)->format('M Y'),
                    'users' => $item->users
                ];
            });
    }

    private function getTurfUtilizationData($startDate)
    {
        $totalSlots = Turf::count() * 24; // Assuming 24 hours per day
        $bookedSlots = Booking::where('created_at', '>=', $startDate)
            ->where('status', 'confirmed')
            ->count();
        
        return [
            ['name' => 'Booked', 'value' => $bookedSlots],
            ['name' => 'Available', 'value' => $totalSlots - $bookedSlots]
        ];
    }

    public function notifications($userId)
    {
        // Simulate notifications - in production, use a proper notification system
        $notifications = [];
        
        // Check for recent bookings
        $recentBookings = Booking::where('created_at', '>=', Carbon::now()->subMinutes(30))
            ->with(['turf', 'user'])
            ->get();
            
        foreach ($recentBookings as $booking) {
            $notifications[] = [
                'id' => 'booking_' . $booking->id,
                'type' => 'booking',
                'title' => 'New Booking',
                'message' => "New booking for {$booking->turf->turf_name} by {$booking->customer_name}",
                'created_at' => $booking->created_at
            ];
        }
        
        return response()->json($notifications);
    }
}