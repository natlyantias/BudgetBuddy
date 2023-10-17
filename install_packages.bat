@echo off
setlocal enabledelayedexpansion

:: Get the directory where the script is located
set "script_dir=%~dp0"

echo Installing Node.js packages...
echo The window may close when the operation completes.

:: Change the current directory to the script's directory
cd /d "!script_dir!"

:: Check if package-lock.json exists, and if so, use it for installation
if exist package-lock.json (
    npm ci || echo Failed to install packages.
) else (
    npm install
)

echo Packages installed successfully.

endlocal

echo Press any key to continue...

:: Prompt user to press any key before closing
pause
