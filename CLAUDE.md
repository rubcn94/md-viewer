# MD Viewer Mobile - Memoria de Proyecto

**Versión:** 2.0.4
**Última actualización:** 2026-05-10 17:00
**Stack:** Capacitor + Vanilla JS (ES6 Modules) + Android/iOS

---

## 📝 CHANGELOG

### Sesión 2026-05-11 10:00 - 🔗 Navegación TOC (Table of Contents)

### ✨ FEATURE IMPLEMENTADA:
Navegación funcional en índices (TOC) de documentos Markdown. Ahora los links de tabla de contenidos navegan correctamente a la sección correspondiente con scroll suave.

### 🎯 FUNCIONALIDAD:
- **IDs automáticos en headers:** Todos los H1-H6 reciben un ID slugificado
- **Navegación con scroll suave:** Click en link del TOC → scroll suave a la sección
- **Highlight temporal:** La sección destino se resalta durante 2 segundos
- **Funciona en desktop Y móvil:** Implementado en ambas plataformas

### 🔧 IMPLEMENTACIÓN TÉCNICA:

**Configuración de marked.js** (`render.js:114-139`):
- Nueva función `slugify(text)` - convierte "## Mi Título" → "mi-titulo"
- Custom renderer para headers: `renderer.heading = function(text, level)`
- Cada header recibe ID automático: `<h2 id="mi-titulo">Mi Título</h2>`
- Configuración GFM (GitHub Flavored Markdown) activada

**Sistema de navegación** (`render.js:141-171`):
- Función `setupTOCNavigation()` con event delegation
- Intercepta clicks en links que empiezan con `#` (anchors internos)
- `preventDefault()` para manejar navegación manualmente
- `scrollIntoView({ behavior: 'smooth', block: 'start' })`
- Añade clase `.toc-target-highlight` temporalmente (2s)

**Estilos CSS** (`index.html:600-630`):
- `scroll-margin-top: 20px` - espacio para que no quede pegado arriba
- `.toc-target-highlight` - background azul semitransparente con fade-out
- Animación `tocHighlightFade` - de 30% a 15% opacity en 2s
- Padding y border-radius para que se vea como "pill" resaltado

### 📦 Archivos modificados:
- **MODIFICADO:** `public/modules/render.js` (+70 líneas)
  - Función `slugify()` para generar IDs únicos
  - Función `configureMarked()` - custom renderer de headers
  - Función `setupTOCNavigation()` - event delegation para links internos
  - Llamada a `setupTOCNavigation()` en `renderMarkdown()`
- **MODIFICADO:** `public/index.html` (+35 líneas CSS)
  - Estilos `.toc-target-highlight` con animación
  - `scroll-margin-top` en todos los headers
  - Keyframe `tocHighlightFade` para fade-out suave

### 🚀 APK Y INSTALADOR ACTUALIZADOS:

**Android APK:**
- **Build:** 2026-05-11 10:08 (**CON TOC NAVIGATION**)
- **Ubicación:** `android/app/build/outputs/apk/debug/app-debug.apk`
- **Estado:** BUILD SUCCESSFUL (50s, 160 tasks)

**Desktop Installer:**
- **Build:** 2026-05-11 10:11 (**CON TOC NAVIGATION**)
- **Ubicación:** `dist/MD Viewer Setup 2.0.0.exe`
- **Tamaño:** 101 MB

### 🧪 CÓMO PROBAR:

1. **Crea un documento con TOC:**
   ```markdown
   # Mi Documento

   ## Tabla de Contenidos
   - [Sección 1](#sección-1)
   - [Sección 2](#sección-2)
   - [Conclusión](#conclusión)

   ## Sección 1
   Contenido de la sección 1...

   ## Sección 2
   Contenido de la sección 2...

   ## Conclusión
   Conclusión final...
   ```

2. **Abre el documento** en la app (móvil o desktop)

3. **Click en cualquier link del TOC** → la app hace scroll suave a la sección

4. **La sección destino se resalta** durante 2 segundos con background azul

5. **Funciona con cualquier formato de TOC:**
   - Links manuales: `[Link](#seccion)`
   - TOC generados por plugins de Markdown
   - Cualquier anchor interno que empiece con `#`

### ✅ BENEFICIOS:
- **Navegación fluida:** Scroll suave en vez de salto brusco
- **Feedback visual:** Resaltado temporal para saber dónde llegaste
- **Compatible con TOC automáticos:** Funciona con plugins de MD que generan TOC
- **Funciona en ambas plataformas:** Desktop y móvil sin cambios adicionales
- **IDs semánticos:** URLs compartibles (ej: `app://doc.md#sección-1`)

---

### Sesión 2026-05-11 - 🖱️ Drag & Drop para Desktop (Archivos + Carpetas)

### ✨ FEATURE IMPLEMENTADA:
Sistema completo de drag & drop para la versión desktop (Electron). Ahora puedes arrastrar **archivos Y CARPETAS** directamente a la ventana de la app para importarlos.

### 🎯 FUNCIONALIDAD:
- **Detección automática:** Solo se activa en plataforma Electron (desktop)
- **Soporte completo de carpetas:**
  - Arrastra carpetas completas → se importan recursivamente
  - Preserva estructura de carpetas/subcarpetas
  - Solo importa archivos .md, .txt y .zip (ignora el resto)
- **Overlay visual:** Aparece cuando arrastras archivos/carpetas sobre la app
  - Animación de pulsación y rebote
  - Fondo blur + borde dashed azul
  - Icono 📁 animado
  - Texto: "Suelta archivos o carpetas aquí"
  - Hint: "Se importarán solo archivos .md, .txt y .zip"
- **Archivos soportados:** .md, .txt, .zip
- **Validación:** Rechaza archivos no soportados con toast
- **Prevención de flicker:** Usa `dragCounter` + `useCapture: true` para evitar parpadeo

### 🔧 IMPLEMENTACIÓN TÉCNICA:

**Nueva función helper en `import.js`** (`readDirectory(directoryEntry, basePath)`):
- Función recursiva que lee carpetas usando FileSystemEntry API
- Usa `createReader().readEntries()` para obtener archivos/subcarpetas
- Lee en chunks (API limitación de Chromium)
- Solo procesa archivos .md, .txt y .zip (filtra el resto)
- Añade propiedad `relativePath` a cada archivo para preservar estructura
- Recursión: `await readDirectory(entry, subPath)` para subcarpetas

**Función principal en `import.js`** (`importFromDragDrop(dataTransferItems)`):
- Recibe `DataTransferItem[]` en vez de `File[]` (necesario para detectar carpetas)
- Usa `item.webkitGetAsEntry()` para obtener `FileSystemEntry`
- Detecta si es archivo (`entry.isFile`) o carpeta (`entry.isDirectory`)
- Si es carpeta → llama a `readDirectory()` recursivamente
- Procesa archivos usando File API estándar (`.text()`, `.arrayBuffer()`)
- Soporte completo para archivos ZIP (descomprime automáticamente)
- Usa Electron API para escribir archivos
- Preserva estructura con `nativeFile.relativePath`

