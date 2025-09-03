@echo off
echo Setting up Lets Turf Play Admin Portal...

echo.
echo Setting up Backend...
cd backend

echo Installing Composer dependencies...
composer install

echo Running database migrations...
php artisan migrate

echo Seeding database...
php artisan db:seed

echo Generating JWT secret...
php artisan jwt:secret

echo.
echo Setting up Frontend...
cd ..\frontend

echo Installing NPM dependencies...
npm install

echo.
echo Setup complete!
echo.
echo To start the application:
echo 1. Backend: cd backend && php artisan serve
echo 2. Frontend: cd frontend && npm run dev
echo.
echo Default login credentials:
echo Super Admin: admin@example.com / password
echo Turf Owner: owner@example.com / password
echo Staff: staff@example.com / password

pause