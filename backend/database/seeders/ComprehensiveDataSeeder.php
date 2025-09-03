<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class ComprehensiveDataSeeder extends Seeder
{
    public function run(): void
    {
        // Revenue Models
        $revenueModels = [
            ['id' => 1, 'name' => 'Free Plan', 'description' => 'Basic features for small turf owners', 'type' => 'subscription', 'price' => 0, 'billing_cycle' => 'monthly', 'features' => json_encode(['1 Turf', '50 Bookings/month', 'Basic Support']), 'turf_limit' => 1, 'staff_limit' => 1, 'booking_limit' => 50, 'status' => true],
            ['id' => 2, 'name' => 'Starter Plan', 'description' => 'Perfect for growing businesses', 'type' => 'subscription', 'price' => 999, 'billing_cycle' => 'monthly', 'features' => json_encode(['3 Turfs', '200 Bookings/month', 'Email Support']), 'turf_limit' => 3, 'staff_limit' => 3, 'booking_limit' => 200, 'status' => true],
            ['id' => 3, 'name' => 'Professional Plan', 'description' => 'Advanced features for established businesses', 'type' => 'subscription', 'price' => 2499, 'billing_cycle' => 'monthly', 'features' => json_encode(['10 Turfs', '1000 Bookings/month', 'Priority Support', 'Analytics']), 'turf_limit' => 10, 'staff_limit' => 10, 'booking_limit' => 1000, 'status' => true],
            ['id' => 4, 'name' => 'Enterprise Plan', 'description' => 'Complete solution for large operations', 'type' => 'subscription', 'price' => 4999, 'billing_cycle' => 'monthly', 'features' => json_encode(['Unlimited Turfs', 'Unlimited Bookings', '24/7 Support', 'Custom Features']), 'turf_limit' => null, 'staff_limit' => null, 'booking_limit' => null, 'status' => true]
        ];

        DB::table('revenue_models')->insert($revenueModels);

        // Turf Owners
        $turfOwners = [
            ['id' => 4, 'name' => 'Rajesh Kumar', 'email' => 'rajesh@sportszone.com', 'password' => bcrypt('password'), 'role' => 'turf_owner', 'phone' => '9876543210', 'address' => 'Sector 15, Gurgaon, Haryana', 'status' => true],
            ['id' => 5, 'name' => 'Priya Sharma', 'email' => 'priya@playgroundhub.com', 'password' => bcrypt('password'), 'role' => 'turf_owner', 'phone' => '9876543211', 'address' => 'Koramangala, Bangalore, Karnataka', 'status' => true],
            ['id' => 6, 'name' => 'Amit Patel', 'email' => 'amit@turfmaster.com', 'password' => bcrypt('password'), 'role' => 'turf_owner', 'phone' => '9876543212', 'address' => 'Andheri West, Mumbai, Maharashtra', 'status' => true],
            ['id' => 7, 'name' => 'Sneha Reddy', 'email' => 'sneha@sportscity.com', 'password' => bcrypt('password'), 'role' => 'turf_owner', 'phone' => '9876543213', 'address' => 'Banjara Hills, Hyderabad, Telangana', 'status' => true],
            ['id' => 8, 'name' => 'Vikram Singh', 'email' => 'vikram@playtime.com', 'password' => bcrypt('password'), 'role' => 'turf_owner', 'phone' => '9876543214', 'address' => 'Civil Lines, Delhi', 'status' => true],
            ['id' => 9, 'name' => 'Kavya Nair', 'email' => 'kavya@greenfield.com', 'password' => bcrypt('password'), 'role' => 'turf_owner', 'phone' => '9876543215', 'address' => 'Marine Drive, Kochi, Kerala', 'status' => true],
            ['id' => 10, 'name' => 'Rohit Gupta', 'email' => 'rohit@sportsplex.com', 'password' => bcrypt('password'), 'role' => 'turf_owner', 'phone' => '9876543216', 'address' => 'Park Street, Kolkata, West Bengal', 'status' => true],
            ['id' => 11, 'name' => 'Meera Joshi', 'email' => 'meera@turfking.com', 'password' => bcrypt('password'), 'role' => 'turf_owner', 'phone' => '9876543217', 'address' => 'Shivaji Nagar, Pune, Maharashtra', 'status' => true],
            ['id' => 12, 'name' => 'Arjun Menon', 'email' => 'arjun@playzone.com', 'password' => bcrypt('password'), 'role' => 'turf_owner', 'phone' => '9876543218', 'address' => 'Anna Nagar, Chennai, Tamil Nadu', 'status' => true],
            ['id' => 13, 'name' => 'Pooja Agarwal', 'email' => 'pooja@sportsarena.com', 'password' => bcrypt('password'), 'role' => 'turf_owner', 'phone' => '9876543219', 'address' => 'Vastrapur, Ahmedabad, Gujarat', 'status' => true]
        ];

        DB::table('users')->insert($turfOwners);

        // Subscriptions (5 free, 5 paid)
        $subscriptions = [
            ['owner_id' => 4, 'revenue_model_id' => 2, 'start_date' => '2024-01-01', 'end_date' => '2024-12-31', 'amount_paid' => 11988, 'payment_status' => 'paid', 'status' => 'active'],
            ['owner_id' => 5, 'revenue_model_id' => 3, 'start_date' => '2024-02-01', 'end_date' => '2025-01-31', 'amount_paid' => 29988, 'payment_status' => 'paid', 'status' => 'active'],
            ['owner_id' => 6, 'revenue_model_id' => 2, 'start_date' => '2024-03-01', 'end_date' => '2024-12-31', 'amount_paid' => 9990, 'payment_status' => 'paid', 'status' => 'active'],
            ['owner_id' => 7, 'revenue_model_id' => 4, 'start_date' => '2024-01-15', 'end_date' => '2025-01-14', 'amount_paid' => 59988, 'payment_status' => 'paid', 'status' => 'active'],
            ['owner_id' => 8, 'revenue_model_id' => 3, 'start_date' => '2024-04-01', 'end_date' => '2025-03-31', 'amount_paid' => 29988, 'payment_status' => 'paid', 'status' => 'active']
        ];

        DB::table('subscriptions')->insert($subscriptions);

        // Turfs
        $turfs = [
            ['owner_id' => 4, 'turf_name' => 'Sports Zone Arena', 'location' => 'Sector 15, Gurgaon', 'capacity' => 22, 'price_per_hour' => 2500, 'sport_type' => 'Football', 'facilities' => 'Floodlights, Parking, Changing Room', 'description' => 'Premium football turf with modern facilities', 'status' => true],
            ['owner_id' => 4, 'turf_name' => 'Sports Zone Cricket', 'location' => 'Sector 15, Gurgaon', 'capacity' => 16, 'price_per_hour' => 3000, 'sport_type' => 'Cricket', 'facilities' => 'Net Practice, Bowling Machine', 'description' => 'Professional cricket practice facility', 'status' => true],
            
            ['owner_id' => 5, 'turf_name' => 'Playground Hub Football', 'location' => 'Koramangala, Bangalore', 'capacity' => 20, 'price_per_hour' => 2200, 'sport_type' => 'Football', 'facilities' => 'Floodlights, Cafeteria', 'description' => 'Modern football turf in heart of Bangalore', 'status' => true],
            ['owner_id' => 5, 'turf_name' => 'Playground Hub Basketball', 'location' => 'Koramangala, Bangalore', 'capacity' => 10, 'price_per_hour' => 1800, 'sport_type' => 'Basketball', 'facilities' => 'Indoor Court, AC', 'description' => 'Air-conditioned basketball court', 'status' => true],
            ['owner_id' => 5, 'turf_name' => 'Playground Hub Tennis', 'location' => 'Koramangala, Bangalore', 'capacity' => 4, 'price_per_hour' => 1500, 'sport_type' => 'Tennis', 'facilities' => 'Clay Court, Equipment Rental', 'description' => 'Professional tennis court', 'status' => true],
            
            ['owner_id' => 6, 'turf_name' => 'Turf Master Arena', 'location' => 'Andheri West, Mumbai', 'capacity' => 18, 'price_per_hour' => 3500, 'sport_type' => 'Football', 'facilities' => 'Premium Grass, VIP Lounge', 'description' => 'Luxury football experience in Mumbai', 'status' => true],
            ['owner_id' => 6, 'turf_name' => 'Turf Master Cricket', 'location' => 'Andheri West, Mumbai', 'capacity' => 14, 'price_per_hour' => 4000, 'sport_type' => 'Cricket', 'facilities' => 'Pitch Roller, Scoreboard', 'description' => 'Professional cricket ground', 'status' => true],
            
            ['owner_id' => 7, 'turf_name' => 'Sports City Complex', 'location' => 'Banjara Hills, Hyderabad', 'capacity' => 24, 'price_per_hour' => 2800, 'sport_type' => 'Football', 'facilities' => 'Multiple Courts, Restaurant', 'description' => 'Multi-sport complex with dining', 'status' => true],
            ['owner_id' => 7, 'turf_name' => 'Sports City Badminton', 'location' => 'Banjara Hills, Hyderabad', 'capacity' => 8, 'price_per_hour' => 1200, 'sport_type' => 'Badminton', 'facilities' => 'Wooden Floor, AC', 'description' => 'Premium badminton courts', 'status' => true],
            
            ['owner_id' => 8, 'turf_name' => 'Playtime Football', 'location' => 'Civil Lines, Delhi', 'capacity' => 22, 'price_per_hour' => 3200, 'sport_type' => 'Football', 'facilities' => 'Artificial Grass, Seating', 'description' => 'Top-quality football turf in Delhi', 'status' => true],
            ['owner_id' => 8, 'turf_name' => 'Playtime Cricket', 'location' => 'Civil Lines, Delhi', 'capacity' => 16, 'price_per_hour' => 3800, 'sport_type' => 'Cricket', 'facilities' => 'Turf Wicket, Practice Nets', 'description' => 'Professional cricket facility', 'status' => true],
            ['owner_id' => 8, 'turf_name' => 'Playtime Basketball', 'location' => 'Civil Lines, Delhi', 'capacity' => 10, 'price_per_hour' => 2000, 'sport_type' => 'Basketball', 'facilities' => 'Outdoor Court, Lighting', 'description' => 'Outdoor basketball court', 'status' => true],
            
            ['owner_id' => 9, 'turf_name' => 'Green Field Football', 'location' => 'Marine Drive, Kochi', 'capacity' => 20, 'price_per_hour' => 2000, 'sport_type' => 'Football', 'facilities' => 'Sea View, Natural Grass', 'description' => 'Scenic football ground by the sea', 'status' => true],
            
            ['owner_id' => 10, 'turf_name' => 'Sports Plex Arena', 'location' => 'Park Street, Kolkata', 'capacity' => 18, 'price_per_hour' => 2300, 'sport_type' => 'Football', 'facilities' => 'Heritage Building, Modern Facilities', 'description' => 'Historic venue with modern amenities', 'status' => true],
            
            ['owner_id' => 11, 'turf_name' => 'Turf King Stadium', 'location' => 'Shivaji Nagar, Pune', 'capacity' => 22, 'price_per_hour' => 2600, 'sport_type' => 'Football', 'facilities' => 'Stadium Seating, Scoreboard', 'description' => 'Stadium-style football experience', 'status' => true],
            
            ['owner_id' => 12, 'turf_name' => 'Play Zone Football', 'location' => 'Anna Nagar, Chennai', 'capacity' => 20, 'price_per_hour' => 2400, 'sport_type' => 'Football', 'facilities' => 'Cooling System, Parking', 'description' => 'Climate-controlled football turf', 'status' => true],
            
            ['owner_id' => 13, 'turf_name' => 'Sports Arena Complex', 'location' => 'Vastrapur, Ahmedabad', 'capacity' => 18, 'price_per_hour' => 2100, 'sport_type' => 'Football', 'facilities' => 'Multi-purpose, Events Hall', 'description' => 'Versatile sports and events venue', 'status' => true]
        ];

        DB::table('turfs')->insert($turfs);

        // Staff
        $staff = [
            ['owner_id' => 4, 'staff_name' => 'Suresh Kumar', 'email' => 'suresh@sportszone.com', 'phone' => '9876543220', 'position' => 'Ground Manager', 'salary' => 25000, 'shift_timing' => '6 AM - 2 PM', 'status' => true],
            ['owner_id' => 4, 'staff_name' => 'Ramesh Singh', 'email' => 'ramesh@sportszone.com', 'phone' => '9876543221', 'position' => 'Maintenance', 'salary' => 18000, 'shift_timing' => '2 PM - 10 PM', 'status' => true],
            
            ['owner_id' => 5, 'staff_name' => 'Lakshmi Devi', 'email' => 'lakshmi@playgroundhub.com', 'phone' => '9876543222', 'position' => 'Facility Manager', 'salary' => 30000, 'shift_timing' => '8 AM - 6 PM', 'status' => true],
            ['owner_id' => 5, 'staff_name' => 'Ganesh Rao', 'email' => 'ganesh@playgroundhub.com', 'phone' => '9876543223', 'position' => 'Sports Coordinator', 'salary' => 22000, 'shift_timing' => '10 AM - 8 PM', 'status' => true],
            ['owner_id' => 5, 'staff_name' => 'Anita Sharma', 'email' => 'anita@playgroundhub.com', 'phone' => '9876543224', 'position' => 'Receptionist', 'salary' => 15000, 'shift_timing' => '9 AM - 6 PM', 'status' => true],
            
            ['owner_id' => 6, 'staff_name' => 'Mahesh Patil', 'email' => 'mahesh@turfmaster.com', 'phone' => '9876543225', 'position' => 'Operations Manager', 'salary' => 35000, 'shift_timing' => '7 AM - 7 PM', 'status' => true],
            ['owner_id' => 6, 'staff_name' => 'Deepak Joshi', 'email' => 'deepak@turfmaster.com', 'phone' => '9876543226', 'position' => 'Security', 'salary' => 20000, 'shift_timing' => '6 PM - 6 AM', 'status' => true],
            
            ['owner_id' => 7, 'staff_name' => 'Srinivas Reddy', 'email' => 'srinivas@sportscity.com', 'phone' => '9876543227', 'position' => 'Complex Manager', 'salary' => 40000, 'shift_timing' => '8 AM - 8 PM', 'status' => true],
            ['owner_id' => 7, 'staff_name' => 'Pradeep Kumar', 'email' => 'pradeep@sportscity.com', 'phone' => '9876543228', 'position' => 'Coach', 'salary' => 28000, 'shift_timing' => '5 AM - 1 PM', 'status' => true],
            ['owner_id' => 7, 'staff_name' => 'Rajani Devi', 'email' => 'rajani@sportscity.com', 'phone' => '9876543229', 'position' => 'Housekeeping', 'salary' => 12000, 'shift_timing' => '6 AM - 2 PM', 'status' => true],
            
            ['owner_id' => 8, 'staff_name' => 'Harish Chandra', 'email' => 'harish@playtime.com', 'phone' => '9876543230', 'position' => 'Sports Manager', 'salary' => 32000, 'shift_timing' => '6 AM - 6 PM', 'status' => true],
            ['owner_id' => 8, 'staff_name' => 'Mohan Lal', 'email' => 'mohan@playtime.com', 'phone' => '9876543231', 'position' => 'Groundskeeper', 'salary' => 18000, 'shift_timing' => '5 AM - 1 PM', 'status' => true],
            ['owner_id' => 8, 'staff_name' => 'Sunita Devi', 'email' => 'sunita@playtime.com', 'phone' => '9876543232', 'position' => 'Customer Service', 'salary' => 16000, 'shift_timing' => '9 AM - 6 PM', 'status' => true],
            
            ['owner_id' => 9, 'staff_name' => 'Ravi Nair', 'email' => 'ravi@greenfield.com', 'phone' => '9876543233', 'position' => 'Ground Manager', 'salary' => 24000, 'shift_timing' => '6 AM - 6 PM', 'status' => true],
            
            ['owner_id' => 10, 'staff_name' => 'Biswajit Das', 'email' => 'biswajit@sportsplex.com', 'phone' => '9876543234', 'position' => 'Facility Manager', 'salary' => 26000, 'shift_timing' => '7 AM - 7 PM', 'status' => true],
            
            ['owner_id' => 11, 'staff_name' => 'Sachin Joshi', 'email' => 'sachin@turfking.com', 'phone' => '9876543235', 'position' => 'Stadium Manager', 'salary' => 28000, 'shift_timing' => '6 AM - 6 PM', 'status' => true],
            
            ['owner_id' => 12, 'staff_name' => 'Karthik Raj', 'email' => 'karthik@playzone.com', 'phone' => '9876543236', 'position' => 'Operations Head', 'salary' => 30000, 'shift_timing' => '8 AM - 8 PM', 'status' => true],
            
            ['owner_id' => 13, 'staff_name' => 'Nitin Agarwal', 'email' => 'nitin@sportsarena.com', 'phone' => '9876543237', 'position' => 'Event Manager', 'salary' => 27000, 'shift_timing' => '9 AM - 9 PM', 'status' => true]
        ];

        DB::table('staff')->insert($staff);

        // Players
        $players = [
            ['name' => 'Rohit Sharma', 'email' => 'rohit.player@gmail.com', 'phone' => '9876543300', 'date_of_birth' => '1995-05-15', 'gender' => 'male', 'address' => 'Gurgaon, Haryana', 'status' => true],
            ['name' => 'Virat Kohli', 'email' => 'virat.player@gmail.com', 'phone' => '9876543302', 'date_of_birth' => '1992-11-05', 'gender' => 'male', 'address' => 'Bangalore, Karnataka', 'status' => true],
            ['name' => 'MS Dhoni', 'email' => 'dhoni.player@gmail.com', 'phone' => '9876543304', 'date_of_birth' => '1985-07-07', 'gender' => 'male', 'address' => 'Chennai, Tamil Nadu', 'status' => true],
            ['name' => 'Hardik Pandya', 'email' => 'hardik.player@gmail.com', 'phone' => '9876543306', 'date_of_birth' => '1993-10-11', 'gender' => 'male', 'address' => 'Mumbai, Maharashtra', 'status' => true],
            ['name' => 'Shikhar Dhawan', 'email' => 'shikhar.player@gmail.com', 'phone' => '9876543308', 'date_of_birth' => '1985-12-05', 'gender' => 'male', 'address' => 'Delhi', 'status' => true],
            ['name' => 'Priya Kumari', 'email' => 'priya.player@gmail.com', 'phone' => '9876543310', 'date_of_birth' => '1998-03-20', 'gender' => 'female', 'address' => 'Pune, Maharashtra', 'status' => true],
            ['name' => 'Anjali Singh', 'email' => 'anjali.player@gmail.com', 'phone' => '9876543312', 'date_of_birth' => '1996-08-12', 'gender' => 'female', 'address' => 'Hyderabad, Telangana', 'status' => true],
            ['name' => 'Rahul Dravid', 'email' => 'rahul.player@gmail.com', 'phone' => '9876543314', 'date_of_birth' => '1990-01-11', 'gender' => 'male', 'address' => 'Bangalore, Karnataka', 'status' => true]
        ];

        DB::table('players')->insert($players);

        // Bookings (Past, Present, Future)
        $bookings = [];
        $turfIds = range(1, 17);
        $playerIds = range(1, 8);
        $statuses = ['confirmed', 'pending', 'cancelled'];
        $bookingTypes = ['online', 'offline'];
        
        // Generate bookings for past 30 days, today, and next 30 days
        for ($i = 0; $i < 200; $i++) {
            $randomDays = rand(-30, 30);
            $date = Carbon::now()->addDays($randomDays)->format('Y-m-d');
            $turfId = $turfIds[array_rand($turfIds)];
            $playerId = $playerIds[array_rand($playerIds)];
            $status = $statuses[array_rand($statuses)];
            $bookingType = $bookingTypes[array_rand($bookingTypes)];
            
            $startHour = rand(6, 20);
            $endHour = $startHour + rand(1, 3);
            $amount = rand(1500, 4000);
            
            $customerNames = ['Rajesh Kumar', 'Priya Sharma', 'Amit Patel', 'Sneha Reddy', 'Vikram Singh', 'Kavya Nair', 'Rohit Gupta', 'Meera Joshi'];
            $customerPhones = ['9876543400', '9876543401', '9876543402', '9876543403', '9876543404', '9876543405', '9876543406', '9876543407'];
            
            $bookings[] = [
                'turf_id' => $turfId,
                'user_id' => rand(4, 13),
                'player_id' => $bookingType === 'online' ? $playerId : null,
                'booking_type' => $bookingType,
                'booking_plan' => 'single',
                'date' => $date,
                'start_time' => sprintf('%02d:00:00', $startHour),
                'end_time' => sprintf('%02d:00:00', min($endHour, 23)),
                'customer_name' => $bookingType === 'offline' ? $customerNames[array_rand($customerNames)] : null,
                'customer_phone' => $bookingType === 'offline' ? $customerPhones[array_rand($customerPhones)] : null,
                'customer_email' => $bookingType === 'offline' ? strtolower(str_replace(' ', '.', $customerNames[array_rand($customerNames)])) . '@gmail.com' : null,
                'amount' => $amount,
                'advance_amount' => $amount * 0.3,
                'remaining_amount' => $amount * 0.7,
                'notes' => 'Regular booking',
                'status' => $status,
                'created_at' => Carbon::now()->subDays(rand(0, 60)),
                'updated_at' => Carbon::now()
            ];
        }

        DB::table('bookings')->insert($bookings);
    }
}