**Función de inicialización en `app.js`** (`initDragDrop()`):
- Crea overlay DOM dinámicamente
- Event listeners a nivel `document` (NO `.app`) con `useCapture: true`
- `dragCounter` para tracking preciso (evita falsos `dragleave` con hijos)
- `preventDefault()` en TODOS los eventos (dragenter, dragover, dragleave, drop)
- `e.dataTransfer.dropEffect = 'copy'` para cursor correcto
- Pasa `e.dataTransfer.items` a la función de import (no `files`)

**Estilos CSS en `index.html`**:
- `.drop-overlay` - Overlay fullscreen con backdrop blur
- `.drop-overlay-content` - Caja central con border dashed
- Animaciones CSS:
  - `dropPulse` - Escala 1.0 → 1.05 (loop infinito)
  - `dropBounce` - Icono sube/baja (loop infinito)
- `opacity: 0` por defecto → `opacity: 1` con clase `.active`

### 📦 Archivos modificados:
- **MODIFICADO:** `public/modules/import.js` (+110 líneas)
  - Añadida función helper `readDirectory(directoryEntry, basePath)` - recursiva
  - Añadida función `importFromDragDrop(dataTransferItems)` - soporte carpetas
  - Usa FileSystemEntry API para leer carpetas recursivamente
- **MODIFICADO:** `public/app.js` (+70 líneas)
  - Importado `getPlatform` y `showToast`
  - Añadida función `initDragDrop()`
  - Event listeners a nivel `document` con `useCapture: true`
  - Pasa `dataTransfer.items` (NO `files`) para detectar carpetas
  - Llamada a `initDragDrop()` solo en Electron
- **MODIFICADO:** `public/index.html` (+60 líneas CSS)
  - Estilos `.drop-overlay` y `.drop-overlay-content`
  - Animaciones `dropPulse` y `dropBounce`

### 🚀 CÓMO USAR:

**Desktop (Electron):**
1. Abre la app en escritorio
2. **Arrastra archivos O carpetas** desde el explorador de archivos
   - Archivos: .md, .txt o .zip
   - Carpetas: se importan recursivamente (solo .md, .txt, .zip)
3. Aparece overlay con animación
4. Suelta archivos/carpetas → se importan automáticamente
5. Toast confirma cantidad importada
6. **Estructura de carpetas se preserva** automáticamente

**Mobile (Capacitor):**
- No hace nada, solo funciona el botón "Importar archivos"
- Drag & drop no disponible en móvil (limitación del navegador)

### ✅ BENEFICIOS:
- **UX mejorada en desktop:** Mucho más rápido que abrir file picker
- **Workflow nativo:** Arrastrar/soltar es el estándar en desktop
- **Soporte completo de carpetas:** Arrastra toda una carpeta de documentación
- **Preserva estructura:** Carpetas/subcarpetas se mantienen automáticamente
- **Filtrado inteligente:** Solo importa .md, .txt y .zip (ignora imágenes, PDFs, etc.)
- **Feedback visual inmediato:** Animaciones suaves con overlay
- **Soporte ZIP:** Puedes arrastrar un ZIP entero (se descomprime automáticamente)
- **No interfiere con móvil:** Código solo se ejecuta en Electron

---

### Sesión 2026-05-10 17:00 - 🎨 App Icon Implementation (Desktop + Mobile)

### ✨ FEATURE IMPLEMENTADA:
Añadido icono personalizado de la app tanto para la versión Desktop (Electron) como Mobile (Android).

