<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Subscription;
use App\Models\RevenueModel;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class TurfOwnerController extends OptimizedBaseController
{
    public function index(Request $request)
    {
        if (auth()->user()->role !== 'super_admin') {
            return $this->errorResponse('Unauthorized', 403);
        }

        $cacheKey = 'turf_owners_' . md5(serialize($request->all()));
        
        $query = $this->buildQuery(User::where('role', 'turf_owner'), $request)
            ->with(['turfs', 'subscriptions.revenueModel']);

        return Cache::remember($cacheKey, 300, function () use ($query, $request) {
            return $this->paginateResponse($query, $request);
        });
    }

    protected function getAllowedFilters(): array
    {
        return ['name', 'email', 'created_at'];
    }

    protected function getAllowedSorts(): array
    {
        return ['name', 'email', 'created_at'];
    }

    protected function getAllowedIncludes(): array
    {
        return ['turfs', 'subscriptions', 'subscriptions.revenueModel'];
    }

    public function store(Request $request)
    {
        if (auth()->user()->role !== 'super_admin') {
            return $this->errorResponse('Unauthorized', 403);
        }

        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:6',
            'phone' => 'nullable|string|max:20',
            'status' => 'boolean',
            'revenue_model_id' => 'required|exists:revenue_models,id',
        ]);

        $owner = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'phone' => $request->phone,
            'role' => 'turf_owner',
        ]);

        // Create subscription
        $revenueModel = RevenueModel::find($request->revenue_model_id);
        Subscription::create([
            'owner_id' => $owner->id,
            'revenue_model_id' => $request->revenue_model_id,
            'start_date' => now(),
            'end_date' => now()->addYear(),
            'amount_paid' => $revenueModel->monthly_fee * 12,
        ]);

        Cache::forget('turf_owners_*');
        Log::info('Turf owner created', ['owner_id' => $owner->id]);
        
        return $this->successResponse($owner->load(['subscriptions.revenueModel']), 'Turf owner created successfully', 201);
    }

    public function show($id)
    {
        if (auth()->user()->role !== 'super_admin') {
            return $this->errorResponse('Unauthorized', 403);
        }

        $owner = User::where('role', 'turf_owner')
            ->with(['turfs', 'subscriptions.revenueModel'])
            ->findOrFail($id);

        return $this->successResponse($owner);
    }

    public function update(Request $request, $id)
    {
        if (auth()->user()->role !== 'super_admin') {
            return $this->errorResponse('Unauthorized', 403);
        }

        $owner = User::where('role', 'turf_owner')->findOrFail($id);

        $request->validate([
            'name' => 'string|max:255',
            'email' => 'email|unique:users,email,' . $id,
            'password' => 'nullable|string|min:6',
            'phone' => 'nullable|string|max:20',
            'status' => 'boolean',
        ]);

        $updateData = $request->only(['name', 'email', 'phone', 'status']);
        if ($request->password) {
            $updateData['password'] = Hash::make($request->password);
        }

        $owner->update($updateData);
        
        Cache::forget('turf_owners_*');
        Log::info('Turf owner updated', ['owner_id' => $owner->id]);
        
        return $this->successResponse($owner, 'Turf owner updated successfully');
    }

    public function destroy($id)
    {
        if (auth()->user()->role !== 'super_admin') {
            return $this->errorResponse('Unauthorized', 403);
        }

        $owner = User::where('role', 'turf_owner')->findOrFail($id);
        $owner->delete();

        Cache::forget('turf_owners_*');
        Log::info('Turf owner deleted', ['owner_id' => $id]);
        
        return $this->successResponse(null, 'Turf owner deleted successfully');
    }
}