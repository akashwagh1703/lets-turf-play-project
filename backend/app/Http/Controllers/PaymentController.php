<?php

namespace App\Http\Controllers;

use App\Models\Payment;
use App\Models\Booking;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;

class PaymentController extends Controller
{
    public function createPayment(Request $request)
    {
        $request->validate([
            'booking_id' => 'required|exists:bookings,id',
            'payment_method' => 'required|string',
            'gateway' => 'required|in:razorpay,stripe,payu'
        ]);

        $booking = Booking::findOrFail($request->booking_id);
        
        // Check if user owns the booking
        if ($booking->user_id !== Auth::id()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $payment = Payment::create([
            'booking_id' => $booking->id,
            'user_id' => Auth::id(),
            'amount' => $booking->total_amount,
            'currency' => 'INR',
            'payment_method' => $request->payment_method,
            'gateway' => $request->gateway,
            'status' => 'pending'
        ]);

        // Simulate payment gateway integration
        $gatewayResponse = $this->processPayment($payment, $request->gateway);

        return response()->json([
            'payment' => $payment,
            'gateway_response' => $gatewayResponse
        ]);
    }

    private function processPayment($payment, $gateway)
    {
        // Simulate different payment gateways
        switch ($gateway) {
            case 'razorpay':
                return $this->processRazorpay($payment);
            case 'stripe':
                return $this->processStripe($payment);
            case 'payu':
                return $this->processPayU($payment);
            default:
                return ['error' => 'Unsupported gateway'];
        }
    }

    private function processRazorpay($payment)
    {
        // Simulate Razorpay integration
        $orderId = 'order_' . Str::random(10);
        
        return [
            'gateway' => 'razorpay',
            'order_id' => $orderId,
            'amount' => $payment->amount * 100, // Razorpay expects amount in paise
            'currency' => $payment->currency,
            'key' => config('services.razorpay.key', 'rzp_test_key'),
            'name' => 'Lets Turf Play',
            'description' => 'Turf Booking Payment',
            'prefill' => [
                'name' => $payment->user->name,
                'email' => $payment->user->email
            ]
        ];
    }

    private function processStripe($payment)
    {
        // Simulate Stripe integration
        return [
            'gateway' => 'stripe',
            'client_secret' => 'pi_' . Str::random(24),
            'publishable_key' => config('services.stripe.key', 'pk_test_key')
        ];
    }

    private function processPayU($payment)
    {
        // Simulate PayU integration
        return [
            'gateway' => 'payu',
            'txnid' => 'txn_' . Str::random(10),
            'amount' => $payment->amount,
            'productinfo' => 'Turf Booking',
            'firstname' => $payment->user->name,
            'email' => $payment->user->email,
            'key' => config('services.payu.key', 'test_key')
        ];
    }

    public function webhook(Request $request, $gateway)
    {
        // Handle payment gateway webhooks
        switch ($gateway) {
            case 'razorpay':
                return $this->handleRazorpayWebhook($request);
            case 'stripe':
                return $this->handleStripeWebhook($request);
            case 'payu':
                return $this->handlePayUWebhook($request);
        }

        return response()->json(['error' => 'Invalid gateway'], 400);
    }

    private function handleRazorpayWebhook($request)
    {
        // Simulate webhook processing
        $paymentId = $request->input('payload.payment.entity.id');
        $status = $request->input('payload.payment.entity.status');

        if ($payment = Payment::where('gateway_transaction_id', $paymentId)->first()) {
            $payment->update([
                'status' => $status === 'captured' ? 'completed' : 'failed',
                'gateway_response' => $request->all(),
                'processed_at' => now()
            ]);

            if ($status === 'captured') {
                $payment->booking->update(['payment_status' => 'paid']);
                NotificationController::create(
                    $payment->user_id,
                    'payment_success',
                    'Payment Successful',
                    'Your booking payment has been processed successfully.'
                );
            }
        }

        return response()->json(['status' => 'success']);
    }

    private function handleStripeWebhook($request)
    {
        // Similar implementation for Stripe
        return response()->json(['status' => 'success']);
    }

    private function handlePayUWebhook($request)
    {
        // Similar implementation for PayU
        return response()->json(['status' => 'success']);
    }

    public function getPayments()
    {
        $payments = Auth::user()->payments()
            ->with('booking.turf')
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return response()->json($payments);
    }
}