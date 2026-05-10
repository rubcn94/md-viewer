# 📱 Instrucciones de Instalación - MD Viewer v2.0

## ⚠️ PROBLEMA ACTUAL

Si no ves los cambios (importar carpetas, ticks, bookmarks, etc.), es porque **tienes instalada la versión antigua** del APK.

---

## ✅ SOLUCIÓN - 3 Pasos

### 1. **DESINSTALAR APP VIEJA**

En tu móvil Android:
- Ve a: **Ajustes** → **Aplicaciones** → **MD Viewer**
- Pulsa **Desinstalar**
- Confirma

⚠️ **Importante:** Si no desinstalas la vieja, Android NO actualizará los archivos JavaScript y seguirás viendo la versión anterior.

---

### 2. **INSTALAR APK NUEVO**

El APK actualizado está en:
```
C:\Users\cra\Proyectos\md-viewer\android\app\build\outputs\apk\debug\app-debug.apk
```

**Última compilación:** 2026-05-07 10:37 ✅
**Tamaño:** 3.7 MB

#### **Opción A: Con ADB (Recomendado)**

```bash
# Desde la carpeta del proyecto
adb install android\app\build\outputs\apk\debug\app-debug.apk
```

#### **Opción B: Manual**

1. Copia el archivo `app-debug.apk` a tu móvil (USB, Bluetooth, email)
2. En el móvil, abre el archivo APK
3. Permite instalación de fuentes desconocidas si te lo pide
4. Instala

---

### 3. **VERIFICAR QUE FUNCIONA**

Abre la app y verifica que ahora tienes:

✅ **Botón "📁 Importar archivos"** en sidebar
✅ Al importar archivos, preserva estructura de carpetas
✅ Contador de archivos en cada carpeta
✅ Iconos ▶ para expandir/colapsar carpetas

Si ves todo esto, **la app está actualizada correctamente** ✅

---

## 🔧 Para Futuras Compilaciones

Usa el script automático que compila todo de una vez:

```batch
cd C:\Users\cra\Proyectos\md-viewer
build-android.bat
```

Esto hace:
1. Sync de archivos web → Android
2. Compilación del APK
3. Te muestra dónde está el APK listo

---

## 🐛 Si Aún No Funciona

### **Debug en Chrome DevTools:**

1. Conecta móvil por USB
2. Abre Chrome en PC
3. Ve a: `chrome://inspect`
4. Selecciona tu dispositivo
5. Click en "inspect" bajo MD Viewer
6. Mira la consola JavaScript para errores

### **Ver logs de Android:**

```bash
adb logcat | grep -i capacitor
```

Esto muestra errores de los plugins de Capacitor.

---

## 📋 Checklist de Funcionalidades Nuevas

Cuando abras la app actualizada, deberías poder:

- [x] **Importar archivos** - Funciona sin errores
- [x] **Ver carpetas recursivas** - Múltiples niveles con ▶
- [x] **Marcar como leído** - Botón ○/✓ en header del documento
- [x] **Guardar bookmark** - Botón 📍/📌 para marcar posición
- [x] **Subrayar texto** - Botón 🖍️ activa modo highlight
- [x] **Eliminar con long-press** - Mantén pulsado 500ms sobre archivo/carpeta

Si **alguna de estas NO funciona**, avisa para debuggear.

---

## 🚨 Error Común: "No se pueden importar archivos"

**Causa:** Permisos de almacenamiento no concedidos.

**Solución:**
1. Ajustes → Aplicaciones → MD Viewer → Permisos
2. Activa **Almacenamiento** y **Archivos y multimedia**
3. Reinicia la app

---

**¿Todo listo?** Prueba importar algunos archivos MD y verifica que se preserve la estructura de carpetas. Si ves las carpetas en el sidebar, ¡todo está funcionando! 🎉
