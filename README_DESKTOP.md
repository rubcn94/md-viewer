# MD Viewer Desktop (Electron)

Visor de Markdown multiplataforma con sistema de lectura avanzado, compilado para Windows, macOS y Linux.

**Versión:** 2.0.0
**Última actualización:** 2026-05-10

---

## 📦 Descargar

### Windows
- **Instalador:** `dist/MD Viewer Setup 2.0.0.exe` (101 MB)
- **Portable:** `dist/win-unpacked/MD Viewer.exe` (368 MB descomprimido)

### macOS / Linux
```bash
npm run build:electron
```
Genera instaladores nativos para tu plataforma.

---

## ✨ Funcionalidades

### Gestión de archivos
✅ **Importar archivos** - Diálogo nativo de Windows, selección múltiple
✅ **Importar carpeta completa** - Preserva estructura de subcarpetas
✅ **Árbol recursivo** - Navegación por carpetas ilimitadas
✅ **Eliminar** - Long-press (500ms) o click derecho

### Sistema de lectura
✅ **Marcar como leído** - Tick verde al terminar un archivo
✅ **Bookmarks** - Guarda posición exacta de lectura (scroll + %)
✅ **Highlights** - Subraya texto importante (múltiples colores)
✅ **Progreso persistente** - Todo se guarda automáticamente

### Renderizado Markdown
✅ **GitHub Flavored Markdown**
✅ **Syntax highlighting** para código (highlight.js)
✅ **Dark theme** optimizado para OLED
✅ **Sistema de tabs** - Múltiples archivos abiertos
✅ **Búsqueda global** - Busca en todos los archivos

### Avanzado
✅ **Auto-updates** - Notificación de nuevas versiones (GitHub Releases)
✅ **Storage local** - Datos en `AppData/Roaming/md-viewer/`
✅ **Build optimizado** - Excluye módulos de Capacitor (solo móvil)

---

## 🚀 Instalación

### Opción 1: Instalador (recomendado)
1. Ejecuta `dist/MD Viewer Setup 2.0.0.exe`
2. Elige directorio de instalación
3. Acepta crear shortcuts (Escritorio + Menú Inicio)
4. ¡Listo! Abre "MD Viewer" desde el menú Inicio

### Opción 2: Portable (sin instalación)
1. Copia la carpeta `dist/win-unpacked/` a una USB
2. Ejecuta `MD Viewer.exe` directamente
3. Los datos se guardan en `AppData/Roaming/md-viewer/`

---

## 📂 Ubicación de datos

```
C:\Users\TU_USUARIO\AppData\Roaming\md-viewer\
├── md-viewer-docs\          ← Archivos importados
│   ├── archivo1.md
│   ├── carpeta1/
│   │   └── subcarpeta/
│   │       └── archivo2.md
│   └── ...
└── fileIndex.json           ← Metadata (read, bookmarks, highlights)
```

**⚠️ IMPORTANTE:** Si desinstalas la app, estos datos NO se eliminan automáticamente. Para limpiar completamente:
```cmd
rmdir /s /q "%APPDATA%\md-viewer"
```

---

## 🔧 Desarrollo

### Requisitos
- Node.js 18+
- npm 9+

### Comandos

```bash
# Ejecutar en desarrollo (con DevTools)
npm run electron

# O con flag de desarrollo
npm run electron:dev

# Compilar .exe (Windows)
npm run build:electron

# Compilar para macOS
npm run build:electron -- --mac

# Compilar para Linux
npm run build:electron -- --linux
```

### Estructura de archivos

```
md-viewer/
├── electron-main.js         ← Main process (Node.js)
├── electron-preload.js      ← API bridge (seguridad)
├── public/                  ← Frontend (compartido con móvil)
│   ├── index.html
│   ├── app.js              ← Detecta Electron vs Capacitor
│   └── modules/
│       ├── storage.js      ← Adaptado para Electron
│       ├── import.js       ← Usa dialog nativo
│       └── ...
├── dist/                    ← Build output (generado)
│   ├── MD Viewer Setup 2.0.0.exe
│   └── win-unpacked/
└── package.json
```

---

## 🔄 Auto-Updates

