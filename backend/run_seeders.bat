@echo off
echo Running Revenue Model and Feature Seeders...
php artisan db:seed --class=FeatureSeeder
php artisan db:seed --class=RevenueModelSeeder
echo Seeders completed!
pause