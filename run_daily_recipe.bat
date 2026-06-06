@echo off
setlocal
cd /d "%~dp0"

echo [Daily Recipe Cron] Iniciando ejecucion automatica... %date% %time%
echo.

:: Utilizamos PowerShell para hacer la peticion HTTP (ya que cURL a veces falla en entornos Windows viejos)
powershell -Command "try { $response = Invoke-RestMethod -Uri 'https://veganfood.es/api/cron/daily-recipe?secret=VEGAN_CRON_PRO_SECRET_123' -Method Get; Write-Output $response } catch { Write-Error $_.Exception.Message }"

echo.
echo [Daily Recipe Cron] Finalizado. %time%
echo.
endlocal
