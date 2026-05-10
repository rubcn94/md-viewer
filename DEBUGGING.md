# 🐛 Debugging MD Viewer - Si No Aparece el Botón o Da Errores

## 🔴 PROBLEMA ACTUAL

Si después de instalar el APK nuevo:
- ❌ No aparece el botón "Importar archivos"
- ❌ Sale error al intentar importar
- ❌ La app parece rota

**→ Hay un error de JavaScript que está rompiendo la app.**

---

## ✅ PASOS PARA DEBUGGEAR

### **Método 1: Ver Error en Pantalla (Más Fácil)**

He añadido un sistema de error handling que muestra errores en pantalla.

1. **Desinstala** la app actual
2. **Instala** el APK nuevo (compilado a las 10:37):
   ```
   android\app\build\outputs\apk\debug\app-debug.apk
   ```
3. **Abre la app**
4. **Si hay un error, aparecerá una pantalla roja con el mensaje**

**Mándame una captura de esa pantalla roja** y sabré exactamente qué está fallando.

---

### **Método 2: Usar Página de Debug**

He creado una página especial de debug que prueba todos los módulos:

1. **Instala el APK nuevo** (arriba)
2. **Abre la app**
3. **En la barra de direcciones del navegador móvil**, navega a:
   ```
   file:///android_asset/public/debug.html
   ```

   O si no funciona, usa Chrome DevTools (Método 3) y escribe en la consola:
   ```javascript
   window.location.href = 'debug.html';
   ```

4. **Click en los botones de test**:
   - "Test Capacitor" → Verifica plugins
   - "Test Import Module" → Verifica módulo de importación
   - "Test Storage Module" → Verifica almacenamiento

5. **Mándame captura de los logs** que aparecen en verde/rojo

---

### **Método 3: Chrome DevTools (Más Técnico)**

Este es el método más completo para ver exactamente qué está fallando:

#### **Paso 1: Conectar Móvil al PC**

1. Conecta móvil por USB
2. En el móvil: **Activar Depuración USB**
   - Ajustes → Acerca del teléfono
   - Toca "Número de compilación" 7 veces
   - Vuelve → Opciones de desarrollo
   - Activa "Depuración USB"
   - Conecta cable USB y acepta permisos

#### **Paso 2: Abrir DevTools**

1. En tu PC, abre **Google Chrome**
2. Ve a: `chrome://inspect`
3. Verás tu dispositivo listado
4. Busca "MD Viewer" en la lista de apps
5. Click en **"inspect"**

#### **Paso 3: Ver Errores**

Se abrirá DevTools. Mira la pestaña **Console**:

- **Errores en rojo** → Eso es lo que está roto
- **Logs con [DEBUG]** → Muestra el progreso de inicialización
- **Logs con [ERROR]** → El error fatal

**Mándame una captura de la consola** con los errores que aparezcan.

---

## 📋 Errores Comunes y Soluciones

### **Error: "Cannot find module"**
```
Error: Cannot find module './modules/readingProgress.js'
```

**Causa:** El archivo no se sincronizó correctamente.

**Solución:**
```bash
cd C:\Users\cra\Proyectos\md-viewer
npx cap sync android
cd android
gradlew clean assembleDebug
```

Reinstala el APK nuevo.

---

### **Error: "FilePicker is not defined"**
```
Error: FilePicker is undefined
```

**Causa:** El plugin de FilePicker no está instalado o no se cargó.

**Solución:**
```bash
cd C:\Users\cra\Proyectos\md-viewer
npm install @capawesome/capacitor-file-picker
npx cap sync android
cd android
gradlew assembleDebug
```

---

### **Error: "window.importFiles is not a function"**
```
Uncaught TypeError: window.importFiles is not a function
```

**Causa:** El `app.js` no se cargó correctamente, por lo que las funciones no se expusieron a `window`.

**Solución:** Esto indica que hay un error en alguno de los imports. Usa DevTools (Método 3) para ver cuál módulo está fallando.

---

### **Error: No aparece nada, pantalla en blanco**
```
(Sin errores, pero app no funciona)
```

**Causa:** JavaScript está completamente roto desde el principio.

**Solución:**
1. Usa Chrome DevTools (Método 3)
2. Mira si hay algún error de sintaxis o import
3. Verifica que Capacitor se cargó: En DevTools consola, escribe:
   ```javascript
   window.Capacitor
   ```
   Debería devolver un objeto, no `undefined`.

---

## 🎯 Qué Información Necesito

Para ayudarte rápidamente, mándame **UNA** de estas cosas:

1. **Captura de pantalla de error en rojo** (si aparece en la app)
2. **Captura de debug.html después de hacer los tests**
3. **Captura de Chrome DevTools → Console** mostrando errores

Con eso sabré exactamente qué está fallando y cómo arreglarlo.

---

## 🚨 Último Recurso: Versión Mínima

Si nada funciona, puedo crear una versión ultra-mínima de la app sin las nuevas features, solo para que funcione la importación básica de archivos. Pero primero necesito saber qué error exacto está dando.

---

**APK actualizado con error handling:**
```
C:\Users\cra\Proyectos\md-viewer\android\app\build\outputs\apk\debug\app-debug.apk
```
**Timestamp:** 2026-05-07 10:40 (con debugging añadido)
