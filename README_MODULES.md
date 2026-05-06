# 📦 Arquitectura Modular - MD Viewer Mobile

## 🎯 Filosofía

La app está organizada en **módulos independientes** con responsabilidades únicas siguiendo principios SOLID.

```
app.js (Orquestador)
    ↓
modules/ (9 módulos especializados)
    ↓
Capacitor Plugins (Filesystem, Preferences, FilePicker)
```

---

## 📁 Estructura de Archivos

```
public/
├── app.js                          # Orquestador principal (75 líneas)
├── index.html                      # UI + estilos
└── modules/
    ├── utils.js                    # Utilidades generales
    ├── storage.js                  # Gestión de persistencia
    ├── ui.js                       # Helpers de interfaz
    ├── render.js                   # Renderizado de vistas
    ├── search.js                   # Búsqueda de contenido
    ├── fileOperations.js           # CRUD de archivos
    ├── folderOperations.js         # CRUD de carpetas
    ├── import.js                   # Importación de archivos
    └── tabs.js                     # Sistema de pestañas
```

---

## 🔧 Módulos Detallados

### 1. **app.js** (Orquestador Principal)
**Responsabilidad:** Inicializar la app y coordinar módulos

**Funciones:**
- `init()` - Inicialización de Capacitor y módulos
- Exponer funciones globales via `window.*`

**Dependencias:**
```javascript
import { initializePlugins, loadFileIndex } from './modules/storage.js';
import { toggleSidebar, showEmpty } from './modules/ui.js';
import { renderTree } from './modules/render.js';
import { openFile, toggleRaw, removeFile } from './modules/fileOperations.js';
import { toggleFolder, removeFolder } from './modules/folderOperations.js';
import { initSearch } from './modules/search.js';
import { importFiles, initializeFilePicker } from './modules/import.js';
import { addTab, closeTab, switchToTab, closeAllTabs } from './modules/tabs.js';
```

**Exports:** Ninguno (todo va a `window.*` para acceso desde HTML)

---

### 2. **utils.js** (52 líneas)
**Responsabilidad:** Funciones de utilidad sin dependencias

**Funciones exportadas:**
- `base64ToUtf8(base64)` - Decodifica base64 a UTF-8
- `fixEncoding(text)` - Corrige caracteres mal codificados (Ã±→ñ, etc.)
- `escapeHtml(text)` - Escapa HTML para prevenir XSS
- `escapeAttr(text)` - Escapa atributos HTML

**Dependencias:** Ninguna

**Uso:**
```javascript
import { escapeHtml, base64ToUtf8 } from './modules/utils.js';
const safe = escapeHtml(userInput);
const decoded = base64ToUtf8(fileData);
```

---

### 3. **storage.js** (74 líneas)
**Responsabilidad:** Gestión de persistencia (fileIndex, Filesystem, Preferences)

**Datos gestionados:**
- `fileIndex[]` - Array de archivos { path, name, content }
- `Filesystem` - Plugin de Capacitor
- `Preferences` - Plugin de Capacitor

**Funciones exportadas:**
- `initializePlugins(plugins)` - Inicializa plugins de Capacitor
- `loadFileIndex()` - Carga fileIndex desde Preferences
- `saveFileIndex()` - Guarda fileIndex en Preferences
- `addFile(file)` - Añade archivo al índice
- `removeFile(path)` - Elimina archivo del índice
- `getFile(path)` - Busca archivo por path
- `getFiles()` - Obtiene todos los archivos
- `filterFiles(predicate)` - Filtra archivos
- `removeFilesMatching(predicate)` - Elimina múltiples archivos

**Dependencias:** Capacitor Plugins

**Uso:**
```javascript
import { addFile, getFile, saveFileIndex } from './modules/storage.js';
addFile({ path: 'test.md', name: 'test.md', content: '# Hello' });
await saveFileIndex();
```

---

### 4. **ui.js** (60 líneas)
**Responsabilidad:** Funciones de interfaz de usuario

**Funciones exportadas:**
- `toggleSidebar()` - Abre/cierra sidebar (móvil)
- `showToast(message, type)` - Muestra notificación temporal
- `showEmpty()` - Muestra estado vacío
- `showLoading(message)` - Muestra spinner de carga
- `showError(title, message)` - Muestra pantalla de error

**Dependencias:** Ninguna (manipula DOM directamente)

**Uso:**
```javascript
import { showToast, showEmpty } from './modules/ui.js';
showToast('Archivo eliminado', 'success');
showEmpty();
```

---

