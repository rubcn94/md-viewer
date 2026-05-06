# MD Viewer Mobile — App Android

Visor de archivos Markdown para Android, con renderizado offline y gestión de archivos local.

## Características

- ✅ **Importación de archivos:** File picker nativo para seleccionar archivos .md
- ✅ **Renderizado offline:** Todo funciona sin conexión
- ✅ **Syntax highlighting:** Código con colores (highlight.js)
- ✅ **Búsqueda local:** Busca en todos los archivos importados
- ✅ **Persistencia:** Los archivos y configuración se guardan localmente
- ✅ **UI móvil optimizada:** Diseño mobile-first con gestos táctiles
- ✅ **Modo RAW:** Ver el markdown sin renderizar

## Diferencias vs versión web

| Feature | Web (server.js) | Móvil (Capacitor) |
|---------|----------------|-------------------|
| Backend | Node.js Express | No requiere servidor |
| Storage | Sistema de archivos | Almacenamiento interno app |
| Carpetas | Ruta absoluta | Importación archivo a archivo |
| Búsqueda | Server-side | Cliente local |
| Offline | ❌ | ✅ |

## Desarrollo

### Requisitos

- Node.js 18+
- Android Studio (para builds)
- JDK 17+
- Android SDK (API 24+)

### Setup

```bash
npm install
npm run sync              # Sincronizar assets con Android
```

### Build APK

```bash
npm run build:android     # Copiar assets + sync
npm run android           # Abrir en Android Studio

# Desde Android Studio:
Build > Build Bundle(s) / APK(s) > Build APK(s)
```

O via Gradle (desde carpeta `android/`):

```bash
cd android
./gradlew assembleDebug   # APK debug
./gradlew assembleRelease # APK release (requiere signing)
```

APK se genera en: `android/app/build/outputs/apk/debug/app-debug.apk`

### Instalación en dispositivo

**Via ADB:**
```bash
adb install android/app/build/outputs/apk/debug/app-debug.apk
```

**Via Termux (si tienes el APK en móvil):**
```bash
termux-setup-storage
cp ~/storage/downloads/app-debug.apk .
pm install app-debug.apk
```

## Uso

1. **Importar archivos:**
   - Pulsa botón "Importar" en sidebar
   - Selecciona uno o varios archivos .md
   - Los archivos se copian al almacenamiento interno

2. **Ver archivos:**
   - Pulsa cualquier archivo en el árbol lateral
   - Se renderiza con formato

3. **Buscar:**
   - Escribe en barra superior
   - Busca en nombre + contenido de todos los archivos

4. **Modo RAW:**
   - Botón "RAW" en header del documento
   - Ver markdown sin renderizar

## Arquitectura

```
md-viewer/
├── public/
│   ├── index.html       # UI (HTML + CSS inline)
│   └── app.js           # Lógica app (Capacitor APIs)
├── android/             # Proyecto Android Studio (auto-generado)
├── capacitor.config.json
└── package.json
```

**Plugins Capacitor usados:**
- `@capacitor/filesystem` → Leer/escribir archivos local
- `@capacitor/preferences` → Guardar config/índice
- `@capawesome/capacitor-file-picker` → Seleccionar archivos

**Librerías frontend:**
- `marked` → Parsing MD → HTML
- `highlight.js` → Syntax highlighting código

## Storage interno

Archivos se guardan en:
```
/data/data/com.mdviewer.app/files/md-viewer-docs/
```

No requiere permisos de almacenamiento externo (todo sandbox privado).

## Roadmap

- [ ] Categorías/carpetas virtuales
- [ ] Favoritos/recientes
- [ ] Export a PDF/HTML
- [ ] Share sheet (compartir documento)
- [ ] Editor MD integrado
- [ ] Sincronización cloud (Dropbox/Drive)
- [ ] Widget Android (último documento)
- [ ] Text-to-Speech

## Licencia

ISC
