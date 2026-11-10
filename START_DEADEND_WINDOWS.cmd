@echo off
setlocal
cd /d "%~dp0"
title DeadEnd AI - 3D Investigation Workspace
where node >nul 2>nul
if errorlevel 1 (
 echo ERROR: Install Node.js 20 or newer from https://nodejs.org/
 pause
 goto :eof
)
if not exist package.json (
 echo ERROR: You must extract the complete archive, then run this file from its extracted folder.
 pause
 goto :eof
)
set PORT=3001
powershell -NoProfile -Command "try { $c=Get-NetTCPConnection -LocalPort 3001 -State Listen -ErrorAction Stop; if($c){ exit 1 } } catch { exit 0 }"
if errorlevel 1 (
 echo Port 3001 is already in use. Selecting port 3002.
 set PORT=3002
)
echo.
echo  DEADEND AI - 3D INVESTIGATION WORKSPACE
 echo  Launching at http://localhost:%PORT%
echo  This window must remain open. Use Ctrl+C to stop.
echo.
start "" "http://localhost:%PORT%"
node server.js
 echo.
echo  Server has stopped. Check errors shown above.
pause
