@echo off
echo ===================================================
echo   Neural Core AI - APK Packaging Helper Script
echo ===================================================
echo.
echo 1. Creating www directory and preparing web assets...
if not exist www mkdir www
copy /Y index.html www\
copy /Y style.css www\
copy /Y app.js www\
copy /Y tools.js www\
copy /Y free_apis.json www\

echo.
echo 2. Installing Capacitor CLI...
call npm install @capacitor/core @capacitor/cli @capacitor/android --save-dev

echo.
echo 3. Syncing web assets to Android platform...
call npx cap sync android

echo.
echo ===================================================
echo SUCCESS! Setup and Sync Complete!
echo You can now build APK by:
echo   - Running: npx cap open android (Opens Android Studio)
echo   - Or run: npx cap build android
echo ===================================================
pause
