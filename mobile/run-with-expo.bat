@echo off
echo Setting up Expo for easy mobile testing...

npm install -g @expo/cli
npx create-expo-app --template blank LetsTurfPlayExpo
cd LetsTurfPlayExpo

echo.
echo Starting Expo development server...
npx expo start

echo.
echo Scan the QR code with Expo Go app on your phone!
pause