<?php

namespace App\Http\Controllers\Player;

use App\Http\Controllers\Controller;
use App\Models\Turf;
use App\Models\Booking;
use Illuminate\Http\Request;
use Carbon\Carbon;

class PlayerTurfController extends Controller
{
    public function index(Request $request)
    {
        $query = Turf::where('status', true)->with('owner');
        
        // Search by name or location
        if ($request->search) {
            $query->where(function($q) use ($request) {
                $q->where('turf_name', 'ILIKE', '%' . $request->search . '%')
                  ->orWhere('location', 'ILIKE', '%' . $request->search . '%');
            });
        }
        
        // Filter by location
        if ($request->location) {
            $query->where('location', 'ILIKE', '%' . $request->location . '%');
        }
        
        // Filter by sport type
        if ($request->sport_type) {
            $query->where('sport_type', $request->sport_type);
        }
        
        // Filter by price range
        if ($request->min_price) {
            $query->where('price_per_hour', '>=', $request->min_price);
        }
        if ($request->max_price) {
            $query->where('price_per_hour', '<=', $request->max_price);
        }
        
        // Filter by capacity
        if ($request->min_capacity) {
            $query->where('capacity', '>=', $request->min_capacity);
        }
        
        // Filter by facilities
        if ($request->facilities) {
            $facilities = explode(',', $request->facilities);
            foreach ($facilities as $facility) {
                $query->where($facility, true);
            }
        }
        
        $turfs = $query->paginate($request->per_page ?? 12);
        
        return response()->json([
            'success' => true,
            'data' => $turfs
        ]);
    }

    public function show($id)
    {
        $turf = Turf::where('status', true)
            ->with(['owner', 'bookings' => function($query) {
                $query->where('date', '>=', now()->toDateString())
                      ->where('status', '!=', 'cancelled');
            }])
            ->findOrFail($id);
            
        return response()->json([
            'success' => true,
            'data' => $turf
        ]);
    }

    public function availability(Request $request, $id)
    {
        $turf = Turf::findOrFail($id);
        $date = $request->date ?? now()->toDateString();
        
        // Get existing bookings for the date
        $bookings = Booking::where('turf_id', $id)
            ->where('date', $date)
            ->where('status', '!=', 'cancelled')
            ->get();
        
        // Generate time slots (6 AM to 11 PM)
        $slots = [];
        for ($hour = 6; $hour < 23; $hour++) {
            $startTime = sprintf('%02d:00', $hour);
            $endTime = sprintf('%02d:00', $hour + 1);
            
            // Check if slot is booked
            $isBooked = $bookings->where('start_time', $startTime)->where('end_time', $endTime)->count() > 0;
            
            $slots[] = [
                'start_time' => $startTime,
                'end_time' => $endTime,
                'is_available' => !$isBooked,
                'price' => $turf->price_per_hour ?? 1000
            ];
        }
        
        return response()->json([
            'success' => true,
            'data' => [
                'date' => $date,
                'slots' => $slots
            ]
        ]);
    }

    public function search(Request $request)
    {
        $query = Turf::where('status', true);
        
        if ($request->q) {
            $query->where(function($q) use ($request) {
                $q->where('turf_name', 'ILIKE', '%' . $request->q . '%')
                  ->orWhere('location', 'ILIKE', '%' . $request->q . '%')
                  ->orWhere('sport_type', 'ILIKE', '%' . $request->q . '%');
            });
        }
        
        $turfs = $query->limit(10)->get(['id', 'turf_name', 'location', 'sport_type']);
        
        return response()->json([
            'success' => true,
            'data' => $turfs
        ]);
    }
}