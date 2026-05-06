# 🚀 Compilar MD Viewer - Todas las Plataformas

## 📋 RESUMEN RÁPIDO

| Plataforma | Compilar en Windows | Archivo Generado | Tiempo |
|------------|---------------------|------------------|--------|
| **Web** | ✅ SÍ | - | Instant |
| **Android** | ✅ SÍ | APK | 30-60s |
| **iOS** | ❌ NO (requiere macOS) | IPA | 5-10min |

---

## 🌐 WEB (Desarrollo)

### Testing Local

```bash
cd C:\Users\cra\Proyectos\md-viewer
npm run dev:web
```

Abre: http://localhost:3000

**Funcionalidades limitadas en web:**
- ❌ File picker no funciona (requiere Capacitor nativo)
- ✅ Renderizado markdown funciona
- ✅ UI/UX completa
- ✅ Testing de estilos

---

## 🤖 ANDROID

### Requisitos
- ✅ Windows / macOS / Linux
- ✅ Android Studio (opcional)
- ✅ Java JDK 17+

### Opción 1: Generar APK (Sin dispositivo)

```bash
cd C:\Users\cra\Proyectos\md-viewer

# Sincronizar archivos
npm run build:android

# Compilar APK
cd android
.\gradlew.bat assembleDebug
```

**APK generado en:**
```
android\app\build\outputs\apk\debug\app-debug.apk
```

**Instalar APK:**
1. Copia el APK a tu móvil Android
2. Abre el archivo desde el explorador
3. Acepta permisos de "Instalar apps desconocidas"

### Opción 2: Instalar Directamente

**Con emulador:**
```bash
# Iniciar emulador desde Android Studio
# O con CLI:
emulator -avd <nombre_emulador>

# En otra terminal:
cd android
.\gradlew.bat installDebug
```

**Con dispositivo físico:**
1. Activa **Depuración USB** en el móvil:
   - Ajustes → Acerca del teléfono → Toca "Número de compilación" 7 veces
   - Ajustes → Sistema → Opciones de desarrollador → Depuración USB
2. Conecta vía USB
3. Acepta permiso en el móvil

```bash
# Verificar que el dispositivo está conectado
adb devices

# Instalar
cd android
.\gradlew.bat installDebug
```

### Compilar APK Release (Para publicar)

```bash
cd android
.\gradlew.bat assembleRelease
```

APK en: `android\app\build\outputs\apk\release\app-release-unsigned.apk`

**Para firmar APK (requerido para Play Store):**
- Sigue: https://developer.android.com/studio/publish/app-signing

---

## 🍎 iOS

### Requisitos
- ❌ **NO en Windows** (requiere macOS)
- ✅ macOS Catalina 10.15.4+
- ✅ Xcode 14.0+
- ✅ CocoaPods

### Proceso Completo

**Ver documentación detallada:** [`BUILD_IOS.md`](./BUILD_IOS.md)

**Resumen:**
1. Copia el proyecto a un Mac
2. Instala dependencias:
   ```bash
   npm install
   pod install --project-directory=ios/App
   ```
3. Abre Xcode:
   ```bash
   npm run ios
   ```
4. Configura firma de código (Apple ID)
5. Compila y ejecuta en simulador o iPhone

### Alternativas sin Mac

- **Cloud Build:** Ionic Appflow (~$29/mes)
- **GitHub Actions:** Gratis con limitaciones
- **PWA:** Progressive Web App (no requiere compilación)

---

## 📦 ESTRUCTURA DE ARCHIVOS

```
md-viewer/
├── public/              ← Código web (HTML, JS, CSS)
│   ├── index.html
│   ├── app.js
│   └── modules/
├── android/             ← Proyecto Android nativo
│   ├── app/
│   └── build.gradle
├── ios/                 ← Proyecto iOS nativo (requiere Mac)
│   ├── App/
│   └── Podfile
├── package.json         ← Dependencias npm
└── capacitor.config.json ← Configuración Capacitor
```

---

## 🔄 WORKFLOW COMPLETO

### 1. Hacer Cambios en el Código

Edita archivos en `public/`:
- `public/index.html` - UI
- `public/app.js` - Lógica principal
- `public/modules/*.js` - Módulos

### 2. Testear en Web

```bash
npm run dev:web
```

### 3. Sincronizar con Plataformas Nativas

**Android:**
```bash
npm run build:android
```

**iOS:**
```bash
npm run build:ios
```

### 4. Compilar

**Android:**
```bash
cd android
.\gradlew.bat assembleDebug
```

