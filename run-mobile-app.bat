@echo off
echo Starting Lets Turf Play Mobile App...

cd mobile

echo Installing dependencies...
npm install

echo Starting Metro bundler...
start "Metro" cmd /k "npx react-native start"

timeout /t 5

echo Running on Android...
npx react-native run-android

echo.
echo Mobile app is running!
echo - Metro bundler: http://localhost:8081
echo - Android emulator should open automatically
echo.
pause