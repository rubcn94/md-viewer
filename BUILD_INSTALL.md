# Compilar e instalar MD Viewer en Android

## Paso 1: Instalar JDK 21 (requerido)

**Descargar e instalar:**
```bash
# Descarga JDK 21 desde:
# https://adoptium.net/temurin/releases/?version=21

# O con winget:
winget install EclipseAdoptium.Temurin.21.JDK
```

Después de instalar, reinicia la terminal.

## Paso 2: Compilar APK

```bash
cd C:\Users\cra\Proyectos\md-viewer\android
./gradlew assembleDebug
```

El APK se genera en:
```
android/app/build/outputs/apk/debug/app-debug.apk
```

## Paso 3: Instalar en móvil

### Opción A: Via ADB (USB o WiFi)

**Si tienes ADB instalado:**
```bash
# USB
adb install android/app/build/outputs/apk/debug/app-debug.apk

# O WiFi (si tienes adb wifi configurado)
adb connect <IP_MOVIL>:5555
adb install android/app/build/outputs/apk/debug/app-debug.apk
```

### Opción B: Via SSH/Termux

**Si tienes SSH al móvil:**

**1. Desde PC, copiar APK al móvil:**
```bash
scp android/app/build/outputs/apk/debug/app-debug.apk <user>@<IP_MOVIL>:/sdcard/Download/
```

**2. En Termux (móvil):**
```bash
termux-setup-storage
pm install /sdcard/Download/app-debug.apk
```

O más simple:
```bash
am start -a android.intent.action.VIEW -d file:///sdcard/Download/app-debug.apk -t application/vnd.android.package-archive
```

### Opción C: Compartir carpeta (tu caso)

Como tienes la carpeta enlazada por SSH:

**En Termux (móvil):**
```bash
cd <RUTA_CARPETA_ENLAZADA>/md-viewer/android/app/build/outputs/apk/debug
pm install app-debug.apk
```

## Paso 4: Abrir app

```bash
# Desde Termux o ADB
am start -n com.mdviewer.app/.MainActivity
```

O búscala en el launcher como "MD Viewer"

## Troubleshooting

**Error "INSTALL_FAILED_UPDATE_INCOMPATIBLE":**
```bash
# Desinstala versión anterior primero
pm uninstall com.mdviewer.app
# Luego reinstala
pm install app-debug.apk
```

**Error permisos SSH:**
```bash
chmod +x android/app/build/outputs/apk/debug/app-debug.apk
```

**Ver logs en tiempo real:**
```bash
adb logcat | grep -i mdviewer
# O en Termux:
logcat | grep -i mdviewer
```
