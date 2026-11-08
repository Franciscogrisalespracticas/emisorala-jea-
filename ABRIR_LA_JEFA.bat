@echo off
setlocal
cd /d "%~dp0"
if not exist "assets\img\municipalities\pereira.jpg" (
  echo Preparando fotografias y audio abierto para uso local...
  powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0PREPARAR_MEDIA_LOCAL.ps1" -NoPause
)
start "" http://localhost:8080
where py >nul 2>nul
if %errorlevel%==0 (
  py -m http.server 8080
) else (
  python -m http.server 8080
)
