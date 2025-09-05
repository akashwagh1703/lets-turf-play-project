@echo off
echo ========================================
echo  Starting Lets Turf Play Application
echo ========================================

echo.
echo Starting Backend Server (Laravel)...
start "Laravel Backend" cmd /k "cd backend && php artisan serve"

echo.
echo Waiting 3 seconds for backend to start...
timeout /t 3 /nobreak > nul

echo.
echo Starting Frontend Server (React + Vite)...
start "React Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo ========================================
echo  Application Started Successfully!
echo ========================================
echo.
echo Backend URL: http://127.0.0.1:8000
echo Frontend URL: http://localhost:5173
echo.
echo Default Login Credentials:
echo - Super Admin: admin@example.com / password
echo - Turf Owner: owner@example.com / password
echo - Staff: staff@example.com / password
echo.
echo Press any key to close this window...
pause > nul