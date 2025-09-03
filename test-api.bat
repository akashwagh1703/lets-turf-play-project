@echo off
echo Testing API endpoints...

echo.
echo Testing login endpoint:
curl -X POST http://localhost:8000/api/login -H "Content-Type: application/json" -d "{\"email\":\"admin@example.com\",\"password\":\"password\"}"

echo.
echo.
echo If you see a token response above, the API is working correctly.
echo If you see connection errors, make sure to run: php artisan serve
pause