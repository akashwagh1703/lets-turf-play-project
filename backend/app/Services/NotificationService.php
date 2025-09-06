<?php

namespace App\Services;

use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class NotificationService
{
    public function sendBookingConfirmation($booking)
    {
        $this->sendEmail(
            $booking->user->email,
            'Booking Confirmed',
            'emails.booking-confirmation',
            ['booking' => $booking]
        );

        $this->sendSMS(
            $booking->user->phone,
            "Booking confirmed for {$booking->turf->turf_name} on {$booking->date} at {$booking->time_slots[0]}. Booking ID: {$booking->id}"
        );
    }

    public function sendPaymentConfirmation($payment)
    {
        $this->sendEmail(
            $payment->user->email,
            'Payment Successful',
            'emails.payment-confirmation',
            ['payment' => $payment]
        );

        $this->sendSMS(
            $payment->user->phone,
            "Payment of ₹{$payment->amount} successful for booking #{$payment->booking_id}. Transaction ID: {$payment->gateway_transaction_id}"
        );
    }

    private function sendEmail($to, $subject, $template, $data = [])
    {
        try {
            Mail::send($template, $data, function ($message) use ($to, $subject) {
                $message->to($to)->subject($subject);
            });
        } catch (\Exception $e) {
            Log::error('Email sending failed: ' . $e->getMessage());
        }
    }

    private function sendSMS($phone, $message)
    {
        try {
            $response = Http::withBasicAuth(
                config('services.twilio.sid'),
                config('services.twilio.token')
            )->asForm()->post("https://api.twilio.com/2010-04-01/Accounts/" . config('services.twilio.sid') . "/Messages.json", [
                'From' => config('services.twilio.from'),
                'To' => $phone,
                'Body' => $message
            ]);
        } catch (\Exception $e) {
            Log::error('SMS sending failed: ' . $e->getMessage());
        }
    }
}