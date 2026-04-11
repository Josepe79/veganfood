$logPath = "C:\Users\JosepCorral\.gemini\antigravity\scratch\veganfood\cron_log.txt"
$dateStr = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
$startMsg = "`n===========================================`n[INFO] Starting VeganFood JIT Sync at $dateStr"
Add-Content -Path $logPath -Value $startMsg

try {
    # 1. Ejecutar Extracción Ligera (Catálogo Principal)
    Add-Content -Path $logPath -Value "[INFO] Fase 1: Extraer URLs y precios B2B (scraper.py)"
    Set-Location -Path "C:\Users\JosepCorral\.gemini\antigravity\scratch\veganfood\scraper"
    
    # Utilizar el Python del entorno virtual directamente en lugar de activar scripts de shell
    & ".\venv\Scripts\python.exe" scraper.py 2>&1 | Out-File -Append -Encoding UTF8 -FilePath $logPath

    # 2. Ejecutar Extracción Profunda (Fichas Técnicas JIT)
    Add-Content -Path $logPath -Value "[INFO] Fase 2: Extracción Lenta y Segura (scraper_deep.py)"
    & ".\venv\Scripts\python.exe" scraper_deep.py 2>&1 | Out-File -Append -Encoding UTF8 -FilePath $logPath

    # 3. Empujar los datos hacia Producción en Railway
    Add-Content -Path $logPath -Value "[INFO] Fase 3: Inyectar Fichas Completas a BBDD PostgreSQL de Railway"
    Set-Location -Path "C:\Users\JosepCorral\.gemini\antigravity\scratch\veganfood\web"
    
    # Si npm/npx lanzan comandos, forzamos su salida al log
    & cmd.exe /c "npx prisma db seed" 2>&1 | Out-File -Append -Encoding UTF8 -FilePath $logPath

    $endDateStr = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
    Add-Content -Path $logPath -Value "[SUCCESS] Ciclo Híbrido Finalizado Exitosamente a las $endDateStr"

} catch {
    $err = $_.Exception.Message
    $errDateStr = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
    Add-Content -Path $logPath -Value "[CRITICAL] $errDateStr - ERROR FATAL EN PIPELINE: $err"
}
