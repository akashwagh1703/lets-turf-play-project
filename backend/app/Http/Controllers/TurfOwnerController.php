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
            'phone' => 'nullable|string|regex:/^[+]?[\d\s\-()]{10,15}$/',
            'business_name' => 'nullable|string|max:255',
            'business_description' => 'nullable|string|max:1000',
            'business_logo' => 'nullable|string',
            'business_address' => 'nullable|string|max:500',
            'business_type' => 'nullable|string|in:individual,partnership,private_limited,llp',
            'gst_number' => 'nullable|string|regex:/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/',
            'pan_number' => 'nullable|string|regex:/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/',
            'bank_account' => 'nullable|string|regex:/^[0-9]{9,18}$/',
            'bank_ifsc' => 'nullable|string|regex:/^[A-Z]{4}0[A-Z0-9]{6}$/',
            'status' => 'boolean',
            'revenue_model_id' => 'required|exists:revenue_models,id',
        ], [
            'name.required' => 'Full name is required',
            'email.required' => 'Email address is required',
            'email.email' => 'Please enter a valid email address',
            'email.unique' => 'This email address is already registered',
            'password.required' => 'Password is required',
            'password.min' => 'Password must be at least 6 characters',
            'phone.regex' => 'Please enter a valid phone number',
            'business_description.max' => 'Business description must not exceed 1000 characters',
            'business_address.max' => 'Business address must not exceed 500 characters',
            'gst_number.regex' => 'Please enter a valid GST number',
            'pan_number.regex' => 'Please enter a valid PAN number',
            'bank_account.regex' => 'Please enter a valid bank account number',
            'bank_ifsc.regex' => 'Please enter a valid IFSC code',
            'revenue_model_id.required' => 'Revenue model is required',
            'revenue_model_id.exists' => 'Selected revenue model is invalid',
        ]);

        $owner = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'phone' => $request->phone,
            'business_name' => $request->business_name,
            'business_description' => $request->business_description,
            'business_logo' => $request->business_logo,
            'business_address' => $request->business_address,
            'business_type' => $request->business_type,
            'gst_number' => $request->gst_number,
            'pan_number' => $request->pan_number,
            'bank_account' => $request->bank_account,
            'bank_ifsc' => $request->bank_ifsc,
            'status' => $request->status ?? true,
            'role' => 'turf_owner',
        ]);

        // Create subscription
        $revenueModel = RevenueModel::find($request->revenue_model_id);
        if ($revenueModel) {
            Subscription::create([
                'owner_id' => $owner->id,
                'revenue_model_id' => $request->revenue_model_id,
                'start_date' => now(),
                'end_date' => now()->addYear(),
                'amount_paid' => $revenueModel->price * ($revenueModel->billing_cycle === 'yearly' ? 1 : 12),
                'status' => 'active',
            ]);
        }

        Cache::forget('turf_owners_*');
        Log::info('Turf owner created', ['owner_id' => $owner->id]);
        
        return $this->successResponse($owner->load(['subscriptions.revenueModel']), 'Turf owner created successfully', 201);
    }

    public function show($id)
    {
        if (auth()->user()->role !== 'super_admin') {
            return $this->errorResponse('Unauthorized', 403);
        }

        try {
            $owner = User::where('role', 'turf_owner')
                ->with(['turfs', 'subscriptions.revenueModel'])
                ->findOrFail($id);

            // Log the response for debugging
            Log::info('Turf owner show response', ['owner' => $owner->toArray()]);

            return $this->successResponse($owner);
        } catch (\Exception $e) {
            Log::error('Error fetching turf owner', ['id' => $id, 'error' => $e->getMessage()]);
            return $this->errorResponse('Turf owner not found', 404);
        }
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
            'phone' => 'nullable|string|regex:/^[+]?[\d\s\-()]{10,15}$/',
            'business_name' => 'nullable|string|max:255',
            'business_description' => 'nullable|string|max:1000',
            'business_logo' => 'nullable|string',
            'business_address' => 'nullable|string|max:500',
            'business_type' => 'nullable|string|in:individual,partnership,private_limited,llp',
            'gst_number' => 'nullable|string|regex:/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/',
            'pan_number' => 'nullable|string|regex:/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/',
            'bank_account' => 'nullable|string|regex:/^[0-9]{9,18}$/',
            'bank_ifsc' => 'nullable|string|regex:/^[A-Z]{4}0[A-Z0-9]{6}$/',
            'status' => 'boolean',
            'revenue_model_id' => 'nullable|exists:revenue_models,id',
        ], [
            'email.email' => 'Please enter a valid email address',
            'email.unique' => 'This email address is already registered',
            'password.min' => 'Password must be at least 6 characters',
            'phone.regex' => 'Please enter a valid phone number',
            'business_description.max' => 'Business description must not exceed 1000 characters',
            'business_address.max' => 'Business address must not exceed 500 characters',
            'gst_number.regex' => 'Please enter a valid GST number',
            'pan_number.regex' => 'Please enter a valid PAN number',
            'bank_account.regex' => 'Please enter a valid bank account number',
            'bank_ifsc.regex' => 'Please enter a valid IFSC code',
            'revenue_model_id.exists' => 'Selected revenue model is invalid',
        ]);

        $updateData = $request->only([
            'name', 'email', 'phone', 'business_name', 'business_description',
            'business_logo', 'business_address', 'business_type', 'gst_number', 
            'pan_number', 'bank_account', 'bank_ifsc', 'status'
        ]);
        
        // Handle revenue_model_id separately for subscription update
        $revenueModelId = $request->input('revenue_model_id');
        
        // Remove empty strings and convert to null
        $updateData = array_map(function($value) {
            return $value === '' ? null : $value;
        }, $updateData);
        
        if ($request->filled('password')) {
            $updateData['password'] = Hash::make($request->password);
        }

        $owner->update($updateData);
        
        // Update subscription if revenue_model_id is provided
        if ($revenueModelId) {
            $revenueModel = RevenueModel::find($revenueModelId);
            if ($revenueModel) {
                // Update existing subscription or create new one
                $subscription = $owner->subscriptions()->where('status', 'active')->first();
                if ($subscription) {
                    $subscription->update([
                        'revenue_model_id' => $revenueModelId,
                        'amount_paid' => $revenueModel->price * ($revenueModel->billing_cycle === 'yearly' ? 1 : 12),
                    ]);
                } else {
                    Subscription::create([
                        'owner_id' => $owner->id,
                        'revenue_model_id' => $revenueModelId,
                        'start_date' => now(),
                        'end_date' => now()->addYear(),
                        'amount_paid' => $revenueModel->price * ($revenueModel->billing_cycle === 'yearly' ? 1 : 12),
                        'status' => 'active',
                    ]);
                }
            }
        }
        
        Cache::forget('turf_owners_*');
        Log::info('Turf owner updated', ['owner_id' => $owner->id]);
        
        return $this->successResponse($owner->fresh()->load(['turfs', 'subscriptions.revenueModel']), 'Turf owner updated successfully');
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