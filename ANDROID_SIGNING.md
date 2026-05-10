# Android APK Signing - MD Viewer

**Estado:** ✅ Configurado y funcionando

---

## ✅ Keystore creado

**Ubicación:** `android/app/md-viewer-release.keystore`

**Detalles:**
- **Alias:** md-viewer
- **Password (store):** mdviewer2024
- **Password (key):** mdviewer2024
- **Algoritmo:** RSA 2048-bit
- **Validez:** 10,000 días (~27 años, hasta 2053)
- **CN:** MD Viewer, Barcelona, Spain

**⚠️ IMPORTANTE:** NO subir el keystore a git (ya está en `.gitignore`)

---

## 🔧 Configuración Gradle

Ya configurado en `android/app/build.gradle`:

```gradle
signingConfigs {
    release {
        storeFile file('md-viewer-release.keystore')
        storePassword 'mdviewer2024'
        keyAlias 'md-viewer'
        keyPassword 'mdviewer2024'
    }
}
buildTypes {
    release {
        signingConfig signingConfigs.release
        minifyEnabled false
        proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
    }
}
```

---

## 📦 Compilar APK firmado

```bash
cd android
./gradlew.bat clean assembleRelease
```

**Output:**
```
android/app/build/outputs/apk/release/app-release.apk  (2.9 MB, FIRMADO)
```

---

## 📲 Instalar en dispositivo

### Opción 1: ADB (si tienes cable)
```bash
# Desinstalar versión vieja
adb uninstall com.mdviewer.app

# Instalar nueva
adb install android/app/build/outputs/apk/release/app-release.apk
```

### Opción 2: Copia manual (recomendado)
1. Copia `android\app\build\outputs\apk\release\app-release.apk` al móvil
2. En el móvil: Archivos → Descargas → app-release.apk
3. Pulsa → Instalar
4. Activa "Instalar apps desconocidas" si te lo pide

---

## ✅ Verificar firma

```bash
jarsigner -verify -verbose -certs android/app/build/outputs/apk/release/app-release.apk
```

**Debe mostrar:**
```
>>> Signer
X.509, CN=MD Viewer, OU=Development, O=MD Viewer, L=Barcelona, ST=Catalonia, C=ES
Signature algorithm: SHA256withRSA, 2048-bit key
```

**Nota:** Warning "Invalid certificate chain" es normal para self-signed, no afecta instalación.

---

## 📱 Para publicar en Google Play Store

### 1. Usar el keystore existente
El keystore que creamos (`md-viewer-release.keystore`) es válido para Play Store.

### 2. Generar App Bundle (AAB) en vez de APK
```bash
cd android
./gradlew.bat bundleRelease
```

**Output:**
```
android/app/build/outputs/bundle/release/app-release.aab
```

### 3. Subir a Play Console
1. Entra en https://play.google.com/console
2. Crea nueva app
3. Sube `app-release.aab`
4. Completa Store Listing
5. Publica

**⚠️ GUARDAR KEYSTORE:** Si pierdes el keystore, NUNCA podrás actualizar la app en Play Store.

---

## 🔐 Backup del Keystore

**Hacer backup del keystore en 3 ubicaciones:**
```
✅ Local: android/app/md-viewer-release.keystore
✅ USB externa: (copiar manualmente)
✅ Cloud cifrado: Google Drive / Dropbox (en ZIP con contraseña)
```

**Comando para crear backup cifrado:**
```bash
# Windows
7z a -p -mhe=on keystore-backup.7z android/app/md-viewer-release.keystore

# Contraseña: mdviewer2024
```

---

## 🆚 APK vs AAB

| Feature | APK | AAB (Bundle) |
|---------|-----|--------------|
| **Uso** | Instalación directa | Solo Play Store |
| **Tamaño** | 2.9 MB | ~2.0 MB |
| **Optimizado** | No | Sí (per-device) |
| **Play Store** | ❌ Deprecated 2021 | ✅ Requerido |

**Recomendación:** APK para testing, AAB para publicar.

---

## 🔄 Actualizar versión

Antes de compilar nueva versión:

```gradle
// android/app/build.gradle
defaultConfig {
    versionCode 3        // Incrementar en 1
    versionName "2.0.1"  // Nueva versión
}
```

Luego compilar:
```bash
cd android && ./gradlew.bat assembleRelease
```

---

## 🐛 Troubleshooting

### "Failed to load signer"
- Verifica que `md-viewer-release.keystore` exista
- Verifica passwords en `build.gradle`

### "Certificate chain not validated"
- Normal para self-signed
- No afecta instalación ni Play Store

### "Duplicate zip entry"
```bash
# Limpiar cache
cd android && ./gradlew.bat clean
```

### "Installation failed"
```bash
# Desinstalar completamente
adb uninstall com.mdviewer.app
# O en el móvil: Ajustes → Apps → MD Viewer → Desinstalar
```

---

## 📄 Información del certificado

Ver detalles del keystore:
```bash
keytool -list -v -keystore android/app/md-viewer-release.keystore -storepass mdviewer2024
```

Ver detalles del APK firmado:
```bash
jarsigner -verify -verbose -certs android/app/build/outputs/apk/release/app-release.apk
```

---

## ⚠️ Seguridad

**NO compartir:**
- ❌ Keystore (`md-viewer-release.keystore`)
- ❌ Passwords (`mdviewer2024`)
- ❌ AAB/APK firmados públicamente (si planeas publicar en Play Store)

**SÍ compartir:**
- ✅ APK firmado para testing interno
- ✅ Código fuente (sin keystore)

---

## 📊 Estado actual

- ✅ Keystore generado
- ✅ Gradle configurado
- ✅ APK firmado y compilado
- ✅ Verificado con jarsigner
- ✅ Listo para instalar

**APK actual:**
```
android/app/build/outputs/apk/release/app-release.apk
Version: 2.0.0 (versionCode 2)
Size: 2.9 MB
Signed: ✅ SHA256withRSA
```

---

**Última actualización:** 2026-05-10
