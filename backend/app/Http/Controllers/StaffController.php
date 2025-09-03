<?php

namespace App\Http\Controllers;

use App\Models\Staff;
use Illuminate\Http\Request;

class StaffController extends Controller
{
    public function index(Request $request)
    {
        $user = auth()->user();
        $perPage = $request->get('per_page', 10);
        $includes = explode(',', $request->get('include', ''));
        
        $query = Staff::query();
        
        // Apply role-based filtering
        if ($user->role === 'super_admin') {
            // Super admin can see all staff
        } else {
            $query->where('owner_id', $user->id);
        }
        
        // Apply includes
        $allowedIncludes = ['owner', 'owner.turfs'];
        $validIncludes = array_intersect($includes, $allowedIncludes);
        if (!empty($validIncludes)) {
            $query->with($validIncludes);
        }
        
        // Apply status filter if provided
        if ($request->has('status') && $request->get('status') !== 'all') {
            $status = filter_var($request->get('status'), FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE);
            if ($status !== null) {
                $query->where('status', $status);
            }
        }
        
        if ($perPage === 'all') {
            $staff = $query->get();
            return response()->json(['data' => $staff]);
        }
        
        $staff = $query->paginate($perPage);
        return response()->json($staff);
    }

    public function store(Request $request)
    {
        $request->validate([
            'staff_name' => 'required|string|max:255',
            'email' => 'required|email|unique:staff,email',
            'phone' => 'required|string|max:20',
            'position' => 'nullable|string|max:255',
            'salary' => 'nullable|numeric|min:0',
            'shift_timing' => 'nullable|string|max:255',
            'status' => 'boolean',
        ]);

        $staff = Staff::create([
            'owner_id' => auth()->id(),
            'staff_name' => $request->staff_name,
            'email' => $request->email,
            'phone' => $request->phone,
            'position' => $request->position,
            'salary' => $request->salary,
            'shift_timing' => $request->shift_timing,
            'status' => $request->status ?? true,
        ]);

        return response()->json($staff, 201);
    }

    public function show($id)
    {
        $staff = Staff::with('owner')->findOrFail($id);
        
        if (auth()->user()->role !== 'super_admin' && $staff->owner_id !== auth()->id()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }
        
        return response()->json($staff);
    }

    public function update(Request $request, $id)
    {
        $staff = Staff::findOrFail($id);
        
        if (auth()->user()->role !== 'super_admin' && $staff->owner_id !== auth()->id()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $request->validate([
            'staff_name' => 'string|max:255',
            'email' => 'email|unique:staff,email,' . $id,
            'phone' => 'string|max:20',
            'status' => 'boolean',
        ]);

        $staff->update($request->only(['staff_name', 'email', 'phone', 'status']));
        
        return response()->json($staff);
    }

    public function destroy($id)
    {
        $staff = Staff::findOrFail($id);
        
        if (auth()->user()->role !== 'super_admin' && $staff->owner_id !== auth()->id()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }
        
        $staff->delete();
        
        return response()->json(['message' => 'Staff deleted successfully']);
    }
}