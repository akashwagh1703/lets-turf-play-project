@echo off
echo Fixing database issues...

echo Dropping all tables...
php artisan migrate:reset --force

echo Running fresh migrations...
php artisan migrate --force

echo Creating admin users...
php artisan db:seed --class=AdminUserSeeder --force

echo Database fixed successfully!
pause