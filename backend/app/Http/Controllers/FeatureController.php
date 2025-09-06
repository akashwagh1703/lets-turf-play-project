<?php

namespace App\Http\Controllers;

use App\Models\Feature;
use Illuminate\Http\Request;

class FeatureController extends Controller
{
    public function index()
    {
        return response()->json(Feature::all());
    }
    
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string'
        ]);
        
        $feature = Feature::create($request->only(['name', 'description']));
        return response()->json(['success' => true, 'data' => $feature], 201);
    }
    
    public function update(Request $request, Feature $feature)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string'
        ]);
        
        $feature->update($request->only(['name', 'description']));
        return response()->json(['success' => true, 'data' => $feature]);
    }
    
    public function destroy(Feature $feature)
    {
        $feature->delete();
        return response()->json(['success' => true, 'message' => 'Feature deleted']);
    }
}