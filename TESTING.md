# 🧪 Testing Checklist - MD Viewer Mobile v2.0.0

## ⚡ Testing Rápido (Web Browser)

Antes de compilar para Android, prueba en navegador:

```bash
cd C:\Users\cra\Proyectos\md-viewer
npm run dev:web
```

Abre: http://localhost:3000

---

## ✅ Checklist de Funcionalidades

### 1. Importar Archivos
- [ ] Click en botón **+ Importar** (sidebar)
- [ ] Click en botón flotante **+** (bottom-right)
- [ ] Seleccionar múltiples archivos `.md`
- [ ] Verificar que aparecen en el árbol
- [ ] Verificar toast de confirmación "✓ X archivos importados"

### 2. Sistema de Pestañas
- [ ] Abrir archivo → Verificar que aparece pestaña en la barra superior
- [ ] Abrir 3-4 archivos diferentes
- [ ] Verificar que la pestaña activa está resaltada (azul)
- [ ] Click en diferentes pestañas → Verificar que cambia el contenido
- [ ] Verificar scroll horizontal si hay muchas pestañas

### 3. Botones de Cerrar Archivos
- [ ] Hover sobre archivo en árbol → Verificar que aparece ✕
- [ ] Click en ✕ → Verificar confirmación
- [ ] Confirmar eliminación → Verificar que:
  - Archivo desaparece del árbol
  - Pestaña asociada se cierra
  - Si era la pestaña activa, cambia a otra

### 4. Botones de Cerrar Pestañas
- [ ] Abrir varios archivos
- [ ] Click en ✕ de una pestaña → Verificar que:
  - Pestaña se cierra
  - Cambia a pestaña anterior o siguiente
  - El archivo sigue en el árbol

### 5. Botón Flotante de Importar
- [ ] Scroll hacia abajo → Verificar que botón **+** sigue visible
- [ ] Hover sobre botón → Verificar animación de escala
- [ ] Click → Verificar que abre file picker

### 6. Búsqueda Mejorada
- [ ] Escribir término en barra de búsqueda (ej: "título")
- [ ] Verificar resultados con:
  - Nombre del archivo
  - Snippet del contenido
  - **Términos resaltados en amarillo**
- [ ] Click en resultado → Verificar que abre el archivo

