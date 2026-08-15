@echo off
echo =======================================
echo     Auto Upload Version to GitHub
echo =======================================
echo.

echo [1/3] Adding changes to staging...
git add .

echo [2/3] Committing changes...
git commit -m "Auto upload via script"

echo [3/3] Pushing to GitHub...
git push origin main

echo.
echo =======================================
echo     Upload Complete!
echo =======================================
pause
