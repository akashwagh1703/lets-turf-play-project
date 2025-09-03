@echo off
echo Installing optimization packages...

echo.
echo Installing Frontend Packages...
cd frontend
npm install react-query@^3.39.3 react-window@^1.8.8 react-window-infinite-loader@^1.0.9 react-intersection-observer@^9.5.3 lodash.debounce@^4.0.8 react-error-boundary@^4.0.11

echo.
echo Installing Backend Packages...
cd ..\backend
composer require predis/predis:^2.2 laravel/octane:^2.5 spatie/laravel-query-builder:^6.2 spatie/laravel-fractal:^6.2 league/fractal:^0.20.1

echo.
echo Optimization packages installed successfully!
echo.
echo Next steps:
echo 1. Configure Redis in your .env file
echo 2. Run: php artisan vendor:publish --provider="Laravel\Octane\OctaneServiceProvider"
echo 3. Run: php artisan octane:install --server=swoole
echo 4. Update your API routes to use the new optimized controllers
echo.
pause