### 7. Renderizado Markdown
- [ ] Abrir archivo `.md` con:
  - Headers (# ## ###)
  - Listas
  - Code blocks
  - Links
  - **Bold**, *italic*
- [ ] Verificar que todo se renderiza correctamente
- [ ] Verificar botones "Copiar" en code blocks

### 8. Toggle Raw/Render
- [ ] Abrir archivo
- [ ] Click botón **Raw** → Verificar texto plano
- [ ] Click botón **Render** → Verificar markdown formateado

### 9. Eliminar Carpetas
- [ ] Importar archivos con estructura de carpetas
- [ ] Hover sobre carpeta → Click ✕
- [ ] Confirmar → Verificar que:
  - Carpeta y todos sus archivos desaparecen
  - Pestañas asociadas se cierran

### 10. Sidebar Toggle (Móvil)
- [ ] Redimensionar ventana a < 640px
- [ ] Click botón ☰ → Verificar que sidebar se abre
- [ ] Click overlay → Verificar que sidebar se cierra
- [ ] Abrir archivo → Verificar que sidebar se cierra automáticamente

### 11. Persistencia
- [ ] Importar archivos
- [ ] Refrescar página (F5)
- [ ] Verificar que archivos siguen ahí

### 12. Estados Especiales
- [ ] Sin archivos → Verificar pantalla vacía con mensaje
- [ ] Error de renderizado → Verificar pantalla de error
- [ ] Toast notifications → Verificar que aparecen y desaparecen

---

## 📱 Testing en Android

### Compilar APK
```bash
cd C:\Users\cra\Proyectos\md-viewer
npm run build:android
npm run android
```

### Testing Específico Móvil
- [ ] Importar archivos desde almacenamiento Android
- [ ] Verificar safe areas (notch, barra de navegación)
- [ ] Verificar touch targets (mínimo 48x48px)
- [ ] Verificar scroll suave (-webkit-overflow-scrolling: touch)
- [ ] Verificar que no hay zoom no deseado
- [ ] Verificar que sidebar overlay funciona

### Performance
- [ ] Importar 50+ archivos → Verificar que no se congela
- [ ] Abrir/cerrar pestañas rápidamente → Verificar fluidez
- [ ] Búsqueda en contenido grande → Verificar debouncing (300ms)

---

## 🐛 Bugs Conocidos a Verificar

### High Priority
- [ ] ¿FilePicker soporta múltiples archivos en Android?
- [ ] ¿Se preserva estructura de carpetas al importar?
- [ ] ¿Filesystem.writeFile() crea subdirectorios automáticamente?

### Medium Priority
- [ ] ¿Caracteres especiales (ñ, á, etc.) se muestran correctamente?
- [ ] ¿Code blocks con sintaxis rara rompen highlight.js?
- [ ] ¿Archivos muy grandes (>1MB) causan lag?

### Low Priority
- [ ] ¿Tabs con nombres muy largos se cortan bien?
- [ ] ¿Animaciones de hover funcionan en móvil?

---

## 🔍 Debugging

### Console Logs
Abrir DevTools (F12) y verificar:
```
[DEBUG] Plugins cargados: { Filesystem: true, Preferences: true, FilePicker: true }
[INFO] MD Viewer Mobile iniciado correctamente
```

### Errores Comunes
```
Error: Cannot read property 'path' of undefined
→ Verificar que fileIndex se cargó correctamente

Error: FilePicker is not defined
→ Solo funciona en Capacitor, no en web

Error: Module not found
→ Verificar que <script type="module"> está en index.html
```

### Chrome DevTools - Network
- [ ] Verificar que todos los módulos se cargan:
  ```
  app.js
  modules/utils.js
  modules/storage.js
  modules/ui.js
  modules/render.js
  modules/search.js
  modules/fileOperations.js
  modules/folderOperations.js
  modules/import.js
  modules/tabs.js
  ```

---

## 📊 Métricas de Performance

### Lighthouse (Chrome DevTools)
```bash
Objetivo:
- Performance: > 90
- Accessibility: > 90
- Best Practices: > 90
- SEO: > 80
```

### Tamaños de Bundle
```
app.js: ~2 KB
modules/: ~24 KB total
index.html: ~28 KB (con CSS inline)
Total transferido: < 100 KB
```

---

## ✅ Criterios de Aceptación

### Funcional
- ✅ Todas las features del checklist funcionan
- ✅ No hay errores en consola
- ✅ No hay warnings de deprecation

### UX
- ✅ Animaciones suaves (60 FPS)
- ✅ Feedback visual claro (hover, active states)
- ✅ Touch targets > 48x48px
- ✅ Contraste de colores WCAG AA

### Performance
- ✅ First Contentful Paint < 1s
- ✅ Time to Interactive < 2s
- ✅ No memory leaks (cerrar/abrir tabs repetidamente)

---

## 🚀 Testing de Regresión

Antes de cada release, ejecutar:

1. **Smoke Test** (5 min)
   - Importar archivos ✅
   - Abrir/cerrar pestañas ✅
   - Eliminar archivos ✅
   - Búsqueda ✅

2. **Full Test** (20 min)
   - Todo el checklist completo ✅

3. **Performance Test** (10 min)
   - 100+ archivos importados
   - 10+ pestañas abiertas
   - Búsqueda en contenido grande

---

## 📝 Reportar Bugs

Formato:
```
**Descripción:** [Qué pasó]
**Esperado:** [Qué debería pasar]
**Steps to reproduce:**
1. Paso 1
2. Paso 2
3. Paso 3
**Screenshot/Video:** [Si aplica]
**Entorno:** Web / Android / iOS
**Versión:** 2.0.0
```

---

**Última actualización:** 2026-05-05