### 5. **render.js** (199 líneas)
**Responsabilidad:** Renderizado de vistas (árbol, markdown, búsqueda)

**Funciones exportadas:**
- `renderTree(currentFile)` - Renderiza árbol de archivos/carpetas
- `renderMarkdown(file)` - Renderiza markdown con highlight.js
- `renderRaw(file)` - Renderiza texto plano
- `renderSearchResults(query, results)` - Renderiza resultados de búsqueda con highlight

**Funciones privadas:**
- `highlightSearchTerm(text, query)` - Resalta términos de búsqueda
- `escapeRegex(string)` - Escapa caracteres especiales de regex
- `addCopyButtons()` - Añade botones de copiar a bloques de código

**Dependencias:**
- `utils.js` (escapeHtml, escapeAttr)
- `storage.js` (getFiles)
- `marked.js` (global)
- `hljs` (global)

**Uso:**
```javascript
import { renderTree, renderMarkdown } from './modules/render.js';
await renderTree(currentFile);
renderMarkdown(file);
```

---

### 6. **search.js** (51 líneas)
**Responsabilidad:** Búsqueda de contenido en archivos

**Estado interno:**
- `searchTimeout` - Timeout para debouncing

**Funciones exportadas:**
- `initSearch()` - Inicializa event listener en input de búsqueda
- `doSearch(query)` - Ejecuta búsqueda y renderiza resultados

**Dependencias:**
- `storage.js` (getFiles)
- `render.js` (renderSearchResults)

**Uso:**
```javascript
import { initSearch, doSearch } from './modules/search.js';
initSearch(); // En init()
doSearch('término'); // Manual
```

---

### 7. **fileOperations.js** (100 líneas)
**Responsabilidad:** CRUD de archivos individuales

**Estado interno:**
- `currentFile` - Archivo actualmente abierto
- `showingRaw` - Bool para modo Raw

**Funciones exportadas:**
- `openFile(filePath)` - Abre archivo y renderiza
- `toggleRaw()` - Alterna entre markdown y raw
- `removeFile(filePath)` - Elimina archivo (con confirmación)
- `getCurrentFile()` - Obtiene archivo actual
- `setCurrentFile(file)` - Establece archivo actual
- `clearCurrentFile()` - Limpia estado

**Dependencias:**
- `storage.js` (getFile, removeFile, saveFileIndex, getFilesystem)
- `render.js` (renderMarkdown, renderRaw, renderTree)
- `ui.js` (showToast, showEmpty)
- `tabs.js` (vía window.*)

**Uso:**
```javascript
import { openFile, removeFile } from './modules/fileOperations.js';
await openFile('folder/test.md');
await removeFile('folder/test.md');
```

---

### 8. **folderOperations.js** (53 líneas)
**Responsabilidad:** CRUD de carpetas

**Funciones exportadas:**
- `toggleFolder(headerEl)` - Expande/colapsa carpeta en árbol
- `removeFolder(folderName)` - Elimina carpeta y todos sus archivos

**Dependencias:**
- `storage.js` (removeFilesMatching, saveFileIndex, getFilesystem)
- `render.js` (renderTree)
- `ui.js` (showToast, showEmpty)

**Uso:**
```javascript
import { removeFolder } from './modules/folderOperations.js';
await removeFolder('carpeta-antigua');
```

---

### 9. **import.js** (139 líneas)
**Responsabilidad:** Importación de archivos y carpetas

**Plugins utilizados:**
- `FilePicker` - Plugin de Capacitor

**Funciones exportadas:**
- `initializeFilePicker(plugin)` - Inicializa plugin
- `importFiles()` - Importa múltiples archivos (preserva estructura de carpetas)
- `importFolder()` - Importa carpeta completa (preparado para futuro)

**Dependencias:**
- `utils.js` (base64ToUtf8, fixEncoding)
- `storage.js` (addFile, getFiles, getFilesystem, saveFileIndex)
- `render.js` (renderTree)
- `ui.js` (showToast)

**Uso:**
```javascript
import { importFiles } from './modules/import.js';
await importFiles(); // Abre file picker
```

---

### 10. **tabs.js** (112 líneas)
**Responsabilidad:** Sistema de pestañas para múltiples archivos abiertos

**Estado interno:**
- `openTabs[]` - Array de pestañas { path, name }
- `activeTabPath` - Path de pestaña activa

