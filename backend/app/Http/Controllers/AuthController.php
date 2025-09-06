<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\RevenueModel;
use App\Models\RevenueModelAssignment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Tymon\JWTAuth\Facades\JWTAuth;
use Illuminate\Support\Facades\Auth;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $credentials = $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        if (!$token = Auth::guard('api')->attempt($credentials)) {
            return response()->json(['error' => 'Invalid credentials'], 401);
        }

        $user = Auth::guard('api')->user();
        return response()->json([
            'access_token' => $token,
            'token_type' => 'bearer',
            'user' => $user,
            'role' => $user->role
        ]);
    }

    public function register(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:6',
            'role' => 'required|in:super_admin,turf_owner,staff',
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => $request->role,
        ]);

        // Auto-assign free plan to new turf owners
        if ($request->role === 'turf_owner') {
            $freePlan = RevenueModel::where('is_free', true)->first();
            if ($freePlan) {
                RevenueModelAssignment::create([
                    'owner_id' => $user->id,
                    'revenue_model_id' => $freePlan->id,
                    'start_date' => now(),
                    'end_date' => null,
                    'is_free_assignment' => true,
                    'status' => 'active'
                ]);
            }
        }

        $token = JWTAuth::fromUser($user);

        return response()->json([
            'token' => $token,
            'user' => $user,
            'role' => $user->role
        ], 201);
    }

    public function logout()
    {
        JWTAuth::invalidate(JWTAuth::getToken());
        return response()->json(['message' => 'Successfully logged out']);
    }

    public function me()
    {
        return response()->json(auth()->user());
    }
}