La app verifica actualizaciones automáticamente cada vez que se abre (solo en producción, no en desarrollo).

### Cómo funciona

1. **Al abrir la app** → Check GitHub Releases (3 segundos después)
2. **Si hay update** → Muestra diálogo con versión nueva
3. **Si aceptas** → Descarga en background (muestra barra de progreso)
4. **Al terminar** → Opción de instalar ahora o al cerrar

### Publicar nueva versión

1. Actualiza `version` en `package.json`
2. Compila: `npm run build:electron`
3. Crea release en GitHub con tag `v2.0.1` (ejemplo)
4. Sube `dist/MD Viewer Setup 2.0.0.exe` al release
5. Electron-updater detecta el nuevo release automáticamente

**Configuración actual:**
```json
"publish": {
  "provider": "github",
  "owner": "ruben",
  "repo": "md-viewer"
}
```

---

## 🔐 Code Signing (Firma de código)

⚠️ **Estado actual:** La app NO está firmada.

**Consecuencias:**
- Windows muestra "Editor desconocido"
- SmartScreen puede bloquear la instalación

**Solución:** Ver `CODE_SIGNING.md` para instrucciones completas.

**Resumen:**
- Compra certificado EV (~400€/año) → Sin warnings
- O certificado estándar (~100€/año) → Warnings hasta ganar reputación
- Configura `CSC_LINK` y `CSC_KEY_PASSWORD`
- Recompila con `npm run build:electron`

---

## 🎯 Diferencias Desktop vs Móvil

| Feature | Desktop (Electron) | Móvil (Capacitor) |
|---------|-------------------|-------------------|
| **File Picker** | Diálogo nativo Windows | Plugin Android/iOS |
| **Importar carpeta** | ✅ Nativo | ⚠️ Múltiples archivos |
| **Storage** | Node.js filesystem | Capacitor Preferences |
| **Tamaño app** | ~101 MB instalador | ~3.7 MB APK |
| **Plataformas** | Windows/Mac/Linux | Android/iOS |
| **Updates** | Auto-update GitHub | Manual (APK) |

---

## 🐛 Troubleshooting

### "Windows protegió tu PC" (SmartScreen)
- **Causa:** App sin firma de código
- **Solución temporal:** Click "Más información" → "Ejecutar de todos modos"
- **Solución permanente:** Comprar certificado (ver `CODE_SIGNING.md`)

### "No se pueden importar archivos"
1. Verifica permisos de la carpeta
2. Abre DevTools (F12) y mira errores en consola
3. Prueba con archivos en otra ubicación (ej: Desktop)

### "Los highlights no se restauran"
- Los highlights son sensibles a cambios de contenido
- Si editas el archivo fuera de la app, pueden desincronizarse
- Solución: No edites archivos importados externamente

### "La app no arranca"
```bash
# Eliminar datos corruptos
rmdir /s /q "%APPDATA%\md-viewer"

# Reinstalar
dist\MD Viewer Setup 2.0.0.exe
```

---

## 📊 Métricas de rendimiento

**Tamaño del build:**
- Instalador: 101 MB
- Carpeta descomprimida: 368 MB
- Ejecutable principal: ~150 MB (Electron runtime incluido)

**Reducción vs build inicial:**
- ✅ -2 MB excluyendo módulos de Capacitor
- ✅ Posible optimización futura: ~30 MB con tree-shaking agresivo

**Tiempo de inicio:**
- Primera ejecución: ~2-3 segundos
- Ejecuciones siguientes: ~1 segundo

---

## 🛠️ Próximas mejoras

- [ ] Icono personalizado (.ico de 256x256)
- [ ] Reducir tamaño con webpack/vite
- [ ] Modo offline completo
- [ ] Export highlights a PDF/HTML
- [ ] Integración con Obsidian/Notion
- [ ] Themes customizables

---

## 📄 Licencia

ISC License - Ver `LICENSE` para más detalles.

---

## 👨‍💻 Autor

**Ruben** - Security+ candidate, AI Security Specialist in training

---

**Última actualización:** 2026-05-10
**Build:** v2.0.0 (con auto-updates + optimizaciones)
