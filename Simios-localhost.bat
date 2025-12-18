@echo off
title Simios Localhost

echo Iniciando servidor local de Vite...
echo.

REM Moverse a la carpeta del proyecto (CAMBIA esta ruta si tu carpeta está en otro lugar)
cd /d "C:\Simios Stadio Web"

REM Iniciar Vite en una nueva ventana
start cmd /k "npm run dev"

REM Esperamos unos segundos para que Vite arranque
timeout /t 3 >nul

REM Abrir el navegador en localhost
start http://localhost:5173/

exit