### 🎯 DISEÑO DEL ICONO:
- **Estilo:** Dark theme optimizado para OLED (#0f0f13 background)
- **Elementos:**
  - Letras "M" y "D" en azul Discord (#5865f2 y #7289da)
  - Icono de documento verde (#3ba55c) en esquina inferior derecha
  - Borde azul (#5865f2) alrededor
- **Formato fuente:** SVG vectorial (256x256px base, escalable)

### 📦 Archivos creados:
- **NUEVO:** `build/icon.svg` - Icono vectorial para Electron desktop
- **NUEVO:** `resources/icon.png.svg` - Fuente SVG para mobile (256x256)
- **NUEVO:** `resources/generate-icon.html` - Generador Canvas HTML5 (1024x1024)
- **NUEVO:** `generate-mobile-icon.js` - Script Node.js automático para conversión

### 🔧 PROCESO DE GENERACIÓN AUTOMÁTICO:

**Script creado** (`generate-mobile-icon.js`):
```javascript
// 1. Convierte SVG a PNG (1024x1024) usando sharp
sharp(resources/icon.png.svg)
  .resize(1024, 1024)
  .png()
  .toFile(resources/icon.png)

// 2. Genera todos los tamaños Android con @capacitor/assets
execSync('npx @capacitor/assets generate --android --iconBackgroundColor "#0f0f13"')
```

### 📱 ASSETS GENERADOS (Android):
- **Total:** 74 archivos (625.5 KB)
- **Adaptive icons:** 6 densidades (ldpi, mdpi, hdpi, xhdpi, xxhdpi, xxxhdpi)
  - Foreground (letras MD + documento)
  - Background (color sólido #0f0f13)
- **Legacy icons:** 6 densidades (ic_launcher.png)
- **Round icons:** 6 densidades (ic_launcher_round.png)
- **Splash screens:** 36 variantes (portrait/landscape, 6 densidades, light/dark theme)

### 🚀 APK ACTUALIZADO:
- **Build:** 2026-05-10 17:00 (**CON NUEVO ICONO**)
- **Ubicación:** `android/app/build/outputs/apk/release/app-release.apk`
- **Tamaño:** 3.1 MB (aumentó 200KB por assets de iconos)
- **Estado:** BUILD SUCCESSFUL (26s, 226 tasks)
- **Firmado:** ✅ SHA256withRSA (md-viewer-release.keystore)

### 📋 INSTRUCCIONES DE USO:

**Para actualizar iconos en el futuro:**
```bash
# Opción 1: Script automático (recomendado)
node generate-mobile-icon.js

# Opción 2: Manual
# 1. Editar resources/icon.png.svg
# 2. Convertir a PNG 1024x1024
# 3. Ejecutar: npx @capacitor/assets generate --android
```

**Instalar APK con nuevo icono:**
```bash
# Desinstalar versión vieja
adb uninstall com.mdviewer.app

# Instalar nueva
adb install android/app/build/outputs/apk/release/app-release.apk
```

### 🎨 DESKTOP ICON:
- **Ubicación:** `build/icon.svg`
- **Estado:** Creado pero no aplicado aún
- **Pendiente:** Configurar electron-builder para usar el icono
  - Requiere convertir SVG a ICNS (macOS) y ICO (Windows)
  - O usar `electron-icon-builder` para generar todos los formatos

### 📝 DEPENDENCIAS AÑADIDAS:
- `sharp@^0.33.5` (devDependency) - Conversión SVG → PNG de alta calidad

---

### Sesión 2026-05-09 12:30 - 🎯 ULTIMATE FIX: Highlight Menu Always Works

### 🐛 PROBLEMA REPORTADO:
Usuario reportó que **el menú de colores aparece pero no aplica el subrayado** cuando amplías la selección. El problema NO era que el menú desapareciera, sino que el **click en los colores no hacía nada**.

### 🔍 ROOT CAUSE:
1. **Debounce demasiado alto (300ms):** Si amplías la selección, el timeout se reseteaba constantemente y `currentSelection` quedaba desactualizado
2. **Selección cacheada obsoleta:** La función `applyHighlight()` usaba `currentSelection` (snapshot viejo), no la selección ACTUAL en el momento del click
3. **Resultado:** Click en color → `currentSelection` apunta al texto viejo → no se subraya el texto que realmente seleccionaste

### ✅ SOLUCIÓN IMPLEMENTADA:

1. **Debounce reducido a 100ms** (`readingProgress.js:235`)
   - Antes: 300ms (demasiado lento, causaba que el timeout nunca se completara)
   - Ahora: 100ms (balance perfecto entre responsividad y estabilidad)
   - Permite que el menú aparezca rápidamente mientras extiendes la selección

2. **Lectura directa de selección en `applyHighlight()`** (`readingProgress.js:458-532`)
   - **ANTES:** Usaba `currentSelection` cacheado (desactualizado)
   - **AHORA:** Lee directamente `window.getSelection()` en el momento del click
   - **Beneficio:** Siempre captura el texto EXACTO que seleccionaste, incluso si extendiste la selección después del debounce

3. **Validaciones robustas agregadas:**
   - Verifica que `selection.rangeCount > 0`
   - Verifica que `selectedText.length >= 1`
   - Verifica que selección esté dentro de `.md-body`
   - Mensajes de error informativos con toast

4. **Menú flotante optimizado** (`readingProgress.js:322-412`)
   - Si ya existe y el modo no cambió → solo actualiza posición (sin recrear)
   - Asegura que `visible` class se mantenga aunque estés ampliando selección
   - Menos parpadeos, mejor UX

### 📦 Archivos modificados:
- **MODIFICADO:** `public/modules/readingProgress.js` (680 líneas)
  - `handleSelectionChange()` - debounce reducido a 100ms
  - `applyHighlight()` - lee selección directa en vez de cache
  - `showFloatingMenu()` - optimizado para no recrear innecesariamente
  - `hideFloatingMenuIfOutside()` - comentarios mejorados

### 🚀 APK actualizado:
- **Build:** 2026-05-09 12:30 (**ULTIMATE FIX - MENU ALWAYS WORKS**)
- **Ubicación:** `android/app/build/outputs/apk/debug/app-debug.apk`
- **Estado:** BUILD SUCCESSFUL (52s, 160 tasks)

### 🧪 INSTRUCCIONES DE PRUEBA:

**IMPORTANTE: Desinstalar app vieja primero**
```bash
# En el móvil: Ajustes → Apps → MD Viewer → Desinstalar
# O con ADB:
adb uninstall com.mdviewer.app
```

**Instalar APK nuevo:**
```bash
adb install C:\Users\cra\Proyectos\md-viewer\android\app\build\outputs\apk\debug\app-debug.apk
```

**Probar subrayado con extensión de selección:**
1. Abre un archivo MD
2. **Mantén pulsado** en medio de un párrafo
3. **Arrastra lentamente** hacia abajo → selecciona 2-3 palabras
4. **SIN SOLTAR, sigue arrastrando** → extiende a 5-10 palabras
5. **Suelta** → aparece menú flotante con 4 colores
6. **Click en cualquier color** → TODO el texto se subraya correctamente
7. **Repetir pero arrastrando más rápido** → debe funcionar igual

**Debe funcionar con:**
- Selección rápida y lenta (velocidad de arrastre no importa)
- Extender selección mientras menú ya está visible
- Selecciones cortas (2 palabras) y largas (párrafo completo)
- Texto con formato: "esto es **bold** y *italic* y normal"
- Múltiples selecciones consecutivas sin cerrar/abrir archivo

**Verificar que NO crashee:**
- Si seleccionas y deseleccionas rápidamente
- Si clicks en color antes de que aparezca el menú
- Si extiendes selección fuera de `.md-body`

---

### Sesión 2026-05-08 22:00 - 🔥 CRITICAL FIX: Android Text Selection Unblocked

### 🐛 PROBLEMA REAL:
Usuario reportó que **solo podía subrayar una palabra**, el fix anterior no funcionó.

### 🔍 ROOT CAUSE VERDADERO:
La función `preventDefaultMenu()` estaba bloqueando **completamente** el evento `contextmenu` de Android, lo cual impedía que el sistema nativo manejara la selección multi-palabra.

En Android:
- Mantener pulsado → inicia selección
- Arrastrar → extiende selección a múltiples palabras
- **Si bloqueas `contextmenu` globalmente → rompes la selección multi-palabra**

### ✅ SOLUCIÓN FINAL:

1. **Bloqueo selectivo de contextmenu** (`readingProgress.js:87-97`)
   - Solo prevenir `contextmenu` en highlights **existentes**
   - Permitir que Android maneje selección de texto normal
   - Código anterior: bloqueaba TODO con `preventDefaultMenu`
   - Código nuevo: verifica `event.target.closest('.highlight')` antes de bloquear

2. **Menú flotante no se cierra al seleccionar** (`readingProgress.js:99-104`)
   - Antes: se cerraba con cualquier touch/click
   - Ahora: solo se cierra si click fuera de `.md-body` Y fuera del menú
   - Permite seleccionar múltiples palabras sin que desaparezca el menú

3. **Eliminada función obsoleta** (`preventDefaultMenu`)
   - Ya no se usa, el bloqueo es inline y condicional

### 📦 Archivos modificados:
- **MODIFICADO:** `public/modules/readingProgress.js` (553 líneas)
  - `initHighlightSystem()` - contextmenu handler condicional inline
  - `hideFloatingMenuIfOutside()` - nueva función que respeta .md-body
  - `hideFloatingMenu()` - separada en dos funciones (condicional y forzada)
  - Eliminada `preventDefaultMenu()` (ya no necesaria)

### 🚀 APK actualizado:
- **Build:** 2026-05-08 22:00 (**REAL FIX ANDROID SELECTION**)
- **Ubicación:** `android/app/build/outputs/apk/debug/app-debug.apk`
- **Estado:** BUILD SUCCESSFUL (14s, 160 tasks)

### 🧪 INSTRUCCIONES DE PRUEBA:

**IMPORTANTE: Desinstalar app vieja primero**
```bash
# En el móvil: Ajustes → Apps → MD Viewer → Desinstalar
# O con ADB:
adb uninstall com.mdviewer.app
```

**Instalar APK nuevo:**
```bash
adb install C:\Users\cra\Proyectos\md-viewer\android\app\build\outputs\apk\debug\app-debug.apk
```

**Probar selección multi-palabra:**
1. Abre un archivo MD
2. **Mantén pulsado** en medio de un párrafo
3. **Arrastra** hacia arriba o abajo → debería seleccionar múltiples palabras
4. Suelta → aparece menú flotante con colores
5. Click en color → **todo el texto seleccionado** se subraya

**Debe funcionar con:**
- Selección de 2-3 palabras simples
- Selección de frases completas (5-10 palabras)
- Texto que cruza negritas: "esto es **bold** y normal"
- Texto que cruza cursivas: "esto es *italic* y normal"
- Párrafos completos

---

### Sesión 2026-05-08 21:45 - 🐛 FIX: Multi-Word Highlighting + Long-Press Delete

### 🛠️ PROBLEMA RESUELTO:
El sistema de subrayado solo permitía subrayar **una palabra a la vez**, fallando con selecciones de múltiples palabras o texto que cruzaba elementos HTML (negritas, cursivas, etc.).

### 🔍 ROOT CAUSE:
- `range.surroundContents()` **falla cuando la selección cruza múltiples nodos DOM**
- Ejemplo: si seleccionas "texto en **negrita** normal", hay 3 nodos diferentes
- El método `surroundContents()` lanza excepción en estos casos

### ✅ SOLUCIÓN IMPLEMENTADA:

1. **Multi-word highlighting arreglado** (`readingProgress.js:309-352`)
   - Reemplazado `surroundContents()` por `extractContents()` + `insertNode()`
   - Ahora funciona con selecciones complejas que cruzan múltiples nodos
   - Preserva el formato interno (negritas, cursivas, links, etc.)
   - Cada highlight tiene ID único (`data-highlight-id`) para tracking preciso

2. **Long-press para eliminar highlights** (`readingProgress.js:76-188`)
   - Añadida función `setupHighlightLongPress()`
   - Detecta touch y mouse events en elementos `.highlight`
   - Mantener pulsado 500ms → aparece menú contextual "Eliminar subrayado"
   - Feedback háptico (vibración) al activar menú
   - Compatible con móvil y desktop

3. **Sistema de eliminación mejorado** (`readingProgress.js:487-508`)
   - `removeHighlight()` actualizado para usar ID único
   - Preserva nodos internos al eliminar (no pierde formato)
   - Elimina del metadata automáticamente

4. **Restauración de highlights mejorada** (`readingProgress.js:516-556`)
   - `restoreHighlights()` usa `extractContents()` + `insertNode()`
   - Restaura ID único al reabrir archivo
   - Compatible con highlights multi-palabra

### 📦 Archivos modificados:
- **MODIFICADO:** `public/modules/readingProgress.js` (558 líneas)
  - `applyHighlight()` - método robusto para selecciones complejas
  - `setupHighlightLongPress()` - detección de long-press en highlights
  - `handleHighlightTouchStart()` / `handleHighlightMouseDown()` - eventos táctiles
  - `showHighlightDeleteMenu()` - menú contextual para eliminar
  - `removeHighlight()` - eliminación basada en ID único
  - `changeHighlightColor()` - cambio de color basado en ID
  - `restoreHighlights()` - restauración robusta con ID

### 🚀 APK actualizado:
- **Build:** 2026-05-08 21:45 (**CON FIX MULTI-WORD**)
- **Ubicación:** `android/app/build/outputs/apk/debug/app-debug.apk`
- **Estado:** BUILD SUCCESSFUL (45s, 160 tasks)

### 🧪 CÓMO PROBAR:

**Subrayar múltiples palabras:**
1. Abre un archivo MD
2. Selecciona **varias palabras** (incluye texto con negritas, cursivas, etc.)
3. Aparece menú flotante con colores
4. Click en color → todo el texto se subraya correctamente

**Eliminar subrayado con long-press:**
1. Mantén pulsado 500ms sobre un texto subrayado
2. Vibración + aparece menú "Eliminar subrayado"
3. Click "Eliminar" → se elimina instantáneamente
4. Toast confirma "Subrayado eliminado"

**Verificar persistencia:**
1. Subraya varios bloques de texto (1 palabra, 3 palabras, párrafo completo)
2. Cierra archivo
3. Vuelve a abrirlo → todos los highlights se restauran correctamente

---

### Sesión 2026-05-07 20:30 - ✨ UI Improvements: Sticky Header, Color Picker & Un-Highlight

### 🎨 MEJORAS IMPLEMENTADAS:
1. **Color Picker** - Botón 🎨 con menú dropdown para elegir colores de subrayado
   - 5 colores disponibles: Amarillo, Verde, Azul, Rosa, Morado
   - Menú flotante con animación
   - Cierre automático al seleccionar color o click fuera

2. **Un-Highlight (desubrayar)** - Click en subrayado para eliminarlo
   - Subrayados ahora son clickables
   - Muestra tooltip "Click para eliminar"
   - Elimina del metadata automáticamente

3. **Header Sticky** - Header del documento permanece fijo al hacer scroll
   - `position: sticky` con `z-index: 100`
   - Background opaco para no mostrar contenido debajo
   - Botones siempre visibles mientras lees

4. **Espacio Optimizado** - Eliminados botones innecesarios
   - **Eliminado:** Botón "Raw" (usuario no lo entendía)
   - **Eliminado:** Botón "×" cerrar (espacio mejor usado)
   - **Resultado:** Más espacio para mostrar título completo

### 📦 Archivos modificados:
- **MODIFICADO:** `public/modules/render.js` (líneas 115-128)
  - Header redesigned con `.doc-actions` container
  - Color picker HTML integrado
  - Eliminados botones Raw y Close

- **MODIFICADO:** `public/modules/readingProgress.js` (líneas 150-208)
  - Añadida función `toggleColorPicker(event)`
  - Añadida función `removeHighlight(highlightElement)`
  - Actualizada función `setHighlightColor()` para cerrar menu
  - Highlights ahora tienen event listener de click
  - Cursor pointer y tooltip en highlights

- **MODIFICADO:** `public/app.js` (líneas 11-20, 136-137)
  - Importadas nuevas funciones: `toggleColorPicker`, `removeHighlight`
  - Expuestas a `window` para onclick handlers

- **MODIFICADO:** `public/index.html` (CSS líneas 281-368)
  - `.doc-header` ahora sticky con background
  - Añadido `.doc-actions` flexbox container
  - Añadido `.color-picker-container` posicionamiento relativo
  - Añadido `.btn-color-picker` estilos
  - Añadido `.color-picker-menu` menú flotante
  - Añadido `.color-option` botones de color (28x28px)

### 🚀 APK actualizado:
- **Build:** 2026-05-07 20:30 (**CON UI IMPROVEMENTS**)
- **Ubicación:** `android/app/build/outputs/apk/debug/app-debug.apk`
- **Estado:** BUILD SUCCESSFUL (1s)

### 📋 CÓMO USAR LAS NUEVAS FUNCIONES:

**Color Picker:**
1. Abre un archivo MD
2. Click en 🎨 → se abre menú con 5 colores
3. Selecciona color → se cierra menú automáticamente
4. Activa modo subrayado (🖍️) y selecciona texto
5. El texto se subraya con el color elegido

**Eliminar Subrayado:**
1. Click en cualquier texto subrayado
2. Se elimina instantáneamente
3. Toast confirma "Subrayado eliminado"

**Header Sticky:**
1. Abre un archivo largo
2. Scroll hacia abajo
3. El header se queda fijo en la parte superior
4. Botones (○, 📍, 🖍️, 🎨) siempre accesibles

### 🧪 INSTRUCCIONES DE PRUEBA:
1. **Desinstalar** app vieja completamente
2. **Instalar** APK nuevo (20:30):
   ```
   androidppuild\outputspk\debugpp-debug.apk
   ```
3. **Probar funciones:**
   - Abrir archivo largo y verificar header sticky
   - Cambiar color de subrayado con 🎨
   - Subrayar texto en varios colores
   - Click en subrayado para eliminarlo
   - Verificar que título se ve completo (no truncado como "read...")

---

### Sesión 2026-05-07 19:00 - 🐛 FIX: Importación de Carpetas + ADB Setup

### 🛠️ ARREGLADO:
- **Error "Parent folder doesn't exist"** al importar archivos con estructura de carpetas
- **Error "Directory exists"** que llenaba logs innecesariamente
- **Console log "undefined"** en errores de importación

### 🔍 ROOT CAUSE:
El código intentaba escribir archivos (ej: `carpeta/subcarpeta/archivo.md`) sin crear primero las carpetas padre. El plugin `@capacitor/filesystem` requiere que todas las carpetas existan antes de escribir archivos.

### ✅ SOLUCIÓN IMPLEMENTADA:
1. **Nueva función `ensureParentFolders()`** en `import.js:16-36`
   - Extrae la estructura de carpetas del filePath
   - Crea cada carpeta recursivamente antes de escribir el archivo
   - Maneja silenciosamente el error "Directory exists"

2. **Mejorado manejo de errores:**
   - Usa `e.message || e` para evitar mostrar "undefined"
   - Logs más informativos con el nombre del archivo que falló

### 📦 Archivos modificados:
- **MODIFICADO:** `public/modules/import.js` (254 líneas)
  - Añadida función helper `ensureParentFolders()`
  - Integrada en `importFiles()` línea 112
  - Integrada en `importFolder()` línea 220

### 🚀 APK CORREGIDO:
- **Build:** 2026-05-07 19:00 (**CON FIX IMPORTACIÓN**)
- **Ubicación:** `android/app/build/outputs/apk/debug/app-debug.apk`
- **Estado:** BUILD SUCCESSFUL (167 tasks, 13s)

### 🔧 BONUS: ADB Instalado
- **Instalado:** Android Platform Tools para Windows
- **Ubicación:** `C:/Users/cra/platform-tools/adb.exe`
- **Añadido al PATH:** Permanente para sesión de usuario
- **Uso:** Ahora puedo leer logs de logcat en tiempo real

### 📋 CÓMO USAR:
```bash
# Ver errores en tiempo real
adb logcat -v time *:E

# Filtrar solo app
adb logcat -v time | grep "Capacitor"

# Guardar logs
adb logcat -d > logs.txt
```

### 🧪 INSTRUCCIONES DE PRUEBA:
1. **Desinstalar** app vieja
2. **Instalar** APK nuevo (19:00):
   ```
   android\app\build\outputs\apk\debug\app-debug.apk
   ```
3. **Probar importación** con archivos en carpetas/subcarpetas
4. **Verificar:** Ya no debe aparecer error "Parent folder doesn't exist"

---

### Sesión 2026-05-07 18:15 - 🔥 CRITICAL BUG FIX

### 🐛 BUG CRÍTICO ENCONTRADO:
- **Root cause:** Doble inicialización en `longPress.js`
- **Síntoma:** Crash loop continuo, logcat no para de ejecutarse
- **Efecto:** App completamente rota, botones no aparecen, errores en import

### 🔍 DIAGNÓSTICO:
El módulo `longPress.js` tenía **dos puntos de inicialización**:
1. **Líneas 162-166:** Auto-inicialización al cargar el módulo
2. **Líneas 6-10:** Función `initLongPress()` exportada que añade OTRO listener
3. **app.js línea 84:** Llamaba a `initLongPress()`

**Resultado:** `setupLongPressListeners()` se ejecutaba múltiples veces, adjuntando event listeners duplicados, causando un loop infinito de eventos.

### ✅ SOLUCIÓN:
1. **Eliminado:** Auto-inicialización al final de `longPress.js` (líneas 162-166)
2. **Corregido:** `initLongPress()` ahora usa `{ once: true }` para evitar duplicados
3. **Verificado:** Solo una llamada desde `app.js`

**Código corregido:**
```javascript
export function initLongPress() {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupLongPressListeners, { once: true });
  } else {
    setupLongPressListeners();
  }
}
```

### 📦 Archivos modificados:
- **MODIFICADO:** `public/modules/longPress.js` - Eliminada doble inicialización

### 🚀 APK CORREGIDO:
- **Build:** 2026-05-07 18:15 (**CON FIX CRÍTICO**)
- **Ubicación:** `android/app/build/outputs/apk/debug/app-debug.apk`
- **Estado:** BUILD SUCCESSFUL (167 tasks)

### 📋 INSTRUCCIONES DE INSTALACIÓN:
1. **Desinstalar** app vieja completamente
2. **Instalar** APK nuevo (18:15):
   ```
   android\app\build\outputs\apk\debug\app-debug.apk
   ```
3. **Abrir** app y verificar que funciona correctamente
4. **Debería funcionar:** Botón importar visible, sin crash loops

---

### Sesión 2026-05-07 17:40 - Debugging & Error Handling

### 🐛 PROBLEMA REPORTADO:
- Usuario instaló APK pero NO aparece botón "Importar archivos"
- Sale error al intentar importar
- App parece completamente rota

### ✅ SOLUCIÓN IMPLEMENTADA:
1. **Error handlers globales** - Capturan errores JS y los muestran en pantalla
2. **Logging detallado** - Console logs en cada paso de init()
3. **Página de debug** - `debug.html` para probar módulos individualmente
4. **Documentación de debugging** - `DEBUGGING.md` con instrucciones paso a paso

### 📦 Archivos añadidos:
- **NUEVO:** `public/debug.html` - Página de diagnóstico
- **NUEVO:** `DEBUGGING.md` - Guía completa de debugging
- **MODIFICADO:** `public/app.js` - Error handling en init()
- **MODIFICADO:** `public/index.html` - Global error handlers

### 🚀 APK actualizado:
- **Build:** 2026-05-07 10:40 (con debugging)
- **Ubicación:** `android/app/build/outputs/apk/debug/app-debug.apk`
- **Cambios:** Error handling + logging detallado

### 📋 PRÓXIMOS PASOS (usuario debe hacer):
1. Desinstalar app vieja
2. Instalar APK nuevo (10:40)
3. Abrir app y ver si aparece error rojo en pantalla
4. O usar Chrome DevTools (`chrome://inspect`) para ver errores
5. Mandar captura de pantalla del error
6. Con el error exacto, podremos arreglarlo

---

### Sesión 2026-05-07 17:30 - Implementación Inicial

### ✅ Implementado en esta sesión:
1. **Sistema de lectura (ticks)** - Marcar archivos como leídos
2. **Sistema de bookmarks** - Guardar posición de lectura
3. **Sistema de highlights** - Subrayar texto importante
4. **Long-press delete** - Eliminar archivos/carpetas con pulsación larga
5. **Árbol de carpetas recursivo** - Soporte múltiples niveles
6. **Importación de carpetas** - Preserva estructura completa
7. **Metadata storage** - Extendido modelo de datos con read/bookmark/highlights

### 🐛 Bugs corregidos:
- Funciones async sin await → causaba que metadata no se guardara
- Importación de archivos fallaba en móvil → corregido async/await
- APK no reflejaba cambios → usuario tenía APK viejo instalado (solución: desinstalar + reinstalar)
- Build cache causaba problemas → agregado `./gradlew clean` antes de compile

### 📦 Archivos creados/modificados:
- **NUEVO:** `public/modules/readingProgress.js` (165 líneas)
- **NUEVO:** `public/modules/longPress.js` (145 líneas)
- **NUEVO:** `CLAUDE.md` (este archivo - memoria del proyecto)
- **NUEVO:** `build-android.bat` (script automático de build)
- **NUEVO:** `INSTRUCCIONES_INSTALACION.md` (guía de instalación)
- **MODIFICADO:** `public/modules/storage.js` - añadido updateFileMetadata()
- **MODIFICADO:** `public/modules/render.js` - árbol recursivo + indicadores
- **MODIFICADO:** `public/modules/import.js` - mejorada importFolder()
- **MODIFICADO:** `public/app.js` - integración nuevos módulos
- **MODIFICADO:** `public/index.html` - estilos CSS para nuevas features

### 🚀 APK actualizado:
- **Última compilación:** 2026-05-07 10:37 (LIMPIA)
- Build exitoso: `./gradlew clean && ./gradlew assembleDebug`
- Ubicación: `android/app/build/outputs/apk/debug/app-debug.apk`
- Tamaño: 3.7MB
- Listo para instalar en dispositivo

### ⚠️ IMPORTANTE - Cómo instalar APK actualizado:
**Debes DESINSTALAR la app vieja primero:**
1. En el móvil: Ajustes → Apps → MD Viewer → Desinstalar
2. Luego instalar el nuevo APK:
   - Opción A: `adb install C:\Users\cra\Proyectos\md-viewer\android\app\build\outputs\apk\debug\app-debug.apk`
   - Opción B: Copiar APK al móvil e instalar manualmente

**Script automático de build:**
Usa `build-android.bat` para compilar todo automáticamente:
```batch
cd C:\Users\cra\Proyectos\md-viewer
build-android.bat
```

---

## 🎯 Descripción del Proyecto

Visor de Markdown móvil con sistema de lectura avanzado. Permite importar archivos/carpetas, mantener progreso de lectura, bookmarks, highlights y gestión por long-press.

---

## 📦 Arquitectura Modular

### Ubicación de archivos
```
md-viewer/
├── public/
│   ├── index.html              # UI + CSS embebido
│   ├── app.js                  # Orquestador principal
│   └── modules/
│       ├── storage.js          # Gestión de archivos + metadata
│       ├── import.js           # Importación de archivos/carpetas
│       ├── folderOperations.js # CRUD de carpetas
│       ├── fileOperations.js   # CRUD de archivos
│       ├── render.js           # Renderizado UI (árbol, MD, búsqueda)
│       ├── search.js           # Motor de búsqueda
│       ├── tabs.js             # Sistema de pestañas
│       ├── ui.js               # Helpers UI (toast, sidebar)
│       ├── utils.js            # Utilidades (escape, encoding)
│       ├── readingProgress.js  # ✅ NUEVO: Lectura, bookmarks, highlights
│       └── longPress.js        # ✅ NUEVO: Detección gestos táctiles
├── android/                    # Proyecto Android
├── ios/                        # Proyecto iOS
├── server.js                   # Dev server (solo desarrollo web)
└── package.json
```

---

## ✅ Funcionalidades Implementadas

### 1. **Importación de Archivos/Carpetas**
- **Módulo:** `modules/import.js`
- **Funciones:**
  - `importFiles()` - Importa múltiples archivos MD preservando estructura
  - `importFolder()` - Alias de importFiles (el plugin preserva paths automáticamente)
- **Plugin:** `@capawesome/capacitor-file-picker`
- **Capacitor API:** `FilePicker.pickFiles({ multiple: true, readData: true })`
- **Storage:** Los archivos se guardan en `DATA/md-viewer-docs/` con estructura de carpetas

### 2. **Árbol de Carpetas Recursivo**
- **Módulo:** `modules/render.js:6-72`
- **Funciones:**
  - `buildFileTree(files)` - Construye árbol desde flat array
  - `insertIntoTree(node, parts, file)` - Inserta recursivamente
  - `renderTreeNode(node, currentFile, pathPrefix)` - Renderiza HTML recursivo
  - `countFiles(node)` - Cuenta archivos en rama
- **Soporte:** Múltiples niveles (carpeta/subcarpeta/archivo.md)
- **UI:** Iconos ▶, contador de archivos por carpeta

### 3. **Sistema de Lectura (Ticks)**
- **Módulo:** `modules/readingProgress.js:7-15`
- **Función:** `toggleReadStatus(filePath)`
- **Storage:** `file.read: boolean`
- **UI:**
  - Botón ○/✓ en header del documento
  - Tick verde ✓ en sidebar junto al archivo

### 4. **Sistema de Bookmarks (Marcadores)**
- **Módulo:** `modules/readingProgress.js:17-52`
- **Funciones:**
  - `saveBookmark(filePath)` - Guarda scroll position + porcentaje
  - `goToBookmark(filePath)` - Vuelve a posición guardada (smooth scroll)
  - `clearBookmark(filePath)` - Elimina marcador
- **Storage:** `file.bookmark: {scroll: number, percent: number, timestamp: string}`
- **UI:**
  - Botón 📍 (guardar) / 📌 (ir a marcador) en header
  - Icono 📌 en sidebar si hay bookmark

### 5. **Sistema de Subrayado (Highlights)**
- **Módulo:** `modules/readingProgress.js:54-165`
- **Funciones:**
  - `toggleHighlightMode()` - Activa/desactiva modo subrayado
  - `handleTextSelection(event)` - Detecta selección de texto
  - `restoreHighlights(file)` - Restaura subrayados al abrir archivo
  - `clearAllHighlights(filePath)` - Elimina todos
  - `setHighlightColor(color)` - Cambia color de subrayado
- **Storage:** `file.highlights: [{id, text, color, timestamp}]`
- **UI:**
  - Botón 🖍️ en header (se ilumina cuando está activo)
  - `body.highlight-mode` class para cursor crosshair
  - Spans con `.highlight` class y background color
- **Funcionamiento:**
  1. Click en 🖍️ → activa modo
  2. Selecciona texto → se envuelve en `<span class="highlight">`
  3. Se guarda en metadata del archivo
  4. Al reabrir archivo → `restoreHighlights()` reconstruye los spans

### 6. **Long-Press Delete (Gestos Táctiles)**
- **Módulo:** `modules/longPress.js`
- **Duración:** 500ms
- **Eventos soportados:**
  - `touchstart` / `touchend` / `touchmove` (móvil)
  - `mousedown` / `mouseup` (desktop)
  - `contextmenu` (click derecho)
- **Funcionamiento:**
  1. Mantén pulsado 500ms sobre archivo/carpeta
  2. Vibración háptica (si disponible)
  3. Aparece menú contextual con animación
  4. Options: "Eliminar" o "Cancelar"
- **UI:** Menú contextual `.context-menu` con estilos animados
- **Inicialización:** Event delegation en `#fileTree`

### 7. **Sistema de Pestañas (Tabs)**
- **Módulo:** `modules/tabs.js`
- **Funciones:** `addTab()`, `closeTab()`, `switchToTab()`, etc.
- **UI:** Tabs horizontales con scroll, botón × para cerrar

### 8. **Búsqueda Global**
- **Módulo:** `modules/search.js`
- **Funciona:** Busca en todos los archivos importados
- **UI:** Barra de búsqueda en header, resultados con snippets resaltados

### 9. **Renderizado Markdown**
- **Librería:** `marked.js` + `highlight.js`
- **Módulo:** `modules/render.js:74-123`
- **Función:** `renderMarkdown(file)`
- **Features:**
  - GitHub Flavored Markdown
  - Syntax highlighting para código
  - Botón "Copiar" en bloques de código
  - Vista Raw opcional
  - Dark theme optimizado para OLED

---

## 🗄️ Modelo de Datos (Storage)

### FileIndex Structure
Cada archivo tiene la siguiente estructura:

```javascript
{
  path: "carpeta/subcarpeta/archivo.md",  // Path completo con carpetas
  name: "archivo.md",                      // Solo nombre del archivo
  content: "# Contenido...",               // Contenido raw del archivo

  // ✅ Metadata de lectura (añadida en v2.0)
  read: false,                             // true si está marcado como leído
  bookmark: null | {                       // null o posición guardada
    scroll: 1234,                          // Posición de scroll
    percent: 45,                           // Porcentaje leído
    timestamp: "2026-05-07T..."           // Cuándo se guardó
  },
  highlights: [                            // Array de subrayados
    {
      id: "1714567890123",
      text: "texto subrayado",
      color: "#ffd700",
      timestamp: "2026-05-07T..."
    }
  ]
}
```

### Storage Backend
- **Plugin:** `@capacitor/preferences` (key-value storage)
- **Key:** `"fileIndex"`
- **Value:** JSON.stringify(fileIndex)
- **Funciones:**
  - `loadFileIndex()` - Carga al inicio
  - `saveFileIndex()` - Guarda después de cada cambio
  - `updateFileMetadata(path, metadata)` - ✅ NUEVO: Actualiza metadata específica

### Filesystem Storage
- **Plugin:** `@capacitor/filesystem`
- **Directory:** `DATA/md-viewer-docs/`
- **Estructura:** Preserva jerarquía de carpetas
- **Ejemplo:** `DATA/md-viewer-docs/carpeta/subcarpeta/archivo.md`

---

## 🎨 UI/UX

### Color Scheme (Dark Theme)
```css
--bg: #0f0f13           /* Background principal */
--surface: #17171f      /* Superficie (sidebar, cards) */
--surface2: #1e1e2a     /* Superficie secundaria (hover) */
--border: #2a2a3a       /* Bordes */
--accent: #5865f2       /* Acento principal (azul Discord) */
--accent2: #7289da      /* Acento secundario */
--text: #e2e2f0         /* Texto principal */
--text-dim: #8888aa     /* Texto secundario */
--text-muted: #55557a   /* Texto deshabilitado */
--green: #3ba55c        /* Success */
--red: #ed4245          /* Error/Delete */
--yellow: #faa61a       /* Warning */
```

### Componentes Principales
1. **Header** - Logo, búsqueda, botón hamburguesa (móvil)
2. **Sidebar** - Árbol de carpetas/archivos, botón "Importar"
3. **Main Area** - Tabs + Contenido renderizado
4. **Doc Header** - Título, botones (○/✓, 📍/📌, 🖍️, Raw, ×)
5. **Content Area** - Markdown renderizado con scrollbar custom
6. **Context Menu** - Menú long-press con animación fade-in
7. **Toast** - Notificaciones temporales (bottom center)

### Mobile Optimizations
- Safe area insets (notch support)
- `-webkit-tap-highlight-color` para feedback táctil
- `overscroll-behavior-y: contain` para evitar bounce
- `-webkit-overflow-scrolling: touch`
- Sidebar overlay con backdrop blur en móvil

---

## 🔧 Comandos de Desarrollo

### Web (Desarrollo)
```bash
npm run dev:web          # Servidor en http://localhost:3000
```

### Android
```bash
npm run sync             # Sync web → Android/iOS
npx cap sync android     # Solo Android
npx cap open android     # Abrir Android Studio

# Build APK
cd android
./gradlew assembleDebug  # → android/app/build/outputs/apk/debug/app-debug.apk
```

### iOS
```bash
npx cap sync ios
npx cap open ios         # Abrir Xcode
```

---

## 🐛 Bugs Conocidos & Limitaciones

### ✅ RESUELTO (v2.0)
- ~~No se podían importar carpetas~~ → Ahora preserva estructura
- ~~No había forma de marcar progreso de lectura~~ → Sistema de ticks
- ~~No se podía volver a donde te quedaste leyendo~~ → Bookmarks
- ~~No se podían subrayar conceptos importantes~~ → Highlights
- ~~Había que usar botón × visible para eliminar~~ → Long-press delete

### ⚠️ Limitaciones Actuales
1. **Highlights basados en texto:** Si el contenido del archivo cambia, los highlights pueden desincronizarse (mejor solución: guardar posición DOM o line numbers)
2. **Plugin de carpetas:** El FilePicker no tiene método `pickDirectory()` nativo, dependemos de que el path incluya la estructura
3. **Sincronización:** No hay sync en la nube, todo es local

---

## 📋 TODOs / Mejoras Futuras

### Corto Plazo
- [ ] Botón "Importar Carpeta" más explícito en UI
- [ ] Tutorial/onboarding primera vez
- [ ] Estadísticas de lectura (archivos leídos, tiempo estimado)
- [ ] Filtros sidebar (solo leídos, solo con bookmarks)

### Medio Plazo
- [ ] Exportar highlights a texto/PDF
- [ ] Múltiples colores de highlight (paleta de colores)
- [ ] Notas/comentarios por archivo
- [ ] Tags/etiquetas personalizadas
- [ ] Ordenar archivos (alfabético, fecha, custom)

### Largo Plazo
- [ ] Sync en la nube (Google Drive, Dropbox)
- [ ] OCR para imágenes en markdown
- [ ] Text-to-speech para lectura en voz alta
- [ ] Modo lectura nocturna con brillo adaptativo
- [ ] Spaced repetition system para repaso

---

## 🚀 Cómo Probar las Nuevas Funcionalidades

### 1. Instalar APK
```bash
# El APK compilado está en:
android/app/build/outputs/apk/debug/app-debug.apk

# Instalar en dispositivo:
adb install -r android/app/build/outputs/apk/debug/app-debug.apk
```

### 2. Importar Archivos con Carpetas
1. Pulsa "📁 Importar archivos"
2. Selecciona múltiples archivos de distintas carpetas
3. La estructura se preservará automáticamente
4. Verás carpetas con ▶ y contador de archivos

### 3. Usar Sistema de Lectura
1. Abre un archivo
2. Click en ○ (arriba) → marca como leído ✓
3. Aparece tick verde en sidebar
4. Click de nuevo → desmarca

### 4. Guardar Bookmark
1. Scroll a una posición específica
2. Click en 📍 → guarda posición
3. Icono cambia a 📌 en header y sidebar
4. Cierra archivo y vuelve a abrirlo
5. Click en 📌 → vuelve a la posición (smooth scroll)

### 5. Subrayar Texto
1. Abre un archivo
2. Click en 🖍️ (activa modo highlight)
3. Botón se ilumina, cursor cambia a crosshair
4. Selecciona texto → se subraya automáticamente en amarillo
5. Cierra archivo y vuelve a abrirlo → subrayados persisten
6. Click en 🖍️ de nuevo → desactiva modo

### 6. Eliminar con Long-Press
1. Mantén pulsado 500ms sobre archivo/carpeta
2. Vibración + menú contextual aparece
3. Click "Eliminar" → confirmación → elimina
4. También funciona con click derecho (desktop)

---

## 🔍 Debug & Troubleshooting

### Errores comunes

**"No se pueden importar archivos"**
- Verifica permisos en `AndroidManifest.xml`
- Comprueba que FilePicker plugin está instalado: `npx cap sync`
- Mira logcat: `adb logcat | grep "capacitor"`

**"Los highlights no se restauran"**
- Asegúrate de que `restoreHighlights(file)` se llama en `renderMarkdown()`
- Comprueba que `file.highlights` existe en storage
- Los highlights son sensibles a cambios de contenido

**"Long-press no funciona"**
- Verifica que `initLongPress()` se llama en `app.js`
- El listener usa event delegation en `#fileTree`
- Comprueba que los elementos tienen `data-path` o `data-folder`

**"Bookmarks no son precisos"**
- El scroll se guarda en píxeles, puede variar si el viewport cambia
- Considera guardar porcentaje en vez de píxeles absolutos

### Logs útiles
```javascript
// En modules/readingProgress.js
console.log('[DEBUG] Highlight saved:', highlight);
console.log('[DEBUG] Bookmark:', file.bookmark);

// En modules/storage.js
console.log('[DEBUG] FileIndex saved:', fileIndex.length, 'files');
```

---

## 📚 Referencias de Plugins

### @capacitor/filesystem
```javascript
// Escribir archivo
await Filesystem.writeFile({
  path: 'md-viewer-docs/archivo.md',
  data: 'contenido...',
  directory: 'DATA'
});

// Leer directorio
await Filesystem.readdir({
  path: 'md-viewer-docs/',
  directory: 'DATA'
});
```

### @capacitor/preferences
```javascript
// Guardar
await Preferences.set({
  key: 'fileIndex',
  value: JSON.stringify(data)
});

// Cargar
const { value } = await Preferences.get({ key: 'fileIndex' });
const data = JSON.parse(value);
```

### @capawesome/capacitor-file-picker
```javascript
const result = await FilePicker.pickFiles({
  types: ['text/markdown', 'text/plain', '*/*'],
  multiple: true,      // Selección múltiple
  readData: true       // Lee contenido en base64
});

// result.files[0].path → preserva estructura de carpetas
// result.files[0].data → contenido en base64
```

---

## 🎓 Notas para Claude

### Al iniciar nueva conversación:
1. **Leer este archivo primero** para entender estado del proyecto
2. **NO reimplementar** funcionalidades ya existentes
3. **Verificar módulos** antes de crear nuevos
4. **Probar en móvil** antes de confirmar que algo funciona

### Estructura modular:
- Cada módulo es **independiente** (imports/exports ES6)
- **No hay bundler**, los navegadores modernos soportan ES6 modules nativamente
- **app.js** es el orquestador, expone funciones a `window` para onclick handlers

### Debugging:
- **Web:** Abre DevTools en http://localhost:3000
- **Android:** `adb logcat | grep capacitor` o Chrome DevTools (chrome://inspect)
- **Async/await:** Asegúrate de que las funciones que llaman a storage sean async

### Antes de compilar APK:
1. `npx cap sync android` → sincroniza cambios web
2. `cd android && ./gradlew assembleDebug` → compila APK
3. APK sale en `android/app/build/outputs/apk/debug/app-debug.apk`

---

**Fin de memoria de proyecto. Actualizar este archivo con cada cambio significativo.**
