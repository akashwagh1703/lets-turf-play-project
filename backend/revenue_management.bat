@echo off
echo Setting up Revenue Management System...

echo Creating revenue models...
php artisan db:seed --class=RevenueModelSeeder --force

echo Creating sample subscriptions...
php artisan db:seed --class=SubscriptionSeeder --force

echo Linking features to revenue models...
php artisan db:seed --class=RevenueModelFeatureSeeder --force

echo Revenue Management setup completed!
echo.
echo Available Revenue Models:
echo - Basic Plan: $29/month
echo - Pro Plan: $79/month  
echo - Enterprise Plan: $199/month
pause