**iOS (en Mac):**
```bash
npm run ios
# En Xcode, click Run
```

---

## 🧪 TESTING

### Web Browser
```bash
npm run dev:web
# Abre DevTools (F12) para ver console.log()
```

### Android Emulator
```bash
# Desde Android Studio: Tools → Device Manager → Run
cd android
.\gradlew.bat installDebug
```

### iOS Simulator (en Mac)
```bash
npm run ios
# En Xcode, selecciona simulador y click Run
```

### Dispositivos Reales

**Android:**
```bash
adb devices
cd android
.\gradlew.bat installDebug
```

**iOS (en Mac):**
- Conecta iPhone vía USB
- En Xcode, selecciona tu dispositivo
- Click Run

---

## 📊 COMPARACIÓN DE PLATAFORMAS

| Feature | Web | Android | iOS |
|---------|-----|---------|-----|
| File picker | ❌ | ✅ | ✅ |
| Filesystem access | ❌ | ✅ | ✅ |
| Preferencias persistentes | ❌ | ✅ | ✅ |
| Markdown rendering | ✅ | ✅ | ✅ |
| Sistema de tabs | ✅ | ✅ | ✅ |
| Búsqueda | ✅ | ✅ | ✅ |
| Offline | ❌ | ✅ | ✅ |

---

## 🔧 COMANDOS NPM DISPONIBLES

```bash
# Web
npm run dev:web          # Servidor de desarrollo (localhost:3000)

# Android
npm run build:android    # Sincronizar archivos con Android
npm run android          # Abrir Android Studio

# iOS (requiere Mac)
npm run build:ios        # Sincronizar archivos con iOS
npm run ios              # Abrir Xcode

# General
npm run sync             # Sincronizar todas las plataformas
```

---

## 🐛 TROUBLESHOOTING COMÚN

### "No connected devices" (Android)
**Solución:**
```bash
# Verificar dispositivos
adb devices

# Si no aparece nada:
# 1. Revisa cable USB
# 2. Activa depuración USB
# 3. Acepta permiso en el móvil
```

### "CocoaPods not installed" (iOS)
**Solución (en Mac):**
```bash
sudo gem install cocoapods
cd ios/App
pod install
```

### "Module not found" (Web)
**Solución:**
```bash
# Reinstalar dependencias
rm -rf node_modules package-lock.json
npm install
```

### "Gradle build failed" (Android)
**Solución:**
```bash
cd android
.\gradlew.bat clean
.\gradlew.bat assembleDebug
```

---

## 📱 PUBLICAR EN TIENDAS

### Google Play Store (Android)

1. **Crear keystore:**
   ```bash
   keytool -genkey -v -keystore my-release-key.keystore -keyalg RSA -keysize 2048 -validity 10000 -alias my-key-alias
   ```

2. **Configurar en `android/app/build.gradle`:**
   ```gradle
   signingConfigs {
       release {
           storeFile file('my-release-key.keystore')
           storePassword 'xxx'
           keyAlias 'my-key-alias'
           keyPassword 'xxx'
       }
   }
   ```

3. **Compilar release:**
   ```bash
   .\gradlew.bat assembleRelease
   ```

4. **Subir a Play Console:**
   - https://play.google.com/console
   - Create App → Upload APK/Bundle

### App Store (iOS)

1. **Compilar en Mac:**
   - Xcode → Product → Archive

2. **Distribuir:**
   - Distribute App → App Store Connect

3. **Subir a App Store Connect:**
   - https://appstoreconnect.apple.com
   - TestFlight → Add Build

---

## 🎯 CHECKLIST PRE-RELEASE

### Antes de Publicar

- [ ] Testear en Android (3+ dispositivos/versiones)
- [ ] Testear en iOS (3+ dispositivos/versiones)
- [ ] Todos los features funcionan offline
- [ ] Importación de archivos funciona
- [ ] Persistencia funciona (cerrar/abrir app)
- [ ] No hay crashes
- [ ] Performance aceptable (sin lag)
- [ ] Iconos y splash screen configurados
- [ ] Versión actualizada en `package.json`
- [ ] Changelog actualizado
- [ ] Screenshots para tiendas

---

## 📚 RECURSOS ADICIONALES

- **Capacitor Docs:** https://capacitorjs.com/docs
- **Android Docs:** https://developer.android.com
- **iOS Docs:** https://developer.apple.com
- **BUILD_IOS.md:** Guía completa de iOS

---

**Última actualización:** 2026-05-05
