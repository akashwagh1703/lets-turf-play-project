<?php

namespace App\Http\Controllers;

use App\Models\Player;
use Illuminate\Http\Request;

class PlayerController extends Controller
{
    public function index(Request $request)
    {
        $user = auth()->user();
        $perPage = $request->get('per_page', 10);
        
        $query = Player::with(['bookings.turf']);
        
        if ($user->role === 'super_admin') {
            // Super admin can see all players
        } elseif ($user->role === 'turf_owner') {
            // Get players who booked owner's turfs
            $query->whereHas('bookings.turf', function ($q) use ($user) {
                $q->where('owner_id', $user->id);
            });
        } else {
            return response()->json(['error' => 'Unauthorized'], 403);
        }
        
        // Apply status filter if provided
        if ($request->has('status') && $request->get('status') !== 'all') {
            $status = filter_var($request->get('status'), FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE);
            if ($status !== null) {
                $query->where('status', $status);
            }
        }
        
        if ($perPage === 'all') {
            $players = $query->get();
            return response()->json(['data' => $players]);
        }
        
        $players = $query->paginate($perPage);
        return response()->json($players);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:players,email',
            'phone' => 'required|string|max:20',
            'date_of_birth' => 'date',
            'gender' => 'in:male,female,other',
            'address' => 'string',
        ]);

        $player = Player::create($request->all());
        return response()->json($player, 201);
    }

    public function show($id)
    {
        $player = Player::with(['bookings.turf'])->findOrFail($id);
        
        $user = auth()->user();
        if ($user->role === 'turf_owner') {
            // Check if player has bookings with owner's turfs
            $hasBookings = $player->bookings()->whereHas('turf', function ($query) use ($user) {
                $query->where('owner_id', $user->id);
            })->exists();
            
            if (!$hasBookings) {
                return response()->json(['error' => 'Unauthorized'], 403);
            }
        }
        
        return response()->json($player);
    }

    public function update(Request $request, $id)
    {
        if (auth()->user()->role !== 'super_admin') {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $player = Player::findOrFail($id);

        $request->validate([
            'name' => 'string|max:255',
            'email' => 'email|unique:players,email,' . $id,
            'phone' => 'string|max:20',
            'date_of_birth' => 'date',
            'gender' => 'in:male,female,other',
            'address' => 'string',
            'status' => 'boolean',
        ]);

        $player->update($request->all());
        return response()->json($player);
    }

    public function destroy($id)
    {
        if (auth()->user()->role !== 'super_admin') {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $player = Player::findOrFail($id);
        $player->delete();

        return response()->json(['message' => 'Player deleted successfully']);
    }

    public function analytics()
    {
        if (auth()->user()->role !== 'super_admin') {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $analytics = [
            'total_players' => Player::count(),
            'active_players' => Player::where('status', 'active')->count(),
            'top_players' => Player::orderBy('total_spent', 'desc')->limit(10)->get(),
            'recent_players' => Player::latest()->limit(10)->get(),
            'monthly_registrations' => Player::whereMonth('created_at', now()->month)->count(),
        ];

        return response()->json($analytics);
    }
}