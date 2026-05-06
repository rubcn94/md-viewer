# CHANGELOG - MD Viewer Mobile

## 🚀 Versión 2.0.0 (2026-05-05)

### ✨ NUEVAS FEATURES

#### 1. Sistema de Pestañas (Tabs)
- ✅ Múltiples archivos abiertos simultáneamente
- ✅ Barra de pestañas con scroll horizontal
- ✅ Indicador visual de pestaña activa
- ✅ Botón ✕ en cada pestaña para cerrar individualmente
- ✅ Cambio rápido entre pestañas con un click

**Ubicación:** `public/modules/tabs.js` (112 líneas)

#### 2. Botones de Cerrar Archivos
- ✅ Botón ✕ en cada archivo del árbol (hover)
- ✅ Confirmación antes de eliminar
- ✅ Actualización automática del árbol
- ✅ Cierre automático de pestañas asociadas

**Ubicación:** `public/modules/fileOperations.js:removeFile()` (líneas 63-96)

#### 3. Botón de Importar Flotante
- ✅ Botón flotante (+) siempre visible
- ✅ Posicionado bottom-right
- ✅ Animación hover con escala
- ✅ Accesible desde cualquier vista

**Ubicación:** `public/index.html:795` + CSS líneas 658-682

#### 4. Búsqueda Mejorada con Highlight
- ✅ Términos de búsqueda resaltados en amarillo
- ✅ Mejora visual de resultados
- ✅ Función `highlightSearchTerm()` con regex escape

**Ubicación:** `public/modules/render.js:renderSearchResults()` (líneas 117-152)

#### 5. Soporte para Importar Carpetas (Preparado)
- ✅ Detección de estructura de carpetas en paths
- ✅ Preservación de jerarquía al importar
- ✅ Función `importFolder()` preparada para plugins que soporten directorios

**Ubicación:** `public/modules/import.js:importFolder()` (líneas 103-118)

---

### 🔧 REFACTORIZACIÓN COMPLETA

#### Modularización del Código
**Antes:** 1 archivo monolítico (519 líneas)
**Después:** 10 archivos modulares (915 líneas totales)

```
public/
├── app.js (75 líneas) ← ORQUESTADOR PRINCIPAL
└── modules/
    ├── utils.js (52 líneas)            - Utilidades generales
    ├── storage.js (74 líneas)          - Gestión de fileIndex y Preferences
    ├── ui.js (60 líneas)               - Helpers de UI
    ├── render.js (199 líneas)          - Renderizado (tree, markdown, search)
    ├── search.js (51 líneas)           - Búsqueda
    ├── fileOperations.js (100 líneas)  - Operaciones de archivos
    ├── folderOperations.js (53 líneas) - Operaciones de carpetas
    ├── import.js (139 líneas)          - Importación de archivos/carpetas
    └── tabs.js (112 líneas)            - Sistema de pestañas
```

#### Beneficios de la Modularización
- ✅ **Mejor mantenibilidad** - Cada módulo tiene responsabilidad única
- ✅ **Testing más fácil** - Módulos independientes testeables
- ✅ **Reutilización** - Funciones exportables entre módulos
- ✅ **Escalabilidad** - Fácil añadir nuevas features
- ✅ **Lazy loading** - Posibilidad de cargar módulos bajo demanda

---

### 🎨 MEJORAS DE UI/UX

#### Estilos Añadidos (index.html)
1. **Tab Bar** (líneas 558-627)
   - Scroll horizontal
   - Tabs con indicador activo
   - Botones de cerrar integrados

2. **Botones de Eliminar Archivos** (líneas 628-643)
   - Aparecen en hover
   - Icono ✕ con transición
   - Color rojo al hover

3. **Botón Flotante de Importar** (líneas 644-669)
   - Posición fija bottom-right
   - Sombra con efecto accent
   - Animaciones de hover y active

---

### 📊 MÉTRICAS

| Métrica | Antes | Después | Mejora |
|---------|-------|---------|--------|
| Archivos JS | 1 | 10 | +900% modularidad |
| Líneas app.js | 519 | 75 | -85.5% |
| Funcionalidades | 8 | 13 | +62.5% |
| Pestañas simultáneas | 0 | ∞ | ✨ Nueva feature |
| Botones cerrar | 1 (global) | N (por archivo) | ✨ Nueva feature |
| Botón importar | 1 (sidebar) | 2 (sidebar + flotante) | 100% visibilidad |

---

### 🔄 CAMBIOS TÉCNICOS

#### index.html
- ✅ Cambio de `<script src="app.js">` a `<script type="module" src="app.js">`
- ✅ Añadida barra de pestañas `<div class="tab-bar" id="tabBar"></div>`
- ✅ Añadido botón flotante `<button class="btn-import-float">`
- ✅ Nuevos estilos CSS (150+ líneas)

#### app.js
- ✅ Convertido a ES6 modules con imports
- ✅ Funciones globales expuestas via `window.*`
- ✅ Inicialización modular con async/await
- ✅ Reducción de 519 → 75 líneas (85.5%)

#### Nuevos Módulos
Todos los módulos usan sintaxis ES6:
- `export` para funciones públicas
- `import` para dependencias
- Funciones privadas no exportadas

---

### ⚠️ BREAKING CHANGES

Ninguno - La app es 100% retrocompatible.

Todos los cambios son internos (modularización) y nuevas features opcionales.

---

### 📝 PRÓXIMAS IMPLEMENTACIONES (Roadmap)

#### Prioridad Alta
- [ ] Editor de markdown inline
- [ ] Exportar archivos (individual/carpeta como ZIP)
- [ ] Crear carpetas manualmente
- [ ] Renombrar archivos/carpetas

#### Prioridad Media
- [ ] Drag & drop para mover archivos entre carpetas
- [ ] Breadcrumb navigation
- [ ] Favoritos/bookmarks
- [ ] Metadata de archivos (fecha, tamaño, tags)

#### Prioridad Baja
- [ ] Temas (claro/oscuro/personalizado)
- [ ] Sincronización con cloud (Google Drive, Dropbox)
- [ ] Exportar a GitHub

---

### 🧪 TESTING

**Estado:** ⚠️ Pendiente de testing en dispositivo Android

**Checklist de Testing:**
- [ ] Importar archivos individuales
- [ ] Importar múltiples archivos
- [ ] Abrir/cerrar pestañas
- [ ] Eliminar archivos desde árbol
- [ ] Eliminar carpetas completas
- [ ] Búsqueda con highlight
- [ ] Botón flotante de importar
- [ ] Toggle sidebar (móvil)
- [ ] Renderizado markdown
- [ ] Toggle Raw/Render
- [ ] Copy buttons en code blocks
- [ ] Persistencia de fileIndex

---

### 👨‍💻 AUTOR

**Ruben** - AI Security Specialist in Training
Barcelona, 2026

---

### 📄 LICENCIA

ISC
