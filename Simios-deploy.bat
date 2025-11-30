@echo off
title Deploy Simios Stadio
cd /d "%~dp0"

echo ==========================
echo  EJECUTANDO npm run build
echo ==========================
npm run build
echo.

echo ==========================
echo  EJECUTANDO firebase deploy
echo ==========================
firebase deploy --only hosting
echo.

echo ==========================
echo  FIN DEL DEPLOY
echo ==========================

pause
