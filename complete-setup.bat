@echo off
echo ========================================
echo  Lets Turf Play - Complete Setup
echo ========================================

echo.
echo [1/6] Setting up Backend Dependencies...
cd backend
call composer install
if %errorlevel% neq 0 (
    echo ERROR: Composer install failed
    pause
    exit /b 1
)

echo.
echo [2/6] Setting up Database...
echo Creating database if not exists...
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS lets_turf_play;"
if %errorlevel% neq 0 (
    echo WARNING: Database creation failed or already exists
)

echo.
echo [3/6] Running Database Migrations...
php artisan migrate:fresh --seed
if %errorlevel% neq 0 (
    echo ERROR: Migration failed
    pause
    exit /b 1
)

echo.
echo [4/6] Setting up Frontend Dependencies...
cd ..\frontend
call npm install
if %errorlevel% neq 0 (
    echo ERROR: NPM install failed
    pause
    exit /b 1
)

echo.
echo [5/6] Building Frontend...
call npm run build
if %errorlevel% neq 0 (
    echo WARNING: Frontend build failed, continuing with dev mode
)

echo.
echo [6/6] Setup Complete!
echo.
echo ========================================
echo  Setup Summary:
echo ========================================
echo - Backend: Laravel with JWT auth
echo - Frontend: React with Vite
echo - Database: MySQL (lets_turf_play)
echo - Default users created via seeder
echo.
echo To start the application:
echo 1. Backend: cd backend && php artisan serve
echo 2. Frontend: cd frontend && npm run dev
echo.
echo Default login credentials:
echo - Super Admin: admin@example.com / password
echo - Turf Owner: owner@example.com / password  
echo - Staff: staff@example.com / password
echo ========================================

cd ..
pause