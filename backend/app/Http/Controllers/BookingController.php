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
            return response()->json([
                'success' => true,
                'data' => $bookings
            ]);
        }
        
        $bookings = $query->paginate($perPage);
        return response()->json($bookings);
    }

    public function store(Request $request)
    {
        $request->validate([
            'turf_id' => 'required|exists:turfs,id',
            'booking_type' => 'required|in:online,offline',
            'booking_plan' => 'nullable|in:single,daily,weekly,monthly,yearly',
            'date' => 'required|date|after_or_equal:today',
            'start_time' => 'nullable|date_format:H:i',
            'end_time' => 'nullable|date_format:H:i',
            'selected_slots' => 'nullable|array|min:1',
            'selected_slots.*.start_time' => 'required_with:selected_slots|date_format:H:i',
            'selected_slots.*.end_time' => 'required_with:selected_slots|date_format:H:i',
            'customer_name' => 'required_if:booking_type,offline|string|max:255',
            'customer_phone' => 'required_if:booking_type,offline|string|max:20',
            'customer_email' => 'nullable|email|max:255',
            'amount' => 'required|numeric|min:1',
            'advance_amount' => 'nullable|numeric|min:0|lte:amount',
            'plan_duration' => 'nullable|integer|min:1|max:12',
            'recurring_days' => 'nullable|array|max:7',
            'recurring_days.*' => 'integer|between:0,6',
            'notes' => 'nullable|string|max:1000'
        ]);

        // Check if user owns the turf (for turf owners)
        $user = auth()->user();
        if ($user->role === 'turf_owner') {
            $turf = Turf::where('id', $request->turf_id)
                        ->where('owner_id', $user->id)
                        ->first();
            if (!$turf) {
                return response()->json([
                    'success' => false,
                    'message' => 'You can only create bookings for your own turfs'
                ], 403);
            }
        }

        // Calculate plan dates
        $bookingPlan = $request->booking_plan ?? 'single';
        $planStartDate = $request->date;
        $planEndDate = $this->calculatePlanEndDate($bookingPlan, $planStartDate, $request->plan_duration ?? 1);
        
        // Handle selected slots or single slot
        $slotsToBook = $request->selected_slots;
        if (!$slotsToBook && $request->start_time && $request->end_time) {
            $slotsToBook = [[
                'start_time' => $request->start_time,
                'end_time' => $request->end_time
            ]];
        }
        
        if (!$slotsToBook || empty($slotsToBook)) {
            return response()->json([
                'success' => false,
                'message' => 'Please select at least one time slot'
            ], 422);
        }
        
        // Validate slot times
        foreach ($slotsToBook as $slot) {
            if (strtotime($slot['start_time']) >= strtotime($slot['end_time'])) {
                return response()->json([
                    'success' => false,
                    'message' => 'Start time must be before end time for all slots'
                ], 422);
            }
        }
        
        // Check for conflicts in all selected slots
        $existingBookings = Booking::where('turf_id', $request->turf_id)
            ->where('date', $request->date)
            ->where('status', '!=', 'cancelled')
            ->get();
            
        foreach ($slotsToBook as $slot) {
            foreach ($existingBookings as $booking) {
                $bookedSlots = $booking->selected_slots ?: [[
                    'start_time' => $booking->start_time,
                    'end_time' => $booking->end_time
                ]];
                
                foreach ($bookedSlots as $bookedSlot) {
                    if ($this->timeSlotsOverlap(
                        $slot['start_time'], 
                        $slot['end_time'], 
                        $bookedSlot['start_time'], 
                        $bookedSlot['end_time']
                    )) {
                        return response()->json([
                            'success' => false,
                            'message' => "Time slot {$slot['start_time']}-{$slot['end_time']} is already booked."
                        ], 422);
                    }
                }
            }
        }

        // Calculate amounts
        $amount = $request->amount;
        $advanceAmount = $request->advance_amount ?? 0;
        $remainingAmount = $amount - $advanceAmount;

        // Create booking with first slot times (for compatibility)
        $firstSlot = $slotsToBook[0];
        
        try {
            $booking = new Booking();
            $booking->turf_id = (int)$request->turf_id;
            $booking->user_id = auth()->id();
            $booking->booking_type = $request->booking_type;
            $booking->booking_plan = $bookingPlan;
            $booking->date = $request->date;
            $booking->plan_start_date = $planStartDate;
            $booking->plan_end_date = $planEndDate;
            $booking->start_time = $firstSlot['start_time'];
            $booking->end_time = $firstSlot['end_time'];
            $booking->selected_slots = $slotsToBook;
            $booking->customer_name = $request->customer_name ?: null;
            $booking->customer_phone = $request->customer_phone ?: null;
            $booking->customer_email = $request->customer_email ?: null;
            $booking->amount = $amount;
            $booking->advance_amount = $advanceAmount;
            $booking->remaining_amount = $remainingAmount;
            $booking->notes = $request->notes;
            $booking->status = 'confirmed';
            $booking->save();
        } catch (\Exception $e) {
            \Log::error('Booking creation failed: ' . $e->getMessage(), [
                'request_data' => $request->all(),
                'user_id' => auth()->id(),
                'trace' => $e->getTraceAsString()
            ]);
            
            $errorMessage = 'Failed to create booking. Please try again.';
            if (str_contains($e->getMessage(), 'Duplicate entry')) {
                $errorMessage = 'This time slot is already booked.';
            } elseif (str_contains($e->getMessage(), 'foreign key constraint')) {
                $errorMessage = 'Invalid turf or user reference.';
            }
            
            return response()->json([
                'success' => false,
                'message' => $errorMessage
            ], 500);
        }

        return response()->json([
            'success' => true,
            'data' => $booking->load(['turf']),
            'message' => 'Booking created successfully'
        ], 201);
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
            case 'yearly':
                return $start->addYears($duration)->subDay()->toDateString();
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
        
        return response()->json([
            'success' => true,
            'data' => $booking->load(['turf', 'user']),
            'message' => 'Booking updated successfully'
        ]);
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
        
        return response()->json([
            'success' => true,
            'data' => $booking
        ]);
    }

    public function destroy($id)
    {
        $booking = Booking::findOrFail($id);
        $booking->delete();
        
        return response()->json([
            'success' => true,
            'message' => 'Booking deleted successfully'
        ]);
    }

    public function getAvailableSlots(Request $request, $turf_id)
    {
        try {
            $request->validate([
                'date' => 'required|date'
            ]);

            // Validate turf exists
            $turf = Turf::findOrFail($turf_id);
            
            $turfId = $turf_id;
            $date = $request->date;

            // Get all bookings for the selected date and turf
            $bookedSlots = Booking::where('turf_id', $turfId)
                ->where('date', $date)
                ->where('status', '!=', 'cancelled')
                ->get();
                
            // Flatten selected_slots from all bookings
            $allBookedSlots = collect();
            foreach ($bookedSlots as $booking) {
                if ($booking->selected_slots && is_array($booking->selected_slots)) {
                    foreach ($booking->selected_slots as $slot) {
                        if (isset($slot['start_time']) && isset($slot['end_time'])) {
                            $allBookedSlots->push((object)$slot);
                        }
                    }
                } elseif ($booking->start_time && $booking->end_time) {
                    $allBookedSlots->push((object)[
                        'start_time' => $booking->start_time,
                        'end_time' => $booking->end_time
                    ]);
                }
            }

            // Generate available time slots (24 hours)
            $allSlots = [];
            for ($hour = 0; $hour < 24; $hour++) {
                $startTime = sprintf('%02d:00', $hour);
                $endTime = sprintf('%02d:00', ($hour + 1) % 24);
                
                $isBooked = $allBookedSlots->contains(function($booking) use ($startTime, $endTime) {
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
                'success' => true,
                'date' => $date,
                'slots' => $allSlots,
                'booked_count' => $allBookedSlots->count(),
                'turf_name' => $turf->turf_name
            ]);
        } catch (\Exception $e) {
            \Log::error('Error fetching available slots: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch available slots',
                'slots' => []
            ], 500);
        }
    }

    private function timeSlotsOverlap($start1, $end1, $start2, $end2)
    {
        $start1Time = strtotime($start1);
        $end1Time = strtotime($end1);
        $start2Time = strtotime($start2);
        $end2Time = strtotime($end2);
        
        return $start1Time < $end2Time && $end1Time > $start2Time;
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
    
    public function testBooking(Request $request)
    {
        try {
            $booking = new Booking();
            $booking->turf_id = 1;
            $booking->user_id = auth()->id();
            $booking->booking_type = 'offline';
            $booking->booking_plan = 'single';
            $booking->date = now()->addDay()->toDateString();
            $booking->start_time = '10:00';
            $booking->end_time = '11:00';
            $booking->selected_slots = [['start_time' => '10:00', 'end_time' => '11:00']];
            $booking->customer_name = 'Test Customer';
            $booking->customer_phone = '1234567890';
            $booking->amount = 500;
            $booking->status = 'confirmed';
            $booking->save();
            
            return response()->json([
                'success' => true,
                'message' => 'Test booking created successfully',
                'booking' => $booking
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Test booking failed: ' . $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ], 500);
        }
    }
}