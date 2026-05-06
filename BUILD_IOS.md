# 📱 Compilar MD Viewer para iOS/iPhone

## ⚠️ IMPORTANTE: Requisitos de iOS

### **Para compilar iOS necesitas:**

✅ **macOS** (Catalina 10.15.4 o superior)
✅ **Xcode** (versión 14.0 o superior)
✅ **CocoaPods** (gestor de dependencias de iOS)
✅ **Cuenta de Apple Developer** (para instalar en dispositivo real)

### **NO puedes compilar iOS en Windows**

iOS requiere Xcode, que solo funciona en macOS. Pero tienes opciones:

---

## 🎯 OPCIONES PARA COMPILAR iOS

### **Opción 1: Usar un Mac** (⭐ Recomendado)

Si tienes acceso a una Mac:

1. **Copia el proyecto** a tu Mac
   ```bash
   # En Windows, comprimir el proyecto
   tar -czf md-viewer.tar.gz md-viewer/

   # En Mac, descomprimir
   tar -xzf md-viewer.tar.gz
   cd md-viewer
   ```

2. **Instala las dependencias**
   ```bash
   npm install
   ```

3. **Instala CocoaPods** (si no lo tienes)
   ```bash
   sudo gem install cocoapods
   ```

4. **Abre Xcode**
   ```bash
   npm run ios
   # O manualmente:
   npx cap open ios
   ```

5. **Compila y ejecuta**
   - Conecta tu iPhone vía USB
   - En Xcode: selecciona tu dispositivo
   - Click en ▶️ (Run)
   - Acepta permisos en el iPhone si es la primera vez

---

### **Opción 2: Cloud Build Service** (💰 De pago)

Si no tienes Mac, usa servicios cloud:

#### **A. Ionic Appflow** (Official)
- Precio: ~$29/mes
- Web: https://ionic.io/appflow
- **Pasos:**
  1. Crea cuenta en Appflow
  2. Conecta tu repositorio Git
  3. Configura build para iOS
  4. Descarga el IPA (archivo de instalación)

#### **B. CodeMagic**
- Precio: 500 min/mes gratis, luego ~$95/mes
- Web: https://codemagic.io
- **Pasos:**
  1. Crea cuenta
  2. Conecta repositorio
  3. Configura workflow para Capacitor
  4. Build → Descarga IPA

#### **C. GitHub Actions** (Gratuito con limitaciones)
- Precio: 2000 min/mes gratis (macOS runners)
- **Pasos:**
  1. Sube proyecto a GitHub
  2. Crea workflow `.github/workflows/ios.yml`
  3. Configura certificados de Apple
  4. Build automático en cada push

---

### **Opción 3: Hackintosh** (⚠️ Avanzado)

Instalar macOS en PC no-Apple:

- **Pros:** Gratis, control total
- **Contras:** Complejo, puede ser inestable, legalidad gris
- **Guía:** https://dortania.github.io/OpenCore-Install-Guide/

**No recomendado** para desarrollo profesional.

---

### **Opción 4: Máquina Virtual macOS** (⚠️ Lento)

Ejecutar macOS en VM dentro de Windows:

- **Software:** VMware Workstation + macOS image
- **Pros:** No requiere Mac físico
- **Contras:** Muy lento, requiere hardware potente, legalidad gris
- **Rendimiento:** Compilaciones 5-10x más lentas

**No recomendado** para uso regular.

---

## 🛠️ PROCESO COMPLETO EN macOS

### 1. Preparar el Entorno

```bash
# Verificar que tienes Xcode instalado
xcode-select -p

# Si no está instalado:
# - Descarga Xcode desde App Store (12+ GB)
# - Abre Xcode y acepta licencias

# Instalar Xcode Command Line Tools
xcode-select --install

# Instalar CocoaPods
sudo gem install cocoapods
```

### 2. Configurar el Proyecto

```bash
cd /ruta/a/md-viewer

# Instalar dependencias npm
npm install

# Sincronizar con iOS
npm run build:ios
```

### 3. Instalar Dependencias de iOS

```bash
cd ios/App
pod install
cd ../..
```

### 4. Abrir en Xcode

```bash
npm run ios
# O manualmente:
open ios/App/App.xcworkspace
```

**⚠️ IMPORTANTE:** Abre el archivo `.xcworkspace`, NO el `.xcodeproj`

### 5. Configurar Firma de Código

En Xcode:

1. **Selecciona el proyecto** "App" en el navegador izquierdo
2. **Pestaña "Signing & Capabilities"**
3. **Team:** Selecciona tu Apple ID
   - Si no aparece, añádelo en Xcode → Preferences → Accounts
4. **Bundle Identifier:** Cambia a algo único (ej: `com.tunombre.mdviewer`)

### 6. Compilar para Simulador

1. En la barra superior de Xcode, selecciona **Simulador** (ej: iPhone 15 Pro)
2. Click en ▶️ (Run) o `Cmd + R`
3. Espera a que compile (primera vez ~5 min)
4. La app se abrirá en el simulador

### 7. Compilar para iPhone Real

1. **Conecta tu iPhone** vía USB
2. **Confía en el ordenador** (acepta en el iPhone)
3. En Xcode, selecciona tu **dispositivo** en la barra superior
4. Click en ▶️ (Run)

