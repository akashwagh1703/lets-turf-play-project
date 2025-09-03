@echo off
echo Starting Lets Turf Play servers...

echo Starting Laravel backend server...
start "Laravel Backend" cmd /k "cd backend && php artisan serve --host=localhost --port=8000"

timeout /t 3

echo Starting React frontend server...
start "React Frontend" cmd /k "cd frontend && npm run dev"

echo Both servers are starting...
echo Backend: http://localhost:8000
echo Frontend: http://localhost:3000
echo.
echo Press any key to close this window...
pause