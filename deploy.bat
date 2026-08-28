@echo off
rem deploy.bat - Commit + push en un solo paso.
rem Uso:
rem   deploy.bat "mensaje del commit"
rem   o simplemente: deploy.bat  (te va a pedir el mensaje)

if "%~1"=="" (
    echo Uso: deploy.bat "mensaje del commit"
    echo Ejemplo: deploy.bat "Corrijo el formulario de horarios"
    echo.
    set /p msg="Mensaje del commit: "
    powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0deploy.ps1" -Mensaje "%msg%"
) else (
    powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0deploy.ps1" -Mensaje "%~1"
)
