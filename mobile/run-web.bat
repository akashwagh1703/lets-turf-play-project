@echo off
echo Running mobile app in web browser...

npm install react-native-web
npx expo start --web

echo.
echo Mobile app running at: http://localhost:19006
pause