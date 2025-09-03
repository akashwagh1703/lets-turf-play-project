<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use App\Models\Turf;
use Illuminate\Http\Request;

class BookingController extends Controller
{
    public function index(Request $request)
    {
        $user = auth()->user();
        $perPage = $request->get('per_page', 10);
        $includes = explode(',', $request->get('include', ''));
        
        $query = Booking::query();
        
        // Apply role-based filtering
        if ($user->role === 'super_admin') {
            // Super admin can see all bookings
        } elseif ($user->role === 'turf_owner') {
            $turfIds = Turf::where('owner_id', $user->id)->pluck('id');
            $query->whereIn('turf_id', $turfIds);
        } else {
            // Staff or other roles - show all bookings for now
        }
        
        // Apply includes
        $allowedIncludes = ['turf', 'player', 'turf.owner'];
        $validIncludes = array_intersect($includes, $allowedIncludes);
        if (!empty($validIncludes)) {
            $query->with($validIncludes);
        }
        
        // Apply status filter if provided
        if ($request->has('status') && $request->get('status') !== 'all') {
            $query->where('status', $request->get('status'));
        }
        
        // Apply date filter if provided
        if ($request->has('date')) {
            $query->whereDate('date', $request->get('date'));
        }
        
        // Order by latest first
        $query->orderBy('created_at', 'desc');
        
        if ($perPage === 'all') {
            $bookings = $query->get();
            return response()->json(['data' => $bookings]);
        }
        
        $bookings = $query->paginate($perPage);
        return response()->json($bookings);
    }

    public function store(Request $request)
    {
        $request->validate([
            'turf_id' => 'required|exists:turfs,id',
            'booking_type' => 'required|in:online,offline',
            'booking_plan' => 'nullable|in:single,daily,weekly,monthly',
            'date' => 'required|date',
            'start_time' => 'required',
            'end_time' => 'required',
            'customer_name' => 'required_if:booking_type,offline',
            'customer_phone' => 'required_if:booking_type,offline',
            'amount' => 'required|numeric|min:0',
            'advance_amount' => 'nullable|numeric|min:0',
            'plan_duration' => 'nullable|integer|min:1',
            'recurring_days' => 'nullable|array',
        ]);

        // Calculate plan dates
        $bookingPlan = $request->booking_plan ?? 'single';
        $planStartDate = $request->date;
        $planEndDate = $this->calculatePlanEndDate($bookingPlan, $planStartDate, $request->plan_duration ?? 1);
        
        // Calculate amounts
        $amount = $request->amount;
        $advanceAmount = $request->advance_amount ?? 0;
        $remainingAmount = $amount - $advanceAmount;

        $booking = Booking::create([
            'turf_id' => $request->turf_id,
            'user_id' => auth()->id(),
            'booking_type' => $request->booking_type,
            'booking_plan' => $bookingPlan,
            'date' => $request->date,
            'plan_start_date' => $planStartDate,
            'plan_end_date' => $planEndDate,
            'recurring_days' => $request->recurring_days,
            'start_time' => $request->start_time,
            'end_time' => $request->end_time,
            'customer_name' => $request->customer_name,
            'customer_phone' => $request->customer_phone,
            'customer_email' => $request->customer_email,
            'amount' => $amount,
            'advance_amount' => $advanceAmount,
            'remaining_amount' => $remainingAmount,
            'notes' => $request->notes,
            'status' => 'confirmed'
        ]);

        return response()->json($booking->load(['turf']), 201);
    }

    private function calculatePlanEndDate($plan, $startDate, $duration)
    {
        $start = \Carbon\Carbon::parse($startDate);
        
        switch ($plan) {
            case 'daily':
                return $start->addDays($duration - 1)->toDateString();
            case 'weekly':
                return $start->addWeeks($duration)->subDay()->toDateString();
            case 'monthly':
                return $start->addMonths($duration)->subDay()->toDateString();
            default:
                return $startDate;
        }
    }

