# MD Viewer Mobile - Memoria de Proyecto

**Versión:** 2.0.5 | **Stack:** Capacitor + Vanilla JS (ES6 Modules) + Android/iOS

---

## 📝 CHANGELOG RECIENTE

### 2026-05-25 - Auto-Update System + Save Highlights + HTML Fix
- **Auto-Update System:** Banner de actualización automático
  - Módulo `updater.js` con version checking desde GitHub
  - Banner animado con gradient y bounce effect
  - Verifica updates cada 6 horas automáticamente
  - Descarga directa desde releases (Android APK / Windows installer)
  - Compatible Electron + Capacitor
- **Guardar highlights embebidos:** Botón flotante para guardar subrayados en el archivo .md
  - Función `saveFileWithHighlights()` en `storage.js`
  - Botón flotante con contador de highlights
  - Animación fadeSlideIn suave
- **Fix HTML rendering:** `marked.js` ahora permite HTML embebido
  - `sanitize: false` para soportar diagramas HTML
  - Renders `<br>`, `<div>`, etc. correctamente

### 2026-05-11 - TOC Navigation + Drag & Drop Desktop
- **TOC Navigation:** Links internos con scroll suave y highlight temporal (2s)
  - Slugify automático de headers → IDs únicos
  - Funciona con TOC manuales y generados
- **Drag & Drop Desktop:** Arrastra archivos/carpetas en Electron
  - Soporte carpetas recursivas con FileSystemEntry API
  - Overlay visual con animación
  - Solo .md, .txt, .zip

### 2026-05-10 - App Icon
- Icono personalizado dark theme (MD + documento verde)
- Script automático: `node generate-mobile-icon.js`
- 74 assets Android (adaptive icons, splash screens)

### 2026-05-09 - Highlight System Fixes
- **ULTIMATE FIX:** Debounce 100ms + lectura directa de selección
- Multi-word highlighting con `extractContents()` + `insertNode()`
- Long-press para eliminar highlights (500ms)
- Menú flotante con 4 colores

### 2026-05-07 - UI Improvements + Critical Fixes
- Color picker 🎨, sticky header, eliminado botón Raw
- Fix importación carpetas: `ensureParentFolders()`
- Fix doble inicialización `longPress.js`

---

## 🎯 Descripción

Visor de Markdown móvil con:
- Importación archivos/carpetas con estructura preservada
- Sistema lectura: Ticks ✓, bookmarks 📍, highlights 🖍️
- Long-press delete (500ms)
- Tabs, búsqueda global, árbol recursivo

---

## 📦 Arquitectura Modular

```
public/
├── index.html              # UI + CSS embebido
├── app.js                  # Orquestador principal
└── modules/
    ├── storage.js          # Gestión archivos + metadata
    ├── import.js           # Importación archivos/carpetas
    ├── render.js           # Renderizado UI (árbol, MD)
    ├── readingProgress.js  # Lectura, bookmarks, highlights
    ├── longPress.js        # Gestos táctiles
    ├── tabs.js, search.js, ui.js, utils.js
    └── folderOperations.js, fileOperations.js
```

---

## ✅ Funcionalidades Clave

### 1. Importación
- **Plugin:** `@capawesome/capacitor-file-picker`
- Preserva estructura de carpetas/subcarpetas
- Soporta: .md, .txt, .zip (descomprime automático)
- **Desktop:** Drag & drop con carpetas recursivas

### 2. Árbol Recursivo
- Múltiples niveles con iconos ▶
- Contador de archivos por carpeta
- `buildFileTree()` → `renderTreeNode()` recursivo

### 3. Sistema Lectura
- **Ticks:** ○/✓ marca leídos
- **Bookmarks:** 📍 guarda posición scroll
- **Highlights:** 🖍️ subraya texto (multi-color, multi-palabra)
  - Long-press 500ms para eliminar
  - Menú flotante con 4 colores
  - Usa `extractContents()` para nodos complejos

### 4. Long-Press Delete
- 500ms sobre archivo/carpeta → menú contextual
- Vibración háptica + animación
- Compatible touch/mouse

### 5. TOC Navigation
- Slugify automático de headers
- Scroll suave + highlight temporal (2s)
- Funciona con TOC manuales y generados

---

## 🗄️ Modelo de Datos

```javascript
{
  path: "carpeta/archivo.md",
  name: "archivo.md",
  content: "# Contenido...",
  read: false,                    // ✓ Tick lectura
  bookmark: {                     // 📍 Posición guardada
    scroll: 1234,
    percent: 45,
    timestamp: "2026-05-07T..."
  },
  highlights: [                   // 🖍️ Subrayados
    {
      id: "1714567890123",
      text: "texto",
      color: "#ffd700",
      timestamp: "2026-05-07T..."
    }
  ]
}
```

**Storage:**
- `@capacitor/preferences` → fileIndex (JSON)
- `@capacitor/filesystem` → DATA/md-viewer-docs/

