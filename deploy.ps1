# deploy.ps1 - Commit + push en un solo paso
# Uso:
#   .\deploy.ps1 "mensaje del commit"
#
# Ejemplo:
#   .\deploy.ps1 "Corrijo el formulario de horarios"
#
# Si no se pasa mensaje, preguntá por uno.

param(
    [string]$Mensaje = ""
)

$ErrorActionPreference = "Stop"

# Carpeta del proyecto (la misma donde está este script)
Set-Location -LiteralPath $PSScriptRoot

if ([string]::IsNullOrWhiteSpace($Mensaje)) {
    $Mensaje = Read-Host "Mensaje del commit"
    if ([string]::IsNullOrWhiteSpace($Mensaje)) {
        Write-Host "No se ingresó un mensaje. Cancelado." -ForegroundColor Red
        exit 1
    }
}

Write-Host "`n=== Agregando cambios ===" -ForegroundColor Cyan
git add -A
if (-not $?) { exit 1 }

Write-Host "=== Commit ===" -ForegroundColor Cyan
git commit -m $Mensaje

# Si no hay nada para commitear (sin cambios), git commit sale con error.
if ($LASTEXITCODE -ne 0) {
    Write-Host "`nNo hay cambios pendientes para subir." -ForegroundColor Yellow
    exit 0
}

Write-Host "=== Push a GitHub (Vercel hace deploy automático) ===" -ForegroundColor Cyan
git push origin main
if ($LASTEXITCODE -ne 0) {
    Write-Host "`nEl push falló. Revisá la salida de arriba." -ForegroundColor Red
    exit 1
}

Write-Host "`nListo. Vercel está desplegando la actualización." -ForegroundColor Green
