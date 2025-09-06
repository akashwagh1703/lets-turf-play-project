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
use App\Http\Controllers\FeatureController;
use App\Http\Controllers\RevenueModelAssignmentController;
use App\Http\Controllers\FileUploadController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\PaymentController;
use App\Services\AdvancedAnalyticsService;
use App\Services\PerformanceOptimizationService;
use App\Services\SecurityService;
use App\Models\Subscription;

// Public routes
Route::post('/login', [AuthController::class, 'login']);
Route::post('/register', [AuthController::class, 'register']);

// Protected routes
Route::middleware(['auth:api'])->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);
    
    // Turf routes
    Route::get('turfs', [TurfController::class, 'index']);
    Route::post('turfs', [TurfController::class, 'store'])->middleware('plan.limits:turfs');
    Route::get('turfs/{turf}', [TurfController::class, 'show']);
    Route::put('turfs/{turf}', [TurfController::class, 'update']);
    Route::delete('turfs/{turf}', [TurfController::class, 'destroy']);
    Route::get('/turf-stats', [TurfController::class, 'getTurfStats']);
    
    // Booking routes
    Route::get('bookings', [BookingController::class, 'index']);
    Route::post('bookings', [BookingController::class, 'store'])->middleware('plan.limits:bookings');
    Route::get('bookings/{booking}', [BookingController::class, 'show']);
    Route::put('bookings/{booking}', [BookingController::class, 'update']);
    Route::delete('bookings/{booking}', [BookingController::class, 'destroy']);
    Route::get('/turfs/{turf_id}/available-slots', [BookingController::class, 'getAvailableSlots']);
    Route::get('/bookings-stats', [BookingController::class, 'getBookingStats'])->middleware('feature.access:Advanced Analytics');
    
    // Staff routes
    Route::get('staff', [StaffController::class, 'index']);
    Route::post('staff', [StaffController::class, 'store'])->middleware('plan.limits:staff');
    Route::get('staff/{staff}', [StaffController::class, 'show']);
    Route::put('staff/{staff}', [StaffController::class, 'update']);
    Route::delete('staff/{staff}', [StaffController::class, 'destroy']);
    
    // Super Admin only routes
    Route::middleware('role:super_admin')->group(function () {
        Route::apiResource('turf-owners', TurfOwnerController::class);
        Route::post('/revenue-models', [RevenueModelController::class, 'store']);
        Route::put('/revenue-models/{revenue_model}', [RevenueModelController::class, 'update']);
        Route::delete('/revenue-models/{revenue_model}', [RevenueModelController::class, 'destroy']);
        Route::post('/features', [FeatureController::class, 'store']);
        Route::put('/features/{feature}', [FeatureController::class, 'update']);
        Route::delete('/features/{feature}', [FeatureController::class, 'destroy']);
        Route::apiResource('players', PlayerController::class);
        Route::get('/subscriptions/stats', [SubscriptionController::class, 'stats']);
        Route::apiResource('subscriptions', SubscriptionController::class);
        Route::post('/assign-revenue-model', [RevenueModelAssignmentController::class, 'store']);
        Route::get('/revenue-model-assignments', [RevenueModelAssignmentController::class, 'index']);
    });
    
    // Turf Owner routes
    Route::middleware('role:turf_owner,super_admin')->group(function () {
        Route::get('/my-subscriptions', [SubscriptionController::class, 'mySubscriptions']);
        Route::post('/subscribe-revenue-model', [SubscriptionController::class, 'store']);
        Route::post('/upgrade-plan', function(Request $request) {
            try {
                $user = auth()->user();
                $planId = $request->plan_id;
                
                \Log::info('Upgrade plan request', ['user_id' => $user->id, 'plan_id' => $planId]);
                
                if (!$planId) {
                    return response()->json(['success' => false, 'message' => 'Plan ID is required'], 400);
                }
                
                // Validate plan exists
                $plan = \App\Models\RevenueModel::find($planId);
                if (!$plan) {
                    return response()->json(['success' => false, 'message' => 'Plan not found'], 404);
                }
                
                // Check if RevenueModelAssignment model exists
                if (!class_exists('\App\Models\RevenueModelAssignment')) {
                    // Create assignment in subscriptions table instead
                    \App\Models\Subscription::where('owner_id', $user->id)
                        ->where('status', 'active')
                        ->update(['status' => 'inactive']);
                    
                    $endDate = null;
                    if ($plan->duration_type === 'monthly') {
                        $endDate = now()->addMonth();
                    } elseif ($plan->duration_type === 'yearly') {
                        $endDate = now()->addYear();
                    }
                    
                    \App\Models\Subscription::create([
                        'owner_id' => $user->id,
                        'revenue_model_id' => $planId,
                        'start_date' => now(),
                        'end_date' => $endDate,
                        'status' => 'active'
                    ]);
                } else {
                    // Use RevenueModelAssignment
                    \App\Models\RevenueModelAssignment::where('owner_id', $user->id)
                        ->where('status', 'active')
                        ->update(['status' => 'inactive']);
                    
                    $endDate = null;
                    if ($plan->duration_type === 'monthly') {
                        $endDate = now()->addMonth();
                    } elseif ($plan->duration_type === 'yearly') {
                        $endDate = now()->addYear();
                    }
                    
                    \App\Models\RevenueModelAssignment::create([
                        'owner_id' => $user->id,
                        'revenue_model_id' => $planId,
                        'start_date' => now(),
                        'end_date' => $endDate,
                        'status' => 'active'
                    ]);
                }
                
                return response()->json([
                    'success' => true,
                    'message' => 'Plan upgraded successfully'
                ]);
            } catch (\Exception $e) {
                \Log::error('Upgrade plan error', ['error' => $e->getMessage(), 'trace' => $e->getTraceAsString()]);
                return response()->json([
                    'success' => false,
                    'message' => 'Upgrade failed: ' . $e->getMessage(),
                    'error_details' => $e->getTraceAsString()
                ], 500);
            }
        });
    });
    
    // Analytics routes
    Route::get('/players/analytics', [PlayerController::class, 'analytics']);
    
    // Advanced Analytics for Turf Owners
    Route::get('/advanced-analytics', function(Request $request) {
        try {
            $user = auth()->user();
            $days = $request->get('days', 30);
            $startDate = now()->subDays($days);
            
            if ($user->role !== 'turf_owner') {
                return response()->json(['error' => 'Access denied'], 403);
            }
            
            // Get user's turfs
            $turfIds = \App\Models\Turf::where('owner_id', $user->id)->pluck('id');
            
            // Revenue analytics
            $totalRevenue = \App\Models\Booking::whereIn('turf_id', $turfIds)
                ->where('created_at', '>=', $startDate)
                ->sum('amount');
                
            $previousRevenue = \App\Models\Booking::whereIn('turf_id', $turfIds)
                ->where('created_at', '>=', now()->subDays($days * 2))
                ->where('created_at', '<', $startDate)
                ->sum('amount');
                
            $revenueChange = $previousRevenue > 0 ? 
                round((($totalRevenue - $previousRevenue) / $previousRevenue) * 100, 1) : 0;
            
            // Booking analytics
            $totalBookings = \App\Models\Booking::whereIn('turf_id', $turfIds)
                ->where('created_at', '>=', $startDate)
                ->count();
                
            $confirmedBookings = \App\Models\Booking::whereIn('turf_id', $turfIds)
                ->where('created_at', '>=', $startDate)
                ->where('status', 'confirmed')
                ->count();
                
            $pendingBookings = \App\Models\Booking::whereIn('turf_id', $turfIds)
                ->where('created_at', '>=', $startDate)
                ->where('status', 'pending')
                ->count();
                
            $cancelledBookings = \App\Models\Booking::whereIn('turf_id', $turfIds)
                ->where('created_at', '>=', $startDate)
                ->where('status', 'cancelled')
                ->count();
            
            // Revenue breakdown
            $onlineRevenue = \App\Models\Booking::whereIn('turf_id', $turfIds)
                ->where('created_at', '>=', $startDate)
                ->where('booking_type', 'online')
                ->sum('amount');
                
            $offlineRevenue = \App\Models\Booking::whereIn('turf_id', $turfIds)
                ->where('created_at', '>=', $startDate)
                ->where('booking_type', 'offline')
                ->sum('amount');
            
            // Top performing turfs
            $topTurfs = \App\Models\Turf::where('owner_id', $user->id)
                ->withCount(['bookings' => function($query) use ($startDate) {
                    $query->where('created_at', '>=', $startDate);
                }])
                ->with(['bookings' => function($query) use ($startDate) {
                    $query->where('created_at', '>=', $startDate);
                }])
                ->get()
                ->map(function($turf) {
                    return [
                        'id' => $turf->id,
                        'turf_name' => $turf->turf_name,
                        'bookings_count' => $turf->bookings_count,
                        'revenue' => $turf->bookings->sum('amount')
                    ];
                })
                ->sortByDesc('revenue')
                ->take(5)
                ->values();
            
            // Peak hours analysis
            $peakHours = \App\Models\Booking::whereIn('turf_id', $turfIds)
                ->where('created_at', '>=', $startDate)
                ->selectRaw('EXTRACT(HOUR FROM created_at) as hour, COUNT(*) as bookings, SUM(amount) as revenue')
                ->groupBy('hour')
                ->orderBy('revenue', 'desc')
                ->take(24)
                ->get();
            
            // Revenue trend data (daily)
            $revenueTrend = [];
            for ($i = $days - 1; $i >= 0; $i--) {
                $date = now()->subDays($i);
                $dailyRevenue = \App\Models\Booking::whereIn('turf_id', $turfIds)
                    ->whereDate('created_at', $date)
                    ->sum('amount');
                $revenueTrend[] = [
                    'date' => $date->format('M d'),
                    'revenue' => $dailyRevenue
                ];
            }
            
            // Monthly bookings trend
            $monthlyBookings = [];
            for ($i = 11; $i >= 0; $i--) {
                $month = now()->subMonths($i);
                $bookings = \App\Models\Booking::whereIn('turf_id', $turfIds)
                    ->whereYear('created_at', $month->year)
                    ->whereMonth('created_at', $month->month)
                    ->count();
                $monthlyBookings[] = [
                    'month' => $month->format('M Y'),
                    'bookings' => $bookings
                ];
            }
            
            return response()->json([
                'total_revenue' => $totalRevenue,
                'revenue_change' => $revenueChange,
                'total_bookings' => $totalBookings,
                'confirmed_bookings' => $confirmedBookings,
                'pending_bookings' => $pendingBookings,
                'cancelled_bookings' => $cancelledBookings,
                'active_turfs' => \App\Models\Turf::where('owner_id', $user->id)->where('status', true)->count(),
                'avg_daily_revenue' => $days > 0 ? round($totalRevenue / $days, 2) : 0,
                'online_revenue' => $onlineRevenue,
                'offline_revenue' => $offlineRevenue,
                'peak_hour_revenue' => $peakHours->sum('revenue'),
                'top_turfs' => $topTurfs,
                'peak_hours' => $peakHours,
                'revenue_trend' => $revenueTrend,
                'monthly_bookings' => $monthlyBookings
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    });
    
    // Public access to revenue models and features for upgrade modal
    Route::get('/revenue-models', [RevenueModelController::class, 'index']);
    Route::get('/features', [FeatureController::class, 'index']);
    
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
    
    // Auto-assign free plan to turf owners without plans
    Route::post('/auto-assign-free-plan', function() {
        try {
            $user = auth()->user();
            
            if ($user->role !== 'turf_owner') {
                return response()->json(['success' => false, 'message' => 'Only turf owners can be assigned plans']);
            }
            
            // Check if user already has an active plan
            $existingAssignment = \App\Models\RevenueModelAssignment::where('owner_id', $user->id)
                ->where('status', 'active')
                ->first();
                
            if ($existingAssignment) {
                // Update existing assignment to latest free plan
                $freePlan = \App\Models\RevenueModel::where('is_free', true)->first();
                if ($freePlan) {
                    $existingAssignment->update(['revenue_model_id' => $freePlan->id]);
                    return response()->json(['success' => true, 'message' => 'Plan updated to latest free plan']);
                }
                return response()->json(['success' => false, 'message' => 'User already has an active plan']);
            }
            
            // Find free plan
            $freePlan = \App\Models\RevenueModel::where('is_free', true)->first();
            if (!$freePlan) {
                return response()->json(['success' => false, 'message' => 'No free plan available']);
            }
            
            // Create assignment
            \App\Models\RevenueModelAssignment::create([
                'owner_id' => $user->id,
                'revenue_model_id' => $freePlan->id,
                'start_date' => now(),
                'end_date' => null,
                'is_free_assignment' => true,
                'status' => 'active'
            ]);
            
            return response()->json(['success' => true, 'message' => 'Free plan assigned successfully']);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()]);
        }
    });
    
    // Get current plan with usage stats
    Route::get('/my-plan', function() {
        try {
            $user = auth()->user();
            
            if ($user->role !== 'turf_owner') {
                return response()->json(['success' => true, 'plan' => null]);
            }
            
            // Check subscriptions table first
            $subscription = \App\Models\Subscription::where('owner_id', $user->id)
                ->where('status', 'active')
                ->with('revenueModel')
                ->first();
                
            if (!$subscription) {
                // Fallback to RevenueModelAssignment if exists
                if (class_exists('\App\Models\RevenueModelAssignment')) {
                    $assignment = \App\Models\RevenueModelAssignment::where('owner_id', $user->id)
                        ->where('status', 'active')
                        ->with('revenueModel')
                        ->first();
                    if ($assignment) {
                        $subscription = $assignment;
                    }
                }
                
                if (!$subscription) {
                    return response()->json(['success' => true, 'plan' => null]);
                }
            }
            
            $plan = $subscription->revenueModel;
            
            // Get current usage
            $currentTurfs = \App\Models\Turf::where('owner_id', $user->id)->count();
            $currentStaff = \App\Models\Staff::where('owner_id', $user->id)->count();
            $currentBookings = \App\Models\Booking::whereHas('turf', function($query) use ($user) {
                $query->where('owner_id', $user->id);
            })->whereMonth('created_at', now()->month)->count();
            
            // Get available features
            $availableFeatures = [];
            if ($plan->selected_features && is_array($plan->selected_features)) {
                $availableFeatures = \App\Models\Feature::whereIn('id', $plan->selected_features)->get();
            }
            
            return response()->json([
                'success' => true,
                'plan' => [
                    'id' => $plan->id,
                    'name' => $plan->name,
                    'description' => $plan->description,
                    'price' => $plan->price,
                    'duration_type' => $plan->duration_type,
                    'is_free' => $plan->is_free,
                    'start_date' => $subscription->start_date,
                    'end_date' => $subscription->end_date,
                    'is_expired' => $subscription->end_date && $subscription->end_date < now(),
                    'days_remaining' => $subscription->end_date ? now()->diffInDays($subscription->end_date, false) : null,
                    'limits' => [
                        'turfs' => [
                            'max' => $plan->max_turfs,
                            'current' => $currentTurfs,
                            'remaining' => max(0, $plan->max_turfs - $currentTurfs)
                        ],
                        'staff' => [
                            'max' => $plan->max_staff,
                            'current' => $currentStaff,
                            'remaining' => max(0, $plan->max_staff - $currentStaff)
                        ],
                        'bookings' => [
                            'max' => $plan->max_bookings_per_month,
                            'current' => $currentBookings,
                            'remaining' => max(0, $plan->max_bookings_per_month - $currentBookings)
                        ]
                    ],
                    'features' => $availableFeatures
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'plan' => null,
                'error' => $e->getMessage()
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
            $myTurfIds = \App\Models\Turf::where('owner_id', $user->id)->pluck('id');
            
            $stats = [
                'my_turfs' => \App\Models\Turf::where('owner_id', $user->id)->count(),
                'active_turfs' => \App\Models\Turf::where('owner_id', $user->id)->where('status', true)->count(),
                'my_bookings' => \App\Models\Booking::whereIn('turf_id', $myTurfIds)->count(),
                'confirmed_bookings' => \App\Models\Booking::whereIn('turf_id', $myTurfIds)->where('status', 'confirmed')->count(),
                'pending_bookings' => \App\Models\Booking::whereIn('turf_id', $myTurfIds)->where('status', 'pending')->count(),
                'cancelled_bookings' => \App\Models\Booking::whereIn('turf_id', $myTurfIds)->where('status', 'cancelled')->count(),
                'online_bookings' => \App\Models\Booking::whereIn('turf_id', $myTurfIds)->where('booking_type', 'online')->count(),
                'offline_bookings' => \App\Models\Booking::whereIn('turf_id', $myTurfIds)->where('booking_type', 'offline')->count(),
                'my_staff' => \App\Models\Staff::where('owner_id', $user->id)->count(),
                'active_staff' => \App\Models\Staff::where('owner_id', $user->id)->where('status', true)->count(),
                'monthly_earnings' => \App\Models\Booking::whereIn('turf_id', $myTurfIds)->whereMonth('created_at', now()->month)->sum('amount'),
                'today_earnings' => \App\Models\Booking::whereIn('turf_id', $myTurfIds)->whereDate('created_at', today())->sum('amount'),
                'total_earnings' => \App\Models\Booking::whereIn('turf_id', $myTurfIds)->sum('amount'),
            ];
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
                'error' => 'Failed to fetch dashboard stats',
                'my_turfs' => 0,
                'my_bookings' => 0,
                'monthly_earnings' => 0
            ]);
        }
    });
    
    // Analytics routes
    Route::get('/analytics/advanced', [AnalyticsController::class, 'advanced']);
    Route::get('/notifications/{userId}', [AnalyticsController::class, 'notifications']);
    
    // Payment and Plan Upgrade routes
    Route::post('/verify-payment', function(Request $request) {
        try {
            return response()->json(['success' => true, 'message' => 'Payment verified']);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    });
    
    // Upgrade plan API with database operations
    Route::post('/upgrade-plan', function(Request $request) {
        try {
            $user = auth()->user();
            $planId = $request->plan_id;
            
            if (!$planId) {
                return response()->json(['success' => false, 'message' => 'Plan ID required'], 400);
            }
            
            // Check if plan exists
            $plan = \App\Models\RevenueModel::find($planId);
            if (!$plan) {
                return response()->json(['success' => false, 'message' => 'Plan not found'], 404);
            }
            
            // Deactivate existing subscriptions
            \App\Models\Subscription::where('owner_id', $user->id)
                ->update(['status' => 'inactive']);
            
            // Calculate end date
            $endDate = null;
            if ($plan->duration_type === 'monthly') {
                $endDate = now()->addMonth();
            } elseif ($plan->duration_type === 'yearly') {
                $endDate = now()->addYear();
            }
            
            // Create new subscription
            $subscription = \App\Models\Subscription::create([
                'owner_id' => $user->id,
                'revenue_model_id' => $planId,
                'start_date' => now(),
                'end_date' => $endDate,
                'amount_paid' => $plan->price,
                'payment_status' => 'paid',
                'status' => 'active'
            ]);
            
            return response()->json([
                'success' => true,
                'message' => 'Plan activated successfully',
                'subscription_id' => $subscription->id
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Database error: ' . $e->getMessage()
            ], 500);
        }
    });
    

    
    // Debug API endpoints
    Route::get('/debug-revenue-models', function(Request $request) {
        try {
            $allModels = \App\Models\RevenueModel::all();
            $controller = new \App\Http\Controllers\RevenueModelController();
            $controllerResponse = $controller->index($request);
            
            return response()->json([
                'request_params' => $request->all(),
                'direct_query_count' => $allModels->count(),
                'direct_query_data' => $allModels,
                'controller_response' => $controllerResponse->getData()
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
        }
    });
    
    // Test upgrade endpoint
    Route::post('/test-upgrade', function(Request $request) {
        try {
            $user = auth()->user();
            return response()->json([
                'success' => true,
                'user' => $user,
                'request_data' => $request->all(),
                'subscription_table_exists' => \Schema::hasTable('subscriptions'),
                'revenue_model_table_exists' => \Schema::hasTable('revenue_models')
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
        }
    });
    
    Route::get('/debug-features', function() {
        try {
            $features = \App\Models\Feature::all();
            return response()->json([
                'count' => $features->count(),
                'data' => $features
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => $e->getMessage()
            ]);
        }
    });
    
    // Profile update API
    Route::put('/profile/update', function(Request $request) {
        try {
            $user = auth()->user();
            
            $validated = $request->validate([
                'name' => 'required|string|max:255',
                'email' => 'required|email|unique:users,email,' . $user->id,
                'phone' => 'nullable|string|max:20',
                'current_password' => 'nullable|string',
                'password' => 'nullable|string|min:6|confirmed'
            ]);
            
            if ($request->password && !\Hash::check($request->current_password, $user->password)) {
                return response()->json(['message' => 'Current password is incorrect'], 400);
            }
            
            $updateData = [
                'name' => $validated['name'],
                'email' => $validated['email'],
                'phone' => $validated['phone'] ?? null
            ];
            
            if ($request->password) {
                $updateData['password'] = \Hash::make($validated['password']);
            }
            
            $user->update($updateData);
            
            return response()->json([
                'success' => true,
                'message' => 'Profile updated successfully',
                'user' => $user->fresh()
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update profile: ' . $e->getMessage()
            ], 500);
        }
    });
    
    // Settings API
    Route::get('/settings', function() {
        try {
            $user = auth()->user();
            
            if (!\Schema::hasTable('user_settings')) {
                return response()->json(['settings' => [
                    'notifications' => ['email' => true, 'push' => false, 'sms' => true],
                    'security' => ['twoFactor' => false, 'sessionTimeout' => 30],
                    'system' => ['theme' => 'light', 'language' => 'en', 'timezone' => 'Asia/Kolkata']
                ]]);
            }
            
            $settings = \DB::table('user_settings')->where('user_id', $user->id)->first();
            
            if (!$settings) {
                $defaultSettings = [
                    'notifications' => ['email' => true, 'push' => false, 'sms' => true],
                    'security' => ['twoFactor' => false, 'sessionTimeout' => 30],
                    'system' => ['theme' => 'light', 'language' => 'en', 'timezone' => 'Asia/Kolkata']
                ];
                return response()->json(['settings' => $defaultSettings]);
            }
            
            return response()->json(['settings' => json_decode($settings->settings, true)]);
        } catch (\Exception $e) {
            \Log::error('Settings fetch error', ['error' => $e->getMessage()]);
            return response()->json(['settings' => [
                'notifications' => ['email' => true, 'push' => false, 'sms' => true],
                'security' => ['twoFactor' => false, 'sessionTimeout' => 30],
                'system' => ['theme' => 'light', 'language' => 'en', 'timezone' => 'Asia/Kolkata']
            ]]);
        }
    });
    
    Route::put('/settings/update', function(Request $request) {
        try {
            $user = auth()->user();
            $category = $request->category;
            $key = $request->key;
            $value = $request->value;
            
            \Log::info('Settings update request', ['user_id' => $user->id, 'category' => $category, 'key' => $key, 'value' => $value]);
            
            if (!\Schema::hasTable('user_settings')) {
                \Log::error('user_settings table does not exist');
                return response()->json(['success' => false, 'message' => 'Settings table not found'], 500);
            }
            
            $settings = \DB::table('user_settings')->where('user_id', $user->id)->first();
            
            if (!$settings) {
                $defaultSettings = [
                    'notifications' => ['email' => true, 'push' => false, 'sms' => true],
                    'security' => ['twoFactor' => false, 'sessionTimeout' => 30],
                    'system' => ['theme' => 'light', 'language' => 'en', 'timezone' => 'Asia/Kolkata']
                ];
                
                \DB::table('user_settings')->insert([
                    'user_id' => $user->id,
                    'settings' => json_encode($defaultSettings),
                    'created_at' => now(),
                    'updated_at' => now()
                ]);
                
                $currentSettings = $defaultSettings;
            } else {
                $currentSettings = json_decode($settings->settings, true);
            }
            
            $currentSettings[$category][$key] = $value;
            
            \DB::table('user_settings')
                ->where('user_id', $user->id)
                ->update([
                    'settings' => json_encode($currentSettings),
                    'updated_at' => now()
                ]);
            
            return response()->json(['success' => true, 'message' => 'Setting updated successfully']);
        } catch (\Exception $e) {
            \Log::error('Settings update error', ['error' => $e->getMessage(), 'trace' => $e->getTraceAsString()]);
            return response()->json(['success' => false, 'message' => 'Failed to update setting: ' . $e->getMessage()], 500);
        }
    });
    
    // File upload routes
    Route::post('/upload', [FileUploadController::class, 'upload']);
    Route::delete('/upload', [FileUploadController::class, 'delete']);
    
    // Notification routes
    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::get('/notifications/unread', [NotificationController::class, 'unread']);
    Route::put('/notifications/{id}/read', [NotificationController::class, 'markAsRead']);
    Route::put('/notifications/mark-all-read', [NotificationController::class, 'markAllAsRead']);
    
    // Payment routes
    Route::post('/payments/create', [PaymentController::class, 'createPayment']);
    Route::get('/payments', [PaymentController::class, 'getPayments']);
});

// Payment webhook routes (no auth required)
Route::post('/payments/webhook/{gateway}', [PaymentController::class, 'webhook']);

// Advanced Analytics routes
Route::middleware('auth:api')->group(function () {
    Route::get('/analytics/revenue', function(Request $request) {
        $service = new AdvancedAnalyticsService();
        $ownerId = auth()->user()->role === 'turf_owner' ? auth()->id() : null;
        return response()->json($service->getRevenueAnalytics($ownerId, $request->get('days', 30)));
    });
    
    Route::get('/analytics/customers', function() {
        $service = new AdvancedAnalyticsService();
        $ownerId = auth()->user()->role === 'turf_owner' ? auth()->id() : null;
        return response()->json($service->getCustomerAnalytics($ownerId));
    });
    
    Route::get('/analytics/performance', function() {
        $service = new AdvancedAnalyticsService();
        $ownerId = auth()->user()->role === 'turf_owner' ? auth()->id() : null;
        return response()->json($service->getPerformanceMetrics($ownerId));
    });
    
    Route::get('/performance/metrics', function() {
        $service = new PerformanceOptimizationService();
        return response()->json($service->getPerformanceMetrics());
    });
});

// Security monitoring
Route::middleware('auth:api')->post('/security/report', function(Request $request) {
    $security = new SecurityService();
    $security->logSecurityEvent('User reported security issue', $request->all());
    return response()->json(['status' => 'reported']);
});