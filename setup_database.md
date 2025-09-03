# Database Setup Instructions

## 1. Run the Comprehensive Data Seeder

Navigate to your Laravel backend directory and run:

```bash
cd backend
php artisan db:seed --class=ComprehensiveDataSeeder
```

## 2. Alternative: Reset and Seed Database

If you want to start fresh:

```bash
php artisan migrate:fresh --seed --seeder=ComprehensiveDataSeeder
```

## 3. Created Data

### Super Admin
- **Email**: admin@letsturf.com
- **Password**: password
- **Role**: super_admin

### Turf Owners (5)
- **Rajesh Sharma**: rajesh@example.com / password
- **Priya Singh**: priya@example.com / password  
- **Amit Kumar**: amit@example.com / password
- **Sunita Rao**: sunita@example.com / password
- **Vikram Patel**: vikram@example.com / password

### Turfs (6)
- **Mumbai Sports Arena** - Football, ₹2000/hr (Rajesh)
- **Delhi Football Club** - Football, ₹1800/hr (Priya)
- **Bangalore Turf Center** - Cricket, ₹1500/hr (Amit)
- **Chennai Sports Complex** - Football, ₹2200/hr (Sunita)
- **Pune Cricket Ground** - Cricket, ₹1600/hr (Vikram)
- **Hyderabad Multi-Sport** - Multi-Sport, ₹1900/hr (Rajesh)

### Staff (7)
- **Ravi Kumar**: ravi@mumbai.com / password (Ground Keeper - Rajesh)
- **Meera Sharma**: meera@mumbai.com / password (Receptionist - Rajesh)
- **Suresh Yadav**: suresh@delhi.com / password (Manager - Priya)
- **Kavita Singh**: kavita@delhi.com / password (Cleaner - Priya)
- **Ramesh Babu**: ramesh@bangalore.com / password (Security - Amit)
- **Lakshmi Devi**: lakshmi@chennai.com / password (Ground Keeper - Sunita)
- **Ganesh Patil**: ganesh@pune.com / password (Maintenance - Vikram)

### Players (12)
- **Arjun Mehta**: arjun@gmail.com / password
- **Sneha Gupta**: sneha@gmail.com / password
- **Rohit Sharma**: rohit@gmail.com / password
- **Priya Nair**: priya@gmail.com / password
- **Vikash Singh**: vikash@gmail.com / password
- **Anita Rao**: anita@gmail.com / password
- **Karan Patel**: karan@gmail.com / password
- **Deepika Joshi**: deepika@gmail.com / password
- **Rahul Kumar**: rahul@gmail.com / password
- **Pooja Sharma**: pooja@gmail.com / password
- **Amit Verma**: amit@gmail.com / password
- **Ritu Singh**: ritu@gmail.com / password

### Bookings (10)
- **7 Confirmed** bookings (₹15,100 revenue)
- **2 Pending** bookings (₹3,400 potential)
- **1 Cancelled** booking (₹2,200 lost)

### Revenue Models (3)
- **Basic Plan**: ₹999/month
- **Premium Plan**: ₹1999/month  
- **Enterprise Plan**: ₹4999/month

## 4. Verify Data

After seeding, you can verify the data:

```bash
php artisan tinker
```

Then run:
```php
User::count(); // Should show 20 users (1 admin + 5 owners + 7 staff + 12 players)
TurfOwner::count(); // Should show 5
Turf::count(); // Should show 6
Staff::count(); // Should show 7
Player::count(); // Should show 12
Booking::count(); // Should show 10
```

## 5. Dashboard Statistics

The Super Admin dashboard will now show:
- **Total Revenue**: ₹17,300
- **Total Bookings**: 10
- **Active Turfs**: 6
- **Turf Owners**: 5
- **Active Staff**: 7
- **Total Players**: 12
- **Monthly Payroll**: ₹165,000
- **Net Profit**: -₹147,700 (realistic scenario)