**Si es la primera vez:**
- En el iPhone: Ajustes → General → VPN y gestión de dispositivos
- Confía en tu certificado de desarrollador

---

## 📦 GENERAR IPA (App Store o Ad-Hoc)

### Para TestFlight (Beta Testing)

1. En Xcode: **Product → Archive**
2. Espera a que compile (~10 min)
3. Click en **Distribute App**
4. Selecciona **App Store Connect**
5. Sigue el wizard (firma automática)
6. Sube a App Store Connect
7. En App Store Connect → TestFlight
8. Añade testers externos/internos

### Para Distribución Ad-Hoc (Sin App Store)

1. En Xcode: **Product → Archive**
2. **Distribute App**
3. Selecciona **Ad Hoc**
4. Exporta el IPA
5. Instala con **Apple Configurator** o **Xcode Devices**

---

## 🔧 TROUBLESHOOTING

### Error: "No connected devices"
**Solución:**
- Conecta iPhone vía USB
- Confía en el ordenador (popup en iPhone)
- En Xcode: Window → Devices and Simulators → Verifica que aparece

### Error: "Failed to code sign"
**Solución:**
- Xcode → Preferences → Accounts → Añade Apple ID
- Proyecto → Signing & Capabilities → Selecciona Team
- Cambia Bundle Identifier a algo único

### Error: "pod install failed"
**Solución:**
```bash
cd ios/App
pod repo update
pod install
```

### Error: "Xcode license not accepted"
**Solución:**
```bash
sudo xcodebuild -license accept
```

### Error: "Provisioning profile doesn't match"
**Solución:**
- Proyecto → Signing & Capabilities
- Desmarca "Automatically manage signing"
- Vuelve a marcar
- Xcode regenerará el perfil

---

## 🔄 WORKFLOW DE DESARROLLO

### Durante Desarrollo

```bash
# En Mac
cd md-viewer

# 1. Haz cambios en public/
# 2. Sincroniza con iOS
npm run build:ios

# 3. Abre Xcode (si no está abierto)
npm run ios

# 4. En Xcode, click Run (Cmd+R)
```

### Solo Sincronizar (Sin abrir Xcode)

```bash
npx cap sync ios
```

### Ver Logs en Tiempo Real

En Xcode:
- **View → Debug Area → Activate Console** (Cmd+Shift+Y)
- Verás `console.log()` de JavaScript

---

## 📊 COMPARACIÓN DE OPCIONES

| Opción | Costo | Dificultad | Velocidad | Recomendado |
|--------|-------|------------|-----------|-------------|
| Mac propio | 0€ | Baja | Rápida | ⭐⭐⭐⭐⭐ |
| Mac prestado | 0€ | Baja | Rápida | ⭐⭐⭐⭐ |
| Cloud Build | ~30€/mes | Media | Media | ⭐⭐⭐ |
| GitHub Actions | 0€ | Alta | Media | ⭐⭐ |
| Hackintosh | 0€ | Muy Alta | Media | ⭐ |
| VM macOS | 0€ | Alta | Muy Lenta | ⭐ |

---

## 🚀 ALTERNATIVA: Progressive Web App (PWA)

Si no puedes compilar iOS nativo, considera hacer una PWA:

**Ventajas:**
- ✅ Funciona en iOS Safari
- ✅ Se puede "instalar" en home screen
- ✅ No requiere App Store
- ✅ Actualizaciones instantáneas

**Limitaciones:**
- ❌ Menos permisos de sistema
- ❌ No acceso total a Filesystem
- ❌ No puede estar en App Store

**Implementación:**
1. Añade `manifest.json`
2. Añade Service Worker
3. Usuario: Safari → Compartir → Añadir a pantalla de inicio

---

## 📄 ARCHIVOS GENERADOS

Después de `npx cap add ios`:

```
ios/
├── App/
│   ├── App.xcodeproj
│   ├── App.xcworkspace  ← ABRE ESTE
│   ├── App/
│   │   ├── public/      ← Tu código web
│   │   ├── AppDelegate.swift
│   │   ├── capacitor.config.json
│   │   └── Info.plist
│   ├── Podfile
│   └── Pods/
└── ...
```

---

## ✅ CHECKLIST ANTES DE COMPILAR

- [ ] Tengo acceso a un Mac
- [ ] Xcode instalado (14.0+)
- [ ] CocoaPods instalado
- [ ] Apple ID añadido en Xcode
- [ ] Proyecto sincronizado (`npm run build:ios`)
- [ ] Dependencias de iOS instaladas (`pod install`)
- [ ] Bundle Identifier único configurado
- [ ] Team seleccionado en Signing & Capabilities

---

## 🎯 RESULTADO FINAL

Una vez compilado, tendrás:

- ✅ App funcionando en **Simulador iOS**
- ✅ App instalada en tu **iPhone**
- ✅ IPA para distribuir vía **TestFlight**
- ✅ Posibilidad de publicar en **App Store**

---

## 📞 AYUDA ADICIONAL

- **Documentación Capacitor iOS:** https://capacitorjs.com/docs/ios
- **Guía Apple Developer:** https://developer.apple.com/ios/
- **Stack Overflow:** https://stackoverflow.com/questions/tagged/capacitor

---

**Última actualización:** 2026-05-05

**Autor:** Ruben - Barcelona
