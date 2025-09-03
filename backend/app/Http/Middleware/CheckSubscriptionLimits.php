<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class CheckSubscriptionLimits
{
    public function handle(Request $request, Closure $next, $resource = null)
    {
        $user = auth()->user();
        
        if ($user->role !== 'turf_owner' || !$user->revenueModel) {
            return $next($request);
        }

        $revenueModel = $user->revenueModel;
        
        // Check limits based on resource
        switch ($resource) {
            case 'turfs':
                if ($revenueModel->max_turfs && $user->turfs()->count() >= $revenueModel->max_turfs) {
                    return response()->json([
                        'message' => "You've reached the maximum number of turfs ({$revenueModel->max_turfs}) for your current plan. Please upgrade to add more turfs.",
                        'limit_reached' => true,
                        'current_plan' => $revenueModel->name
                    ], 403);
                }
                break;
                
            case 'staff':
                if ($revenueModel->max_staff && $user->staff()->count() >= $revenueModel->max_staff) {
                    return response()->json([
                        'message' => "You've reached the maximum number of staff ({$revenueModel->max_staff}) for your current plan. Please upgrade to add more staff.",
                        'limit_reached' => true,
                        'current_plan' => $revenueModel->name
                    ], 403);
                }
                break;
        }

        return $next($request);
    }
}