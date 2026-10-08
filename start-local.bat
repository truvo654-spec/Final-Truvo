@echo off
cd /d "%~dp0"
where node >nul 2>nul || (echo Install Node.js 20+ from https://nodejs.org first & pause & exit /b 1)
if not exist node_modules call npm install
start "" http://localhost:3000
call npm run dev
pause