**Funciones exportadas:**
- `addTab(file)` - Añade pestaña (no duplica)
- `closeTab(filePath)` - Cierra pestaña y cambia a otra
- `closeTabByPath(filePath)` - Alias de closeTab
- `switchToTab(filePath)` - Cambia a pestaña específica
- `switchToNextTab()` - Cambia a siguiente pestaña
- `closeAllTabs()` - Cierra todas las pestañas
- `renderTabs()` - Renderiza barra de pestañas
- `getTabs()` - Obtiene array de pestañas
- `getActiveTab()` - Obtiene path de pestaña activa

**Dependencias:**
- `utils.js` (escapeHtml, escapeAttr)

**Uso:**
```javascript
import { addTab, closeTab, switchToTab } from './modules/tabs.js';
addTab({ path: 'test.md', name: 'test.md' });
switchToTab('test.md');
closeTab('test.md');
```

---

## 🔄 Flujo de Datos

### Inicialización
```
1. DOMContentLoaded
2. app.js:init()
3. initializePlugins() → storage.js
4. loadFileIndex() → storage.js
5. renderTree() → render.js
6. initSearch() → search.js
7. renderTabs() → tabs.js
```

### Importar Archivo
```
1. Click botón → window.importFiles()
2. importFiles() → import.js
3. FilePicker.pickFiles()
4. addFile() → storage.js (por cada archivo)
5. saveFileIndex() → storage.js
6. renderTree() → render.js
```

### Abrir Archivo
```
1. Click archivo → window.openFile(path)
2. openFile() → fileOperations.js
3. getFile(path) → storage.js
4. addTab(file) → tabs.js
5. renderMarkdown(file) → render.js
6. renderTree(currentFile) → render.js
7. renderTabs() → tabs.js
```

### Eliminar Archivo
```
1. Click ✕ → window.removeFile(path)
2. removeFile() → fileOperations.js
3. Filesystem.deleteFile()
4. removeFile(path) → storage.js
5. saveFileIndex() → storage.js
6. closeTabByPath(path) → tabs.js
7. renderTree() → render.js
8. showToast() → ui.js
```

---

## 🧪 Testing Recomendado

### Unit Tests (por módulo)
```javascript
// utils.test.js
import { escapeHtml, base64ToUtf8 } from './modules/utils.js';
test('escapeHtml escapes <script>', () => {
  expect(escapeHtml('<script>alert(1)</script>')).toBe('&lt;script&gt;alert(1)&lt;/script&gt;');
});

// storage.test.js
import { addFile, getFile } from './modules/storage.js';
test('addFile adds file to index', () => {
  addFile({ path: 'test.md', name: 'test.md', content: '# Test' });
  expect(getFile('test.md')).toBeDefined();
});

// tabs.test.js
import { addTab, closeTab, getTabs } from './modules/tabs.js';
test('addTab prevents duplicates', () => {
  addTab({ path: 'test.md', name: 'test.md' });
  addTab({ path: 'test.md', name: 'test.md' });
  expect(getTabs().length).toBe(1);
});
```

### Integration Tests
```javascript
// importFiles.integration.test.js
test('import → storage → render flow', async () => {
  await importFiles(); // Mock FilePicker
  expect(getFiles().length).toBeGreaterThan(0);
  // Verificar que renderTree() fue llamado
});
```

---

## 🚀 Añadir Nuevas Features

### Ejemplo: Añadir función de exportar

1. **Crear módulo** `modules/export.js`
```javascript
import { getFile } from './storage.js';
import { showToast } from './ui.js';

export async function exportFile(filePath) {
  const file = getFile(filePath);
  if (!file) return;

  // Lógica de exportación
  const blob = new Blob([file.content], { type: 'text/markdown' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = file.name;
  a.click();

  showToast('Archivo exportado', 'success');
}
```

2. **Importar en app.js**
```javascript
import { exportFile } from './modules/export.js';
window.exportFile = exportFile;
```

3. **Añadir botón en index.html**
```html
<button onclick="window.exportFile('path/to/file.md')">Exportar</button>
```

---

## ⚡ Performance

### Lazy Loading (futuro)
```javascript
// app.js
async function openFile(filePath) {
  const { openFile } = await import('./modules/fileOperations.js');
  await openFile(filePath);
}
```

### Tree Shaking
Los módulos ES6 permiten que bundlers como Webpack eliminen código no utilizado.

---

## 📚 Referencias

- **ES6 Modules:** https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules
- **Capacitor Plugins:** https://capacitorjs.com/docs/apis
- **Marked.js:** https://marked.js.org/
- **Highlight.js:** https://highlightjs.org/

---

**Última actualización:** 2026-05-05
