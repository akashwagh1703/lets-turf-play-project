@echo off
echo Creating admin users...
php artisan db:seed --class=AdminUserSeeder --force
echo Admin users created successfully!
echo.
echo Login credentials:
echo Super Admin: admin@example.com / password
echo Turf Owner: owner@example.com / password  
echo Staff: staff@example.com / password
pause