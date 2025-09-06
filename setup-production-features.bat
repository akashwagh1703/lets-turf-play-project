@echo off
echo Setting up production features...

cd backend

echo Running migrations...
php artisan migrate --force

echo Running database seeders...
php artisan db:seed --class=RevenueModelSeeder --force
php artisan db:seed --class=FeatureSeeder --force

echo Running tests...
php artisan test --testsuite=Feature
php artisan test --testsuite=Unit

echo Clearing cache...
php artisan cache:clear
php artisan config:clear
php artisan route:clear

echo Installing frontend dependencies...
cd ..\frontend
npm install --production

echo Building frontend...
npm run build

echo Production features setup complete!
echo.
echo Features added:
echo - Real-time notifications
echo - Payment gateway integration
echo - Email/SMS notifications
echo - Database query optimization
echo - Comprehensive testing
echo.
pause