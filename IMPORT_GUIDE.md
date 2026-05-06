# 📁 Guía de Importación - MD Viewer Mobile

## 🎯 ¿Cómo funciona la importación?

### Botón de Importar

**Ubicación:** Sidebar lateral (menú hamburguesa en móvil)

**Apariencia:** Botón grande con icono 📁 y texto "Importar archivos"

**Función:** Abre el selector de archivos del sistema

---

## 📂 ¿Puedo importar carpetas enteras?

### Respuesta Corta: **Depende del dispositivo**

### Android
✅ **Selección múltiple:** SÍ
⚠️ **Carpetas completas:** PARCIAL

**Cómo importar varios archivos:**
1. Click en "Importar archivos"
2. Selecciona múltiples archivos manteniendo pulsado
3. O usa el selector de archivos para navegar entre carpetas

**Estructura de carpetas:**
- Si los archivos tienen paths como `carpeta/archivo.md`, la app **preserva la estructura**
- Los archivos se organizarán automáticamente por carpetas en el árbol

### Ejemplo

Si importas:
```
/sdcard/Documents/notas/tema1.md
/sdcard/Documents/notas/tema2.md
/sdcard/Documents/proyectos/proyecto.md
```

Verás en el árbol:
```
📁 notas
  📄 tema1.md
  📄 tema2.md
📁 proyectos
  📄 proyecto.md
```

---

## 🔧 Limitaciones Técnicas

### Plugin Actual: `@capawesome/capacitor-file-picker`

**Soporta:**
- ✅ Selección múltiple de archivos
- ✅ Lectura de contenido
- ✅ Detección de paths

**NO soporta:**
- ❌ Selección de carpeta completa con un click
- ❌ Importación recursiva automática

### Workaround Actual

La app está **preparada** para recibir estructura de carpetas:

```javascript
// import.js líneas 53-57
// Detectar si viene de una carpeta (path puede incluir estructura)
let fileName = file.name;
let filePath = file.path || fileName;

// Normalizar el path y preservar estructura de carpetas
filePath = filePath.replace(/\\/g, '/'); // Windows paths
```

Si el FilePicker devuelve paths completos, **la app los respeta**.

---

## 🚀 Alternativas para Importar Carpetas

### Opción 1: Selector de Archivos Nativo (Actual)
```
1. Abre el selector
2. Navega a la carpeta
3. Selecciona todos los archivos (long press + select all)
4. Importa
```

### Opción 2: Plugin Alternativo (Futuro)
Cambiar a `@capacitor-community/file-picker` que soporta:
- Selección de directorios
- Importación recursiva

**Implementación:**
```bash
npm uninstall @capawesome/capacitor-file-picker
npm install @capacitor-community/file-picker
```

Luego modificar `import.js`:
```javascript
export async function importFolder() {
  const result = await FilePicker.pickDirectory({
    recursive: true
  });

  // Procesar todos los archivos del directorio
}
```

### Opción 3: Share Sheet (Android)
Usar el sistema de compartir de Android:

1. Desde el explorador de archivos
2. Selecciona carpeta
3. Compartir → MD Viewer Mobile

**Implementación:**
```javascript
// Registrar intent handler en AndroidManifest.xml
// Procesar archivos compartidos
```

---

## 📊 Comparación de Métodos

| Método | Archivos Múltiples | Estructura de Carpetas | Complejidad |
|--------|-------------------|------------------------|-------------|
| Selector actual | ✅ | ⚠️ Manual | Baja |
| Plugin alternativo | ✅ | ✅ | Media |
| Share sheet | ✅ | ✅ | Alta |

---

## 🎯 Mejor Práctica Actual

### Para importar archivos organizados:

1. **Prepara tus archivos** con nombres descriptivos:
   ```
   01_introduccion.md
   02_capitulo1.md
   03_capitulo2.md
   ```

2. **Importa todos de golpe** usando selección múltiple

3. **Organiza después** (feature futura: arrastrar entre carpetas)

### Para estructura de carpetas:

1. **Si el selector lo permite**, navega a la carpeta raíz
2. **Selecciona todos los archivos** (puede que respete la estructura)
3. **Importa**
4. **Verifica en el árbol** si se crearon las carpetas

---

## 🔮 Features Futuras

### En el Roadmap:

- [ ] **Crear carpetas manualmente** dentro de la app
- [ ] **Mover archivos** entre carpetas (drag & drop)
- [ ] **Renombrar archivos/carpetas**
- [ ] **Importar carpeta completa** con un click (requiere plugin alternativo)
- [ ] **Sincronización automática** con carpeta del dispositivo

---

## ❓ FAQ

### ¿Por qué no puedo importar carpetas directamente?

El plugin actual (`@capawesome/capacitor-file-picker`) no soporta selección de directorios. Solo archivos individuales o múltiples.

### ¿Se pierden las carpetas al importar?

No. Si los archivos tienen paths como `carpeta/archivo.md`, la app crea automáticamente la estructura de carpetas.

### ¿Cuántos archivos puedo importar a la vez?

Técnicamente ilimitado, pero depende de:
- Memoria del dispositivo
- Tamaño de los archivos
- Rendimiento del selector de archivos

**Recomendado:** < 100 archivos por importación

### ¿Puedo importar otros formatos además de .md?

Sí, el selector acepta:
- `.md` (Markdown)
- `.txt` (Plain text)
- Cualquier archivo de texto

Archivos sin extensión `.md` se renombran automáticamente a `.md`.

---

## 🛠️ Troubleshooting

### "No se seleccionaron archivos"
- Asegúrate de confirmar la selección en el selector
- Verifica permisos de almacenamiento en Android

### "Error al importar"
- Verifica que los archivos no están corruptos
- Comprueba que el encoding es UTF-8
- Revisa el tamaño de los archivos (muy grandes pueden fallar)

### "Archivos sin carpeta"
- El selector de archivos puede no devolver paths completos
- En ese caso, todos los archivos aparecen en la raíz
- Solución: Crea carpetas manualmente (feature futura) o renombra archivos con prefijos

---

**Última actualización:** 2026-05-05
