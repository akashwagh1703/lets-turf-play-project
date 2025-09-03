@echo off
echo Starting Automated Feature Testing...

cd backend
echo Testing Backend APIs...
php artisan migrate:fresh --seed
php artisan serve --host=127.0.0.1 --port=8000 &
timeout /t 5

cd ../frontend
echo Testing Frontend Build...
npm run build
if %errorlevel% neq 0 (
    echo Frontend build failed
    exit /b 1
)

echo Starting Frontend Dev Server...
start npm run dev

echo Running API Tests...
curl -X POST http://127.0.0.1:8000/api/login -H "Content-Type: application/json" -d "{\"email\":\"admin@example.com\",\"password\":\"password\"}"

echo All tests completed. Check output for issues.
pause