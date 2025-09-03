# Lets Turf Play - Admin Portal

A full-stack admin portal with React frontend and Laravel backend for managing turf bookings.

## Features

### Frontend (React + Vite)
- JWT-based authentication
- Role-based dashboards (Super Admin, Turf Owner, Staff)
- Modern UI with Tailwind CSS
- Responsive design

### Backend (Laravel)
- JWT authentication
- RESTful APIs
- Role-based access control
- MySQL database

## Setup Instructions

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
composer install
```

3. Create database `lets_turf_play` in MySQL

4. Run migrations:
```bash
php artisan migrate
```

5. Generate JWT secret:
```bash
php artisan jwt:secret
```

6. Start Laravel server:
```bash
php artisan serve
```

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start development server:
```bash
npm run dev
```

## Default Login Credentials

Create users via API or database seeder:

**Super Admin:**
- Email: admin@example.com
- Password: password
- Role: super_admin

**Turf Owner:**
- Email: owner@example.com
- Password: password
- Role: turf_owner

**Staff:**
- Email: staff@example.com
- Password: password
- Role: staff

## API Endpoints

- POST `/api/login` - User login
- POST `/api/register` - User registration
- GET `/api/turfs` - Get turfs
- POST `/api/turfs` - Create turf
- GET `/api/bookings` - Get bookings
- POST `/api/bookings` - Create booking
- GET `/api/staff` - Get staff members
- POST `/api/staff` - Create staff member

## Database Schema

- **users**: id, name, email, password, role
- **turfs**: id, owner_id, turf_name, location, capacity, status
- **bookings**: id, turf_id, user_id, booking_type, date, time, status
- **staff**: id, owner_id, staff_name, email, phone, status
- **subscriptions**: id, owner_id, plan, start_date, end_date, status