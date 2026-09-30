@echo off
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo Installa Node.js 22 o successivo, poi riapri questo file.
  pause
  exit /b 1
)
echo Apri http://127.0.0.1:8765 nel browser.
echo Lascia questa finestra aperta durante l'uso dal computer.
node scripts\serve.cjs
pause
