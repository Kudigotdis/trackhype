@echo off
title TrackHype Dev Server
cd /d "%~dp0"
echo ==============================================
echo   TrackHype - starting dev server...
echo   Double-click is now via HTTP, so the SPA
echo   loader keeps music playing (no skipping).
echo ==============================================
echo.
py -c "import sys; sys.exit(0 if sys.version_info[0] >= 3 else 1)" >nul 2>&1
if errorlevel 1 (
    echo Python 3 was not found. Install it, or run:  python serve.py --open
    pause
    exit /b 1
)
py serve.py --open
echo.
echo Server stopped.
pause