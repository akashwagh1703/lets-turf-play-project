<!DOCTYPE html>
<html>
<head>
    <title>Booking Confirmation</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
    <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #2563eb;">Booking Confirmed!</h2>
        
        <p>Dear {{ $booking->user->name }},</p>
        
        <p>Your turf booking has been confirmed. Here are the details:</p>
        
        <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Booking Details</h3>
            <p><strong>Turf:</strong> {{ $booking->turf->turf_name }}</p>
            <p><strong>Date:</strong> {{ $booking->date }}</p>
            <p><strong>Time:</strong> {{ implode(', ', $booking->time_slots) }}</p>
            <p><strong>Amount:</strong> ₹{{ $booking->total_amount }}</p>
            <p><strong>Booking ID:</strong> {{ $booking->id }}</p>
        </div>
        
        <p>Please arrive 15 minutes before your scheduled time.</p>
        
        <p>Thank you for choosing Lets Turf Play!</p>
    </div>
</body>
</html>