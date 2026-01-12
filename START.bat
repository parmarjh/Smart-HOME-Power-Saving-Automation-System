@echo off
echo ========================================
echo   SMART POWER SAVING AUTOMATION
echo   AI-Powered Light Control System
echo ========================================
echo.
echo Starting server...
echo.
echo Dashboard will open at: http://localhost:5000
echo Press Ctrl+C to stop the server
echo.
echo ========================================
echo.

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Python is not installed or not in PATH
    echo Please install Python 3.8+ from python.org
    pause
    exit /b 1
)

REM Check if requirements are installed
pip show flask >nul 2>&1
if errorlevel 1 (
    echo Installing required packages...
    pip install -r requirements.txt
    echo.
)

REM Start the server
python server.py

pause
