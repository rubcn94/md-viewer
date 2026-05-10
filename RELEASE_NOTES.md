# MD Viewer v2.0.0 - Release Notes

**Fecha:** 2026-05-10
**Commit:** 994ad81

---

## 🚀 Novedades

### ✅ DESKTOP (Electron) - COMPLETO
Versión nativa de escritorio para Windows, macOS y Linux.

**Ubicación:** `dist/MD Viewer Setup 2.0.0.exe` (101 MB)

**Características:**
- ✅ Instalador Windows (NSIS)
- ✅ Auto-updates (GitHub Releases)
- ✅ Diálogo nativo de importación de archivos/carpetas
- ✅ Build optimizado (excluye módulos de Capacitor)
- ✅ Storage en AppData (persistente)
- ✅ Multi-plataforma (Windows/Mac/Linux)

**Cómo instalar:**
1. Ejecuta `dist/MD Viewer Setup 2.0.0.exe`
2. Elige directorio
3. ¡Listo!

**Datos guardados en:**
```
C:\Users\TU_USUARIO\AppData\Roaming\md-viewer\
├── md-viewer-docs\    ← Archivos .md importados
└── fileIndex.json     ← Metadata (read, bookmarks, highlights)
```

---

### ✅ MÓVIL (Android) - PRODUCTION READY
Versión release optimizada sin logs de debug.

**Ubicación:** `android/app/build/outputs/apk/release/app-release-unsigned.apk` (2.9 MB)

**Cambios v2.0.0:**
- ✅ Eliminados console.logs de debug
- ✅ versionCode: 2, versionName: 2.0.0
- ✅ Build release (optimizado, no debug)
- ⚠️ **Sin firmar** (requiere firma para Play Store)

**Cómo instalar (testing):**
```bash
# IMPORTANTE: Desinstalar versión vieja primero
adb uninstall com.mdviewer.app

# Instalar nueva versión
adb install android/app/build/outputs/apk/release/app-release-unsigned.apk
```

**Para Play Store:**
Ver `ANDROID_SIGNING.md` (crear keystore y firmar APK)

---

## 📦 Archivos generados

### Desktop
```
dist/
├── MD Viewer Setup 2.0.0.exe       ← INSTALADOR (101 MB)
└── win-unpacked/
    └── MD Viewer.exe               ← PORTABLE (368 MB)
```

### Móvil
```
android/app/build/outputs/apk/
├── debug/
│   └── app-debug.apk               ← Debug (3.7 MB, con logs)
└── release/
    └── app-release-unsigned.apk    ← Release (2.9 MB, sin logs)
```

---

## ✨ Funcionalidades (ambas plataformas)

### Gestión de archivos
- ✅ Importar múltiples archivos .md
- ✅ Importar carpetas completas (preserva estructura)
- ✅ Árbol recursivo de carpetas
- ✅ Eliminar con long-press (500ms)

### Sistema de lectura
- ✅ **Marcar como leído** (tick verde ✓)
- ✅ **Bookmarks** (📍 guardar posición, 📌 volver)
- ✅ **Highlights** (🖍️ subrayar texto, múltiples colores)
- ✅ **Persistencia** (todo se guarda automáticamente)

### Renderizado
- ✅ GitHub Flavored Markdown
- ✅ Syntax highlighting (código)
- ✅ Dark theme OLED
- ✅ Sistema de tabs
- ✅ Búsqueda global

---

## 🔧 Comandos útiles

### Desktop
```bash
# Desarrollo (con DevTools)
npm run electron

# Compilar instalador
npm run build:electron

# Compilar para macOS
npm run build:electron -- --mac

# Compilar para Linux
npm run build:electron -- --linux
```

### Móvil
```bash
# Build debug (con logs)
cd android && ./gradlew.bat assembleDebug

# Build release (sin logs)
cd android && ./gradlew.bat assembleRelease

# Instalar en dispositivo
adb install android/app/build/outputs/apk/release/app-release-unsigned.apk
```

---

## 📊 Comparativa Desktop vs Móvil

| Feature | Desktop (Electron) | Móvil (Android) |
|---------|-------------------|-----------------|
| **Tamaño instalador** | 101 MB | 2.9 MB |
| **Plataforma** | Windows/Mac/Linux | Android/iOS |
| **Importar carpeta** | ✅ Diálogo nativo | ⚠️ Múltiples archivos |
| **Auto-updates** | ✅ GitHub Releases | ❌ Manual |
| **Storage** | AppData | Internal storage |
| **Debugging** | DevTools (F12) | Chrome inspect |

---

## 🐛 Problemas conocidos

### Desktop
- ⚠️ **Sin firma de código** → Windows muestra "Editor desconocido"
  - **Solución:** Ver `CODE_SIGNING.md` (certificado ~400€/año)
  - **Workaround:** "Más información" → "Ejecutar de todos modos"

### Móvil
- ⚠️ **APK sin firmar** → No se puede subir a Play Store
  - **Solución:** Ver `ANDROID_SIGNING.md` (crear keystore)
  - **Workaround:** Instalar manualmente con ADB (solo testing)

---

## 📄 Documentación

- **Desktop:** `README_DESKTOP.md`
- **Code Signing:** `CODE_SIGNING.md`
- **Android Signing:** `ANDROID_SIGNING.md` (por crear)
- **Debugging:** `DEBUGGING.md`
- **Instalación:** `INSTRUCCIONES_INSTALACION.md`

---

## 🔗 Git

**Commits:**
- `4155e8b` - Electron Desktop v2.0.0 (auto-updates + optimizaciones)
- `994ad81` - Android Release v2.0.0 (production ready, sin debug)

**Branches:**
- `main` - Versión estable actual

**Remote:** (pendiente configurar GitHub)
```bash
# Para subir a GitHub:
git remote add origin https://github.com/TU_USUARIO/md-viewer.git
git push -u origin main
```

---

## 🚀 Próximos pasos

### Corto plazo
- [ ] Crear keystore para firmar APK Android
- [ ] Publicar releases en GitHub (para auto-update Desktop)
- [ ] Crear icono personalizado (.ico 256x256)

### Medio plazo
- [ ] Certificado de firma de código Desktop (~400€/año)
- [ ] Publicar en Google Play Store
- [ ] Publicar en Microsoft Store (gratis, auto-firmado)

### Largo plazo
- [ ] Versión iOS (Capacitor)
- [ ] Export highlights a PDF/HTML
- [ ] Sync en la nube (Google Drive)
- [ ] Themes customizables

---

## 👨‍💻 Autor

**Ruben** - Security+ candidate, AI Security Specialist

**Generado con Claude Code**

---

**¡Disfruta MD Viewer v2.0.0! 🎉**
