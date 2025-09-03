<?php

namespace App\Http\Controllers;

use App\Models\RevenueModel;
use Illuminate\Http\Request;

class RevenueModelController extends Controller
{
    public function index(Request $request)
    {
        try {
            $query = RevenueModel::query();
            
            if ($request->has('status') && $request->status !== 'all') {
                $status = filter_var($request->status, FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE);
                if ($status !== null) {
                    $query->where('status', $status);
                }
            }
            
            if ($request->has('type')) {
                $query->where('type', $request->type);
            }
            
            $revenueModels = $query->orderBy('sort_order')->orderBy('monthly_price')->get();
            
            // Format features as array
            $revenueModels->transform(function ($model) {
                $model->features_array = json_decode($model->features, true) ?? [];
                $model->yearly_discount = $model->monthly_price > 0 ? round((($model->monthly_price * 12 - $model->yearly_price) / ($model->monthly_price * 12)) * 100, 1) : 0;
                return $model;
            });
            
            return response()->json($revenueModels);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'required|string',
            'features' => 'required|array',
            'type' => 'required|in:subscription,commission,fixed',
            'monthly_price' => 'required|numeric|min:0',
            'yearly_price' => 'required|numeric|min:0',
            'commission_rate' => 'nullable|numeric|min:0|max:100',
            'turf_limit' => 'nullable|integer|min:1',
            'staff_limit' => 'nullable|integer|min:1',
            'booking_limit' => 'nullable|integer|min:1',
            'is_popular' => 'boolean',
            'sort_order' => 'integer|min:0',
            'status' => 'boolean'
        ]);

        $data = $request->all();
        $data['price'] = $data['monthly_price']; // Keep for compatibility
        $data['features'] = json_encode($data['features']);
        $data['billing_cycle'] = 'monthly';

        $revenueModel = RevenueModel::create($data);
        return response()->json($revenueModel, 201);
    }

    public function show(RevenueModel $revenueModel)
    {
        return response()->json($revenueModel);
    }

    public function update(Request $request, RevenueModel $revenueModel)
    {
        $request->validate([
            'name' => 'string|max:255',
            'description' => 'string',
            'features' => 'array',
            'type' => 'in:subscription,commission,fixed',
            'monthly_price' => 'numeric|min:0',
            'yearly_price' => 'numeric|min:0',
            'commission_rate' => 'nullable|numeric|min:0|max:100',
            'turf_limit' => 'nullable|integer|min:1',
            'staff_limit' => 'nullable|integer|min:1',
            'booking_limit' => 'nullable|integer|min:1',
            'status' => 'boolean',
            'is_popular' => 'boolean',
            'sort_order' => 'integer|min:0'
        ]);

        $data = $request->all();
        
        if (isset($data['features'])) {
            $data['features'] = json_encode($data['features']);
        }
        
        if (isset($data['monthly_price'])) {
            $data['price'] = $data['monthly_price']; // Keep for compatibility
        }

        $revenueModel->update($data);
        return response()->json($revenueModel);
    }

    public function destroy(RevenueModel $revenueModel)
    {
        $revenueModel->delete();
        return response()->json(['message' => 'Revenue model deleted successfully']);
    }
}