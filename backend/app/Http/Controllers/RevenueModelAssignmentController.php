<?php

namespace App\Http\Controllers;

use App\Models\RevenueModelAssignment;
use Illuminate\Http\Request;

class RevenueModelAssignmentController extends Controller
{
    public function index()
    {
        $assignments = RevenueModelAssignment::with(['owner', 'revenueModel'])->get();
        return response()->json($assignments);
    }
    
    public function store(Request $request)
    {
        $request->validate([
            'owner_id' => 'required|exists:users,id',
            'revenue_model_id' => 'required|exists:revenue_models,id'
        ]);
        
        // Deactivate existing assignments
        RevenueModelAssignment::where('owner_id', $request->owner_id)
            ->update(['status' => 'inactive']);
        
        $assignment = RevenueModelAssignment::create([
            'owner_id' => $request->owner_id,
            'revenue_model_id' => $request->revenue_model_id,
            'start_date' => now(),
            'status' => 'active'
        ]);
        
        return response()->json(['success' => true, 'data' => $assignment], 201);
    }
}