<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use App\Models\RevenueModelAssignment;
use App\Models\Feature;

class FeatureAccessMiddleware
{
    public function handle(Request $request, Closure $next, string $featureName)
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
        $feature = Feature::where('name', $featureName)->first();

        if (!$feature) {
            return response()->json([
                'success' => false,
                'message' => 'Feature not found.'
            ], 404);
        }

        $selectedFeatures = $plan->selected_features ?? [];
        
        if (!in_array($feature->id, $selectedFeatures)) {
            return response()->json([
                'success' => false,
                'message' => "This feature ({$featureName}) is not available in your current plan. Please upgrade to access this feature."
            ], 403);
        }

        return $next($request);
    }
}