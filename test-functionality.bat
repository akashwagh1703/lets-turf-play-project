@echo off
echo ========================================
echo COMPREHENSIVE FUNCTIONALITY TEST
echo ========================================

echo.
echo Starting Laravel server...
start /B php -S 127.0.0.1:8000 -t backend/public

echo Waiting for server to start...
timeout /t 3 /nobreak > nul

echo.
echo ========================================
echo TESTING AUTHENTICATION ENDPOINTS
echo ========================================

echo Testing Super Admin Login...
curl -X POST http://127.0.0.1:8000/api/login -H "Content-Type: application/json" -d "{\"email\":\"admin@test.com\",\"password\":\"password\"}" > admin_token.json
echo.

echo Testing Turf Owner Login...
curl -X POST http://127.0.0.1:8000/api/login -H "Content-Type: application/json" -d "{\"email\":\"owner@test.com\",\"password\":\"password\"}" > owner_token.json
echo.

echo Testing Staff Login...
curl -X POST http://127.0.0.1:8000/api/login -H "Content-Type: application/json" -d "{\"email\":\"staff@test.com\",\"password\":\"password\"}" > staff_token.json
echo.

echo ========================================
echo TESTING API ENDPOINTS
echo ========================================

echo Testing Dashboard Stats...
curl -H "Authorization: Bearer %ADMIN_TOKEN%" http://127.0.0.1:8000/api/dashboard/stats
echo.

echo Testing Turfs API...
curl -H "Authorization: Bearer %OWNER_TOKEN%" http://127.0.0.1:8000/api/turfs
echo.

echo Testing Bookings API...
curl -H "Authorization: Bearer %OWNER_TOKEN%" http://127.0.0.1:8000/api/bookings
echo.

echo Testing Staff API...
curl -H "Authorization: Bearer %OWNER_TOKEN%" http://127.0.0.1:8000/api/staff
echo.

echo Testing Players API...
curl -H "Authorization: Bearer %ADMIN_TOKEN%" http://127.0.0.1:8000/api/players
echo.

echo Testing Revenue Models API...
curl -H "Authorization: Bearer %ADMIN_TOKEN%" http://127.0.0.1:8000/api/revenue-models
echo.

echo Testing Subscriptions API...
curl -H "Authorization: Bearer %ADMIN_TOKEN%" http://127.0.0.1:8000/api/subscriptions
echo.

echo.
echo ========================================
echo TEST COMPLETED
echo ========================================
echo Check the output above for any errors
echo Press any key to exit...
pause > nul