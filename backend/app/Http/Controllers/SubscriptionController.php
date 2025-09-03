<?php

namespace App\Http\Controllers;

use App\Models\Subscription;
use App\Models\RevenueModel;
use App\Models\User;
use Illuminate\Http\Request;
use Carbon\Carbon;

class SubscriptionController extends Controller
{
    public function index(Request $request)
    {
        try {
            $query = Subscription::with(['owner', 'revenueModel']);
            
            if ($request->has('user_id')) {
                $query->where('owner_id', $request->user_id);
            }
            
            if ($request->has('status') && $request->status !== 'all') {
                $query->where('status', $request->status);
            }
            
            if ($request->has('search')) {
                $query->whereHas('owner', function($q) use ($request) {
                    $q->where('name', 'like', '%' . $request->search . '%');
                });
            }
            
            $perPage = $request->get('per_page', 10);
            $subscriptions = $query->orderBy('created_at', 'desc')->paginate($perPage);
            
            return response()->json($subscriptions);
        } catch (\Exception $e) {
            return response()->json([
                'data' => [],
                'total' => 0,
                'per_page' => 10,
                'current_page' => 1,
                'last_page' => 1
            ]);
        }
    }

    public function store(Request $request)
    {
        $request->validate([
            'revenue_model_id' => 'required|exists:revenue_models,id',
            'billing_cycle' => 'required|in:monthly,yearly'
        ]);

        $user = auth()->user();
        $revenueModel = RevenueModel::findOrFail($request->revenue_model_id);
        
        $amount = $request->billing_cycle === 'monthly' ? $revenueModel->monthly_price : $revenueModel->yearly_price;
        $startDate = Carbon::now();
        $endDate = $request->billing_cycle === 'monthly' ? $startDate->copy()->addMonth() : $startDate->copy()->addYear();
        
        // Deactivate existing active subscriptions
        Subscription::where('owner_id', $user->id)
            ->where('status', 'active')
            ->update(['status' => 'inactive']);
        
        // Create new subscription
        $subscription = Subscription::create([
            'owner_id' => $user->id,
            'revenue_model_id' => $request->revenue_model_id,
            'start_date' => $startDate,
            'end_date' => $endDate,
            'amount_paid' => $amount,
            'payment_status' => $amount > 0 ? 'paid' : 'paid',
            'status' => 'active'
        ]);
        
        return response()->json([
            'subscription' => $subscription->load('revenueModel'),
            'message' => 'Subscription created successfully'
        ], 201);
    }

    public function show(Subscription $subscription)
    {
        return response()->json($subscription->load(['user', 'revenueModel']));
    }

    public function update(Request $request, Subscription $subscription)
    {
        $request->validate([
            'status' => 'in:active,inactive,expired'
        ]);

        $subscription->update($request->only('status'));
        
        if ($request->status === 'inactive' || $request->status === 'expired') {
            $subscription->owner->update(['subscription_active' => false]);
        }
        
        return response()->json($subscription);
    }

    public function destroy(Subscription $subscription)
    {
        $subscription->delete();
        return response()->json(['message' => 'Subscription deleted successfully']);
    }

    public function mySubscriptions()
    {
        try {
            $user = auth()->user();
            $currentSubscription = Subscription::where('owner_id', $user->id)
                ->where('status', 'active')
                ->with('revenueModel')
                ->first();
                
            $subscriptionHistory = Subscription::where('owner_id', $user->id)
                ->with('revenueModel')
                ->orderBy('created_at', 'desc')
                ->get();
                
            // Get available plans
            $availablePlans = RevenueModel::where('status', true)
                ->orderBy('sort_order')
                ->orderBy('monthly_price')
                ->get()
                ->map(function($plan) {
                    $plan->plan_name = $plan->name; // Add alias for frontend compatibility
                    $plan->features_array = json_decode($plan->features, true) ?? [];
                    $plan->yearly_discount = $plan->monthly_price > 0 ? round((($plan->monthly_price * 12 - $plan->yearly_price) / ($plan->monthly_price * 12)) * 100, 1) : 0;
                    return $plan;
                });
                
            return response()->json([
                'current_subscription' => $currentSubscription,
                'subscription_history' => $subscriptionHistory,
                'available_plans' => $availablePlans,
                'usage_stats' => $this->getUserUsageStats($user->id)
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'current_subscription' => null,
                'subscription_history' => [],
                'available_plans' => [],
                'usage_stats' => []
            ]);
        }
    }
    
    private function getUserUsageStats($userId)
    {
        try {
            $turfsCount = \App\Models\Turf::where('owner_id', $userId)->count();
            $staffCount = \App\Models\Staff::where('owner_id', $userId)->count();
            $bookingsThisMonth = \App\Models\Booking::whereHas('turf', function($q) use ($userId) {
                $q->where('owner_id', $userId);
            })->whereMonth('created_at', now()->month)->count();
            
            return [
                'turfs_used' => $turfsCount,
                'staff_used' => $staffCount,
                'bookings_this_month' => $bookingsThisMonth
            ];
        } catch (\Exception $e) {
            return [
                'turfs_used' => 0,
                'staff_used' => 0,
                'bookings_this_month' => 0
            ];
        }
    }

    public function stats()
    {
        try {
            $total = Subscription::count();
            $active = Subscription::where('status', 'active')->count();
            $expired = Subscription::where('status', 'expired')->count();
            $inactive = Subscription::where('status', 'inactive')->count();
            
            // Calculate monthly revenue from active subscriptions
            $monthlyRevenue = Subscription::where('status', 'active')
                ->where('payment_status', 'paid')
                ->sum('amount_paid');
            
            // Calculate growth rate (handle null created_at)
            $currentMonth = Subscription::whereNotNull('created_at')
                ->whereMonth('created_at', now()->month)
                ->whereYear('created_at', now()->year)
                ->count();
            $previousMonth = Subscription::whereNotNull('created_at')
                ->whereMonth('created_at', now()->subMonth()->month)
                ->whereYear('created_at', now()->subMonth()->year)
                ->count();
            $growthRate = $previousMonth > 0 ? (($currentMonth - $previousMonth) / $previousMonth) * 100 : 0;
            
            $stats = [
                'total' => $total,
                'active' => $active,
                'expired' => $expired,
                'inactive' => $inactive,
                'monthly_revenue' => $monthlyRevenue,
                'total_subscribers' => Subscription::distinct('owner_id')->count(),
                'active_subscriptions' => $active,
                'growth_rate' => round($growthRate, 1),
                'recent_activity' => Subscription::with(['owner', 'revenueModel'])
                    ->whereNotNull('created_at')
                    ->orderBy('created_at', 'desc')
                    ->limit(5)
                    ->get()
            ];
            
            return response()->json($stats);
        } catch (\Exception $e) {
            return response()->json([
                'total' => 0,
                'active' => 0,
                'expired' => 0,
                'inactive' => 0,
                'monthly_revenue' => 0,
                'total_subscribers' => 0,
                'active_subscriptions' => 0,
                'growth_rate' => 0,
                'recent_activity' => []
            ]);
        }
    }
}