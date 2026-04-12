@echo off
echo ========================================================
echo   [VeganFood JIT] INICIO SINCRONIZACION DE REFERENCIAS
echo ========================================================
echo Hora de inicio: %time%
echo.

echo [1/2] Desplegando rastreador tactico para capturar Roturas de Stock en Feliubadalo...
cd scraper
call venv\Scripts\activate.bat
python scraper.py
call venv\Scripts\deactivate.bat

echo.
echo [2/2] Inyectando mapeo restrictivo de 'Agotados' en Base de Datos Principal de NextJS...
cd ..\web
call npm run sync:stock

echo.
echo ========================================================
echo   [VeganFood JIT] MANTENIMIENTO COMPLETADO EXITOSAMENTE
echo ========================================================
echo Hora de fin: %time%
echo.
echo (Cierra esta ventana o programa el Administrador de Tareas de Windows para que lo haga silenciosamente cada hora)