---

## 🎨 UI Theme

```css
--bg: #0f0f13           /* Background */
--surface: #17171f      /* Sidebar */
--accent: #5865f2       /* Azul Discord */
--text: #e2e2f0         /* Texto principal */
--green: #3ba55c        /* Success */
--red: #ed4245          /* Error */
```

**Componentes:**
1. Header → Logo, búsqueda, hamburguesa
2. Sidebar → Árbol, botón "Importar"
3. Main → Tabs + contenido MD renderizado
4. Doc Header → Título, botones (○📍🖍️🎨)
5. Context Menu → Long-press con animación

---

## 🔧 Comandos

### Desarrollo Web
```bash
npm run dev:web          # http://localhost:3000
```

### Android
```bash
npm run sync             # Sync web → Android/iOS
cd android
./gradlew assembleDebug  # → apk/debug/app-debug.apk
```

### Desktop (Electron)
```bash
npm run electron:build   # Build instalador
npm run electron:start   # Dev mode
```

**Instalar APK:**
```bash
adb uninstall com.mdviewer.app
adb install android/app/build/outputs/apk/debug/app-debug.apk
```

---

## 🐛 Limitaciones

1. **Highlights basados en texto:** Desincronización si cambia contenido
2. **No sync cloud:** Todo es local
3. **Plugin carpetas:** FilePicker no tiene `pickDirectory()` nativo

---

## 📋 TODOs

### Corto Plazo
- [ ] Tutorial onboarding primera vez
- [ ] Estadísticas de lectura
- [ ] Filtros sidebar (solo leídos, con bookmarks)

### Medio Plazo
- [ ] Exportar highlights a PDF
- [ ] Notas/comentarios por archivo
- [ ] Tags personalizadas

### Largo Plazo
- [ ] Sync en nube (Google Drive, Dropbox)
- [ ] Text-to-speech
- [ ] Spaced repetition system

---

## 🔍 Debug

### Errores comunes
- **"No importa archivos"** → Verifica permisos AndroidManifest.xml
- **"Highlights no restauran"** → Verifica `restoreHighlights()` en `renderMarkdown()`
- **"Long-press no funciona"** → Verifica `initLongPress()` en app.js

### Logs
```bash
# Errores en tiempo real
adb logcat -v time *:E

# Solo Capacitor
adb logcat -v time | grep "Capacitor"
```

---

## 🎓 Notas para Claude

### Al iniciar sesión:
1. Leer este archivo primero
2. NO reimplementar funcionalidades existentes
3. Verificar módulos antes de crear nuevos
4. Probar en móvil antes de confirmar

### Arquitectura:
- ES6 modules (sin bundler)
- **app.js** expone funciones a `window` para onclick handlers
- Async/await siempre con storage

### Sistema de Auto-Update:
**Deployment (IMPORTANTE):**
1. Subir `version.json` a la raíz del repositorio GitHub
2. Editar `version.json` con URLs reales de releases:
   ```json
   {
     "version": "2.0.5",
     "description": "Auto-update system + highlights + HTML fix",
     "downloadUrls": {
       "windows": "https://github.com/TU-USUARIO/md-viewer/releases/download/v2.0.5/MD.Viewer.Setup.2.0.5.exe",
       "android": "https://github.com/TU-USUARIO/md-viewer/releases/download/v2.0.5/md-viewer-v2.0.5.apk"
     }
   }
   ```
3. Crear release en GitHub con los archivos:
   - `MD Viewer Setup 2.0.5.exe` (dist/)
   - `app-debug.apk` → renombrar a `md-viewer-v2.0.5.apk`
4. Actualizar URLs en:
   - `version.json` (GitHub repo)
   - `public/modules/updater.js` línea 7 (si usas otro repo)

**Cómo funciona:**
- App verifica updates al iniciar (delay 5s) y cada 6 horas
- Fetch de `version.json` desde GitHub raw URL
- Compara versiones semánticas (major.minor.patch)
- Si hay update → banner animado con gradient
- Click "Descargar" → abre navegador/descarga directa
- Electron: usa `shell.openExternal()`
- Android: usa `window.open(url, '_system')`

### Build APK:
```bash
npx cap sync android
cd android && ./gradlew assembleDebug
```

---

## 📚 Plugins Principales

### @capacitor/filesystem
```javascript
await Filesystem.writeFile({
  path: 'md-viewer-docs/archivo.md',
  data: 'contenido...',
  directory: 'DATA'
});
```

### @capacitor/preferences
```javascript
await Preferences.set({
  key: 'fileIndex',
  value: JSON.stringify(data)
});
```

### @capawesome/capacitor-file-picker
```javascript
const result = await FilePicker.pickFiles({
  types: ['text/markdown', 'text/plain', '*/*'],
  multiple: true,
  readData: true
});
// result.files[0].path → preserva estructura
```

---

**Última actualización:** 2026-05-11
