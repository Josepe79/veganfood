@echo off
echo ========================================================
echo INICIANDO MOTOR DE DEEP SCRAPING DE FELIUBADALO (NIGHTLY)
echo ========================================================

echo.
echo [1/3] Activando entorno virtual de Python y arrancando Headless Scraper...
cd scraper
call venv\Scripts\activate.bat
python scraper_deep.py

if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Falló el rastrojo de Python.
    exit /b %ERRORLEVEL%
)

echo.
echo [2/3] Scraper profundo terminado. Entregando datos al motor NextJS...
cd ..\web

echo [3/3] Inyectando descripciones a PostgreSQL (Railway)...
call npm run sync:descriptions

if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Falló la sincronización Node a Prisma.
    exit /b %ERRORLEVEL%
)

echo.
echo ========================================================
echo SECUENCIA DE DEEP SCRAPING NOCTURNO COMPLETADA CON EXITO.
echo ========================================================
exit /b 0
