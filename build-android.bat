@echo off
echo ========================================
echo MD Viewer - Build Android APK
echo ========================================
echo.

echo [1/3] Sincronizando archivos web a Android...
call npx cap sync android
if %errorlevel% neq 0 (
    echo ERROR: Fallo en sync
    pause
    exit /b 1
)
echo ✓ Sync completo
echo.

echo [2/3] Compilando APK con Gradle...
cd android
call gradlew.bat assembleDebug
if %errorlevel% neq 0 (
    echo ERROR: Fallo en build
    cd ..
    pause
    exit /b 1
)
cd ..
echo ✓ APK compilado
echo.

echo [3/3] APK listo en:
echo android\app\build\outputs\apk\debug\app-debug.apk
echo.

echo ========================================
echo Instalar en dispositivo:
echo   adb install -r android\app\build\outputs\apk\debug\app-debug.apk
echo ========================================
pause
