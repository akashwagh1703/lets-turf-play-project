<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use App\Models\RevenueModelAssignment;
use App\Models\Turf;
use App\Models\Staff;
use App\Models\Booking;

class PlanRestrictionMiddleware
{
    public function handle(Request $request, Closure $next, string $resource)
    {
        $user = auth()->user();
        
        if ($user->role !== 'turf_owner') {
            return $next($request);
        }

        $assignment = RevenueModelAssignment::where('owner_id', $user->id)
            ->where('status', 'active')
            ->with('revenueModel')
            ->first();

        if (!$assignment) {
            return response()->json([
                'success' => false,
                'message' => 'No active plan found. Please contact admin.'
            ], 403);
        }

        $plan = $assignment->revenueModel;
        
        // Check if plan is expired
        if ($assignment->end_date && $assignment->end_date < now()) {
            return response()->json([
                'success' => false,
                'message' => 'Your plan has expired. Please renew to continue.'
            ], 403);
        }

        // Check resource limits based on the resource type
        switch ($resource) {
            case 'turfs':
                $currentCount = Turf::where('owner_id', $user->id)->count();
                if ($currentCount >= $plan->max_turfs) {
                    return response()->json([
                        'success' => false,
                        'message' => "You have reached your turf limit ({$plan->max_turfs}). Upgrade your plan to add more turfs."
                    ], 403);
                }
                break;

            case 'staff':
                $currentCount = Staff::where('owner_id', $user->id)->count();
                if ($currentCount >= $plan->max_staff) {
                    return response()->json([
                        'success' => false,
                        'message' => "You have reached your staff limit ({$plan->max_staff}). Upgrade your plan to add more staff."
                    ], 403);
                }
                break;

            case 'bookings':
                $currentCount = Booking::whereHas('turf', function($query) use ($user) {
                    $query->where('owner_id', $user->id);
                })->whereMonth('created_at', now()->month)->count();
                
                if ($currentCount >= $plan->max_bookings_per_month) {
                    return response()->json([
                        'success' => false,
                        'message' => "You have reached your monthly booking limit ({$plan->max_bookings_per_month}). Upgrade your plan for more bookings."
                    ], 403);
                }
                break;
        }

        return $next($request);
    }
}