    public function update(Request $request, $id)
    {
        $booking = Booking::findOrFail($id);
        
        $request->validate([
            'status' => 'in:pending,confirmed,cancelled',
        ]);

        $booking->update($request->only(['status']));
        
        return response()->json($booking->load(['turf', 'user']));
    }

    public function show($id)
    {
        $booking = Booking::with(['turf', 'user'])->findOrFail($id);
        
        $user = auth()->user();
        if ($user->role === 'turf_owner') {
            $turfIds = Turf::where('owner_id', $user->id)->pluck('id');
            if (!$turfIds->contains($booking->turf_id)) {
                return response()->json(['error' => 'Unauthorized'], 403);
            }
        }
        
        return response()->json($booking);
    }

    public function destroy($id)
    {
        $booking = Booking::findOrFail($id);
        $booking->delete();
        
        return response()->json(['message' => 'Booking deleted successfully']);
    }

    public function getAvailableSlots(Request $request)
    {
        $request->validate([
            'turf_id' => 'required|exists:turfs,id',
            'date' => 'required|date'
        ]);

        $turfId = $request->turf_id;
        $date = $request->date;

        // Get all bookings for the selected date and turf
        $bookedSlots = Booking::where('turf_id', $turfId)
            ->where(function($query) use ($date) {
                $query->where('date', $date)
                      ->orWhere(function($q) use ($date) {
                          $q->where('plan_start_date', '<=', $date)
                            ->where('plan_end_date', '>=', $date)
                            ->where('booking_plan', '!=', 'single');
                      });
            })
            ->where('status', '!=', 'cancelled')
            ->select('start_time', 'end_time', 'booking_plan', 'recurring_days')
            ->get();

        // Filter recurring bookings for the specific day
        $filteredSlots = $bookedSlots->filter(function($booking) use ($date) {
            if ($booking->booking_plan === 'weekly' && $booking->recurring_days) {
                $dayOfWeek = \Carbon\Carbon::parse($date)->dayOfWeek;
                return in_array($dayOfWeek, $booking->recurring_days);
            }
            return true;
        });

        // Generate available time slots (6 AM to 11 PM)
        $allSlots = [];
        for ($hour = 6; $hour <= 22; $hour++) {
            $startTime = sprintf('%02d:00', $hour);
            $endTime = sprintf('%02d:00', $hour + 1);
            
            $isBooked = $filteredSlots->contains(function($booking) use ($startTime, $endTime) {
                return $this->timeSlotsOverlap($startTime, $endTime, $booking->start_time, $booking->end_time);
            });
            
            $allSlots[] = [
                'start_time' => $startTime,
                'end_time' => $endTime,
                'display' => date('g:i A', strtotime($startTime)) . ' - ' . date('g:i A', strtotime($endTime)),
                'available' => !$isBooked
            ];
        }

        return response()->json([
            'date' => $date,
            'slots' => $allSlots,
            'booked_count' => $filteredSlots->count()
        ]);
    }

    private function timeSlotsOverlap($start1, $end1, $start2, $end2)
    {
        return $start1 < $end2 && $end1 > $start2;
    }

    public function getBookingStats(Request $request)
    {
        $user = auth()->user();
        $query = Booking::query();
        
        if ($user->role === 'turf_owner') {
            $turfIds = Turf::where('owner_id', $user->id)->pluck('id');
            $query->whereIn('turf_id', $turfIds);
        }
        
        $today = now()->toDateString();
        
        return response()->json([
            'total_bookings' => $query->count(),
            'today_bookings' => $query->whereDate('date', $today)->count(),
            'confirmed_bookings' => $query->where('status', 'confirmed')->count(),
            'pending_bookings' => $query->where('status', 'pending')->count(),
            'cancelled_bookings' => $query->where('status', 'cancelled')->count(),
            'total_revenue' => $query->where('status', 'confirmed')->sum('amount'),
            'pending_amount' => $query->where('status', 'confirmed')->sum('remaining_amount')
        ]);
    }
}