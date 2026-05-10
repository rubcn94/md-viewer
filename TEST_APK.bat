@echo off
echo ========================================
echo TEST MD VIEWER - Capturar Logs
echo ========================================
echo.
echo INSTRUCCIONES:
echo 1. NO abras la app todavia
echo 2. Ejecuta este script
echo 3. Cuando diga "READY", abre MD Viewer
echo 4. Espera 10 segundos
echo 5. Cierra la app
echo 6. Manda el archivo mdviewer-logs.txt
echo.
pause

echo.
echo Limpiando logcat anterior...
adb logcat -c

echo.
echo ========================================
echo READY - ABRE MD VIEWER AHORA
echo ========================================
echo Capturando logs durante 30 segundos...
echo.

adb logcat -s "mdviewer:*" "Capacitor:*" "Console:*" "chromium:*" "WebView:*" "om.mdviewer.app:*" > mdviewer-logs.txt

echo.
echo ========================================
echo Logs guardados en: mdviewer-logs.txt
echo Manda ese archivo
echo ========================================
pause
