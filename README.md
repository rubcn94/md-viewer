# 📱 MD Viewer Mobile

> Visor de Markdown minimalista y elegante para Android e iOS

![Version](https://img.shields.io/badge/version-2.0.0-blue.svg)
![Platform](https://img.shields.io/badge/platform-Android%20%7C%20iOS-lightgrey.svg)
![License](https://img.shields.io/badge/license-ISC-green.svg)

---

## ✨ Features

### 📂 Gestión de Archivos
- ✅ **Importar múltiples archivos** Markdown desde tu dispositivo
- ✅ **Estructura de carpetas** preservada automáticamente
- ✅ **Árbol de archivos** navegable con carpetas colapsables
- ✅ **Persistencia local** - Tus archivos se guardan en el dispositivo

### 🎨 Experiencia de Usuario
- ✅ **Sistema de pestañas** - Múltiples archivos abiertos simultáneamente
- ✅ **Búsqueda inteligente** con términos resaltados
- ✅ **Modo Raw/Render** - Alterna entre texto plano y markdown renderizado
- ✅ **Dark theme** - Tema oscuro optimizado para OLED
- ✅ **Responsive design** - Funciona en móvil, tablet y desktop

### 📝 Markdown
- ✅ **Renderizado completo** - Headers, listas, tablas, código, links
- ✅ **Syntax highlighting** - Resaltado de código con Highlight.js
- ✅ **Copy buttons** - Copia bloques de código con un click
- ✅ **GitHub Flavored Markdown** - Soporte completo

### ⚡ Performance
- ✅ **Arquitectura modular** - Código organizado en 9 módulos ES6
- ✅ **Lazy loading ready** - Preparado para carga bajo demanda
- ✅ **Optimizado para móvil** - Safe areas, touch targets, smooth scroll

---

## 📸 Screenshots

> [Añadir screenshots aquí]

---

## 🚀 Instalación

### 📱 Para Usuarios

#### Android
1. Descarga el APK desde [Releases](https://github.com/tu-usuario/md-viewer/releases)
2. Instala en tu dispositivo Android
3. Abre la app y pulsa "Importar archivos"

#### iOS
1. Requiere compilación en macOS (ver [BUILD_IOS.md](./BUILD_IOS.md))
2. O usa TestFlight (próximamente)

---

### 👨‍💻 Para Desarrolladores

#### Requisitos
- **Node.js** 16+ y npm
- **Android Studio** (para Android)
- **Xcode** (para iOS, solo macOS)

#### Instalación

```bash
# Clonar repositorio
git clone https://github.com/tu-usuario/md-viewer.git
cd md-viewer

# Instalar dependencias
npm install

# Testing en navegador
npm run dev:web
```

#### Compilar Android

```bash
# Sincronizar archivos
npm run build:android

# Generar APK
cd android
.\gradlew.bat assembleDebug  # Windows
./gradlew assembleDebug      # macOS/Linux

# APK en: android/app/build/outputs/apk/debug/app-debug.apk
```

#### Compilar iOS (requiere macOS)

```bash
# Sincronizar archivos
npm run build:ios

# Instalar dependencias de iOS
cd ios/App
pod install
cd ../..

# Abrir en Xcode
npm run ios
```

**Ver documentación completa:** [BUILD_ALL_PLATFORMS.md](./BUILD_ALL_PLATFORMS.md)

---

## 📁 Arquitectura

### Estructura Modular

```
md-viewer/
├── public/                  # Frontend
│   ├── app.js              # Orquestador (75 líneas)
│   ├── index.html          # UI + estilos
│   └── modules/            # 9 módulos ES6
│       ├── utils.js        # Utilidades
│       ├── storage.js      # Persistencia
│       ├── ui.js           # Helpers UI
│       ├── render.js       # Renderizado
│       ├── search.js       # Búsqueda
│       ├── fileOperations.js
│       ├── folderOperations.js
│       ├── import.js       # Importación
│       └── tabs.js         # Sistema de pestañas
├── android/                # Android nativo
├── ios/                    # iOS nativo
└── docs/                   # Documentación
```

### Stack Tecnológico

- **Frontend:** Vanilla JS (ES6 Modules), HTML5, CSS3
- **Markdown:** [Marked.js](https://marked.js.org/) v18.0.3
- **Syntax Highlighting:** [Highlight.js](https://highlightjs.org/) v11.11.1
- **Mobile:** [Capacitor](https://capacitorjs.com/) v6.2.0
- **Build:** Gradle (Android), Xcode (iOS)

### Plugins de Capacitor

- `@capacitor/filesystem` - Acceso al sistema de archivos
- `@capacitor/preferences` - Persistencia local
- `@capawesome/capacitor-file-picker` - Selector de archivos

---

## 📚 Documentación

- **[CHANGELOG.md](./CHANGELOG.md)** - Historial de versiones
- **[README_MODULES.md](./README_MODULES.md)** - Arquitectura modular
- **[BUILD_ALL_PLATFORMS.md](./BUILD_ALL_PLATFORMS.md)** - Compilación (Web, Android, iOS)
- **[BUILD_IOS.md](./BUILD_IOS.md)** - Guía específica de iOS
- **[IMPORT_GUIDE.md](./IMPORT_GUIDE.md)** - Cómo importar archivos/carpetas
- **[TESTING.md](./TESTING.md)** - Checklist de testing

---

## 🎯 Roadmap

### v2.1 (Próximamente)
- [ ] Editor de markdown inline
- [ ] Exportar archivos (individual/ZIP)
- [ ] Crear carpetas manualmente
- [ ] Renombrar archivos/carpetas

### v2.2
- [ ] Drag & drop para mover archivos
- [ ] Favoritos/bookmarks
- [ ] Temas personalizables
- [ ] Metadata de archivos (fecha, tamaño, tags)

### v3.0
- [ ] Sincronización con cloud (Google Drive, Dropbox)
- [ ] Colaboración en tiempo real
- [ ] Exportar a PDF
- [ ] Modo presentación

---

## 🤝 Contribuir

¡Las contribuciones son bienvenidas!

### Proceso

1. **Fork** el repositorio
2. **Crea una rama** para tu feature (`git checkout -b feature/AmazingFeature`)
3. **Commit** tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. **Push** a la rama (`git push origin feature/AmazingFeature`)
5. **Abre un Pull Request**

### Guías de Estilo

- **JavaScript:** ES6+, sin semicolons
- **CSS:** Variables CSS, Mobile-first
- **Commits:** Conventional Commits (`feat:`, `fix:`, `docs:`, etc.)

---

## 🐛 Reportar Bugs

Abre un [issue](https://github.com/tu-usuario/md-viewer/issues) con:

- **Descripción** del bug
- **Pasos para reproducir**
- **Comportamiento esperado** vs **actual**
- **Screenshots** (si aplica)
- **Dispositivo/OS** y versión de la app

---

## 📄 Licencia

**ISC License** - Ver [LICENSE](./LICENSE) para más detalles

---

## 👨‍💻 Autor

**Ruben**
📍 Barcelona, España
🎯 AI Security Specialist in Training

---

## 🙏 Agradecimientos

- [Marked.js](https://marked.js.org/) - Markdown parser
- [Highlight.js](https://highlightjs.org/) - Syntax highlighting
- [Capacitor](https://capacitorjs.com/) - Native mobile framework
- [Ionic Team](https://ionic.io/) - Capacitor creators

---

## 📊 Stats

![GitHub repo size](https://img.shields.io/github/repo-size/tu-usuario/md-viewer)
![GitHub issues](https://img.shields.io/github/issues/tu-usuario/md-viewer)
![GitHub pull requests](https://img.shields.io/github/issues-pr/tu-usuario/md-viewer)

---

**⭐ Si te gusta el proyecto, dale una estrella en GitHub!**
# md-viewer
