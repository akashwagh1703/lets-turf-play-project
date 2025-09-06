<?php

namespace App\Http\Controllers;

use App\Models\RevenueModel;
use Illuminate\Http\Request;

class RevenueModelController extends Controller
{
    public function index(Request $request)
    {
        try {
            // Return all revenue models by default
            $revenueModels = RevenueModel::orderBy('price')->get();
            
            return response()->json([
                'success' => true,
                'data' => $revenueModels
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'required|string',
            'price' => 'required|numeric|min:0',
            'duration_type' => 'required|in:daily,weekly,monthly,yearly,lifetime',
            'duration_value' => 'required|integer|min:1',
            'is_free' => 'boolean',
            'max_turfs' => 'required|integer|min:1',
            'max_staff' => 'required|integer|min:1',
            'max_bookings_per_month' => 'required|integer|min:1',
            'selected_features' => 'required|array',
            'status' => 'boolean'
        ]);

        $revenueModel = RevenueModel::create($request->all());
        return response()->json([
            'success' => true,
            'data' => $revenueModel,
            'message' => 'Revenue model created successfully'
        ], 201);
    }

    public function show(RevenueModel $revenueModel)
    {
        return response()->json([
            'success' => true,
            'data' => $revenueModel
        ]);
    }

    public function update(Request $request, RevenueModel $revenueModel)
    {
        $request->validate([
            'name' => 'string|max:255',
            'description' => 'string',
            'price' => 'numeric|min:0',
            'duration_type' => 'in:daily,weekly,monthly,yearly,lifetime',
            'duration_value' => 'integer|min:1',
            'is_free' => 'boolean',
            'max_turfs' => 'integer|min:1',
            'max_staff' => 'integer|min:1',
            'max_bookings_per_month' => 'integer|min:1',
            'selected_features' => 'array',
            'status' => 'boolean'
        ]);

        $revenueModel->update($request->all());
        return response()->json([
            'success' => true,
            'data' => $revenueModel,
            'message' => 'Revenue model updated successfully'
        ]);
    }

    public function destroy(RevenueModel $revenueModel)
    {
        $revenueModel->delete();
        return response()->json([
            'success' => true,
            'message' => 'Revenue model deleted successfully'
        ]);
    }
}