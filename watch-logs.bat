@echo off
echo ========================================
echo MD Viewer - Monitor de Logs en Tiempo Real
echo ========================================
echo.
echo Mostrando solo errores de la app...
echo Presiona CTRL+C para salir
echo.

C:\Users\cra\platform-tools\adb.exe logcat -v time | findstr /I "Capacitor Console mdviewer ERROR"
