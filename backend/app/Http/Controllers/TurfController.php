<?php

namespace App\Http\Controllers;

use App\Models\Turf;
use Illuminate\Http\Request;

class TurfController extends Controller
{
    public function index(Request $request)
    {
        $user = auth()->user();
        $perPage = $request->get('per_page', 10);
        $includes = explode(',', $request->get('include', ''));
        
        $query = Turf::query();
        
        // Apply role-based filtering
        if ($user->role === 'super_admin') {
            // Super admin can see all turfs
        } else {
            $query->where('owner_id', $user->id);
        }
        
        // Apply includes
        $allowedIncludes = ['owner', 'bookings', 'bookings.player'];
        $validIncludes = array_intersect($includes, $allowedIncludes);
        if (!empty($validIncludes)) {
            $query->with($validIncludes);
        }
        
        // Apply search if provided
        if ($request->has('search')) {
            $search = $request->get('search');
            $query->where(function($q) use ($search) {
                $q->where('turf_name', 'like', "%{$search}%")
                  ->orWhere('location', 'like', "%{$search}%");
            });
        }
        
        // Apply status filter if provided
        if ($request->has('status') && $request->get('status') !== 'all') {
            $status = filter_var($request->get('status'), FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE);
            if ($status !== null) {
                $query->where('status', $status);
            }
        }
        
        if ($perPage === 'all') {
            $turfs = $query->get();
            return response()->json(['data' => $turfs]);
        }
        
        $turfs = $query->paginate($perPage);
        return response()->json($turfs);
    }

    public function store(Request $request)
    {
        $request->validate([
            'turf_name' => 'required|string|max:255',
            'location' => 'required|string',
            'capacity' => 'required|integer|min:1',
            'price_per_hour' => 'required|numeric|min:0',
            'contact_number' => 'nullable|string|max:20',
            'email' => 'nullable|email|max:255',
            'opening_time' => 'nullable',
            'closing_time' => 'nullable',
            'turf_type' => 'nullable|string',
            'surface_type' => 'nullable|string',
            'size' => 'nullable|string|max:100',
            'parking_available' => 'nullable|boolean',
            'changing_rooms' => 'nullable|boolean',
            'washrooms' => 'nullable|boolean',
            'lighting' => 'nullable|boolean',
            'water_facility' => 'nullable|boolean',
            'first_aid' => 'nullable|boolean',
            'security' => 'nullable|boolean',
            'description' => 'nullable|string',
            'rules' => 'nullable|string',
            'facilities' => 'nullable|array',
            'images' => 'nullable|array',
            'videos' => 'nullable|array',
            'documents' => 'nullable|array',
            'hashtags' => 'nullable|array',
            'status' => 'nullable|boolean'
        ]);

        $turf = Turf::create([
            'owner_id' => auth()->id(),
            'turf_name' => $request->turf_name,
            'location' => $request->location,
            'capacity' => $request->capacity,
            'price_per_hour' => $request->price_per_hour,
            'contact_number' => $request->contact_number,
            'email' => $request->email,
            'opening_time' => $request->opening_time,
            'closing_time' => $request->closing_time,
            'turf_type' => $request->turf_type,
            'surface_type' => $request->surface_type,
            'size' => $request->size,
            'parking_available' => $request->parking_available ?? false,
            'changing_rooms' => $request->changing_rooms ?? false,
            'washrooms' => $request->washrooms ?? false,
            'lighting' => $request->lighting ?? false,
            'water_facility' => $request->water_facility ?? false,
            'first_aid' => $request->first_aid ?? false,
            'security' => $request->security ?? false,
            'description' => $request->description,
            'rules' => $request->rules,
            'facilities' => is_array($request->facilities) ? implode(',', $request->facilities) : $request->facilities,
            'images' => $request->images,
            'videos' => $request->videos,
            'documents' => $request->documents,
            'hashtags' => is_array($request->hashtags) ? implode(',', $request->hashtags) : $request->hashtags,
            'status' => $request->status ?? true
        ]);

        return response()->json($turf, 201);
    }

    public function show($id)
    {
        $turf = Turf::with('owner', 'bookings')->findOrFail($id);
        
        if (auth()->user()->role !== 'super_admin' && $turf->owner_id !== auth()->id()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }
        
        return response()->json($turf);
    }

    public function update(Request $request, $id)
    {
        $turf = Turf::findOrFail($id);
        
        if (auth()->user()->role !== 'super_admin' && $turf->owner_id !== auth()->id()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $request->validate([
            'turf_name' => 'nullable|string|max:255',
            'location' => 'nullable|string',
            'capacity' => 'nullable|integer|min:1',
            'price_per_hour' => 'nullable|numeric|min:0',
            'contact_number' => 'nullable|string|max:20',
            'email' => 'nullable|email|max:255',
            'opening_time' => 'nullable',
            'closing_time' => 'nullable',
            'turf_type' => 'nullable|string',
            'surface_type' => 'nullable|string',
            'size' => 'nullable|string|max:100',
            'parking_available' => 'nullable|boolean',
            'changing_rooms' => 'nullable|boolean',
            'washrooms' => 'nullable|boolean',
            'lighting' => 'nullable|boolean',
            'water_facility' => 'nullable|boolean',
            'first_aid' => 'nullable|boolean',
            'security' => 'nullable|boolean',
            'description' => 'nullable|string',
            'rules' => 'nullable|string',
            'facilities' => 'nullable|array',
            'images' => 'nullable|array',
            'videos' => 'nullable|array',
            'documents' => 'nullable|array',
            'hashtags' => 'nullable|array',
            'status' => 'nullable|boolean'
        ]);

        $turf->update($request->only([
            'turf_name', 'location', 'capacity', 'price_per_hour', 'contact_number', 'email',
            'opening_time', 'closing_time', 'turf_type', 'surface_type', 'size',
            'parking_available', 'changing_rooms', 'washrooms', 'lighting', 'water_facility',
            'first_aid', 'security', 'description', 'rules', 'facilities', 'images',
            'videos', 'documents', 'hashtags', 'status'
        ]));
        
        return response()->json($turf);
    }

    public function destroy($id)
    {
        $turf = Turf::findOrFail($id);
        
        if (auth()->user()->role !== 'super_admin' && $turf->owner_id !== auth()->id()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }
        
        $turf->delete();
        
        return response()->json(['message' => 'Turf deleted successfully']);
    }

    public function getTurfStats()
    {
        $user = auth()->user();
        $query = Turf::query();
        
        if ($user->role !== 'super_admin') {
            $query->where('owner_id', $user->id);
        }
        
        $totalTurfs = $query->count();
        $activeTurfs = $query->where('status', true)->count();
        $inactiveTurfs = $query->where('status', false)->count();
        
        return response()->json([
            'total_turfs' => $totalTurfs,
            'active_turfs' => $activeTurfs,
            'inactive_turfs' => $inactiveTurfs
        ]);
    }
}