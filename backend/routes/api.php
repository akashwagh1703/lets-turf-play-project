<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\TurfController;
use App\Http\Controllers\BookingController;
use App\Http\Controllers\StaffController;
use App\Http\Controllers\TurfOwnerController;
use App\Http\Controllers\RevenueModelController;
use App\Http\Controllers\PlayerController;
use App\Http\Controllers\SubscriptionController;
use App\Http\Controllers\AnalyticsController;
use App\Models\Subscription;

// Public routes
Route::post('/login', [AuthController::class, 'login']);
Route::post('/register', [AuthController::class, 'register']);

// Protected routes
Route::middleware(['auth:api'])->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);
    
    // Turf routes
    Route::apiResource('turfs', TurfController::class)->middleware('subscription.limits:turfs');
    Route::get('/turf-stats', [TurfController::class, 'getTurfStats']);
    
    // Booking routes
    Route::apiResource('bookings', BookingController::class);
    Route::get('/turfs/{turf_id}/available-slots', [BookingController::class, 'getAvailableSlots']);
    Route::get('/bookings-stats', [BookingController::class, 'getBookingStats']);
    
    // Staff routes
    Route::apiResource('staff', StaffController::class)->middleware('subscription.limits:staff');
    
    // Super Admin only routes
    Route::middleware('role:super_admin')->group(function () {
        Route::apiResource('turf-owners', TurfOwnerController::class);
        Route::apiResource('revenue-models', RevenueModelController::class);
        Route::apiResource('players', PlayerController::class);
        Route::get('/subscriptions/stats', [SubscriptionController::class, 'stats']);
        Route::apiResource('subscriptions', SubscriptionController::class);
    });
    
    // Turf Owner routes
    Route::middleware('role:turf_owner,super_admin')->group(function () {
        Route::get('/my-subscriptions', [SubscriptionController::class, 'mySubscriptions']);
        Route::post('/subscribe-revenue-model', [SubscriptionController::class, 'store']);
    });
    
    // Analytics routes
    Route::get('/players/analytics', [PlayerController::class, 'analytics']);
    
    // Get user's current subscription
    Route::get('/my-subscription', function() {
        try {
            $user = auth()->user();
            $subscription = Subscription::where('owner_id', $user->id)
                ->where('status', 'active')
                ->with('revenueModel')
                ->first();
                
            return response()->json([
                'subscription' => $subscription
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'subscription' => null
            ]);
        }
    });
    
    // Dashboard analytics
    Route::get('/dashboard/stats', function () {
        try {
            $user = auth()->user();
            $stats = [];
            
            if ($user->role === 'super_admin') {
            $totalRevenue = \App\Models\Booking::sum('amount');
            $monthlyRevenue = \App\Models\Booking::whereMonth('created_at', now()->month)->sum('amount');
            $todayRevenue = \App\Models\Booking::whereDate('created_at', today())->sum('amount');
            $totalStaff = \App\Models\Staff::count();
            $activeStaff = \App\Models\Staff::where('status', true)->count();
            $monthlyPayroll = \App\Models\Staff::where('status', true)->sum('salary');
            
            $stats = [
                'total_turfs' => \App\Models\Turf::count(),
                'active_turfs' => \App\Models\Turf::where('status', true)->count(),
                'total_owners' => \App\Models\User::where('role', 'turf_owner')->count(),
                'active_owners' => \App\Models\User::where('role', 'turf_owner')->where('status', true)->count(),
                'total_bookings' => \App\Models\Booking::count(),
                'confirmed_bookings' => \App\Models\Booking::where('status', 'confirmed')->count(),
                'pending_bookings' => \App\Models\Booking::where('status', 'pending')->count(),
                'cancelled_bookings' => \App\Models\Booking::where('status', 'cancelled')->count(),
                'total_players' => \App\Models\Player::count(),
                'total_staff' => $totalStaff,
                'active_staff' => $activeStaff,
                'total_revenue' => $totalRevenue,
                'monthly_revenue' => $monthlyRevenue,
                'today_revenue' => $todayRevenue,
                'monthly_payroll' => $monthlyPayroll,
                'net_profit' => $totalRevenue - $monthlyPayroll,
            ];
        } elseif ($user->role === 'turf_owner') {
            try {
                $myTurfs = \App\Models\Turf::where('owner_id', $user->id);
                $myTurfIds = $myTurfs->pluck('id');
                $myBookings = \App\Models\Booking::whereIn('turf_id', $myTurfIds);
                $monthlyEarnings = $myBookings->whereMonth('created_at', now()->month)->sum('amount') ?? 0;
                $todayEarnings = $myBookings->whereDate('created_at', today())->sum('amount') ?? 0;
                
                $stats = [
                    'my_turfs' => $myTurfs->count() ?? 0,
                    'active_turfs' => $myTurfs->where('status', true)->count() ?? 0,
                    'my_bookings' => $myBookings->count() ?? 0,
                    'confirmed_bookings' => $myBookings->where('status', 'confirmed')->count() ?? 0,
                    'pending_bookings' => $myBookings->where('status', 'pending')->count() ?? 0,
                    'cancelled_bookings' => $myBookings->where('status', 'cancelled')->count() ?? 0,
                    'online_bookings' => $myBookings->where('booking_type', 'online')->count() ?? 0,
                    'offline_bookings' => $myBookings->where('booking_type', 'offline')->count() ?? 0,
                    'my_staff' => \App\Models\Staff::where('owner_id', $user->id)->count() ?? 0,
                    'active_staff' => \App\Models\Staff::where('owner_id', $user->id)->where('status', true)->count() ?? 0,
                    'monthly_earnings' => $monthlyEarnings,
                    'today_earnings' => $todayEarnings,
                    'total_earnings' => $myBookings->sum('amount') ?? 0,
                ];
            } catch (\Exception $e) {
                $stats = [
                    'my_turfs' => 0,
                    'active_turfs' => 0,
                    'my_bookings' => 0,
                    'confirmed_bookings' => 0,
                    'pending_bookings' => 0,
                    'cancelled_bookings' => 0,
                    'online_bookings' => 0,
                    'offline_bookings' => 0,
                    'my_staff' => 0,
                    'active_staff' => 0,
                    'monthly_earnings' => 0,
                    'today_earnings' => 0,
                    'total_earnings' => 0,
                ];
            }
        } else {
            // Staff role
            $stats = [
                'total_bookings' => \App\Models\Booking::count(),
                'today_bookings' => \App\Models\Booking::whereDate('created_at', today())->count(),
                'pending_bookings' => \App\Models\Booking::where('status', 'pending')->count(),
                'confirmed_bookings' => \App\Models\Booking::where('status', 'confirmed')->count(),
                'cancelled_bookings' => \App\Models\Booking::where('status', 'cancelled')->count(),
                'revenue_today' => \App\Models\Booking::whereDate('created_at', today())->sum('amount'),
            ];
        }
        
            return response()->json($stats);
        } catch (\Exception $e) {
            return response()->json([
                'my_turfs' => 0,
                'my_bookings' => 0,
                'monthly_earnings' => 0,
                'my_staff' => 0,
                'online_bookings' => 0,
                'offline_bookings' => 0,
                'pending_bookings' => 0,
                'confirmed_bookings' => 0,
                'cancelled_bookings' => 0
            ]);
        }
    });
    
    // Analytics routes
    Route::get('/analytics/advanced', [AnalyticsController::class, 'advanced']);
    Route::get('/notifications/{userId}', [AnalyticsController::class, 'notifications']);
    
    // Notifications placeholder
    Route::get('/notifications', function () {
        return response()->json(['notifications' => []]);
    });
});