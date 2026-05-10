# Code Signing - MD Viewer

## ¿Por qué firmar el código?

Cuando distribuyes un `.exe` sin firma, Windows muestra:
- ⚠️ "Windows protegió tu PC" (SmartScreen)
- ⚠️ "Editor desconocido"

Con un certificado de firma:
- ✅ Muestra tu nombre/empresa
- ✅ No hay warnings de SmartScreen (después de reputación)
- ✅ Los usuarios confían más en la app

---

## Cómo obtener un certificado

### Opción 1: Certificado EV (Extended Validation) - Recomendado
- **Costo:** ~300-400€/año
- **Ventaja:** NO hay SmartScreen warning desde el primer día
- **Proveedores:** Sectigo, DigiCert, GlobalSign
- **Requiere:** Validación de identidad (DNI/CIF, llamada telefónica)

### Opción 2: Certificado estándar (OV/IV)
- **Costo:** ~80-150€/año
- **Ventaja:** Más barato
- **Desventaja:** SmartScreen warning hasta conseguir reputación (100-1000 instalaciones)
- **Proveedores:** Sectigo, Comodo, SSL.com

---

## Configuración

### 1. Comprar certificado

1. Compra en un proveedor (ej: Sectigo)
2. Sigue proceso de validación
3. Descarga certificado en formato `.pfx` o `.p12`
4. Guarda contraseña del certificado

### 2. Configurar variables de entorno

**Windows:**
```cmd
set CSC_LINK=C:\path\to\certificate.pfx
set CSC_KEY_PASSWORD=tu_contraseña_aquí
```

**O crear archivo `.env` en raíz del proyecto:**
```
CSC_LINK=C:/Users/cra/Proyectos/md-viewer/cert/certificate.pfx
CSC_KEY_PASSWORD=TuContraseñaSegura123
```

⚠️ **IMPORTANTE:** Añade `.env` a `.gitignore` para no subir tu contraseña

### 3. Actualizar package.json

Ya está configurado, solo descomenta estas líneas en `package.json`:

```json
"win": {
  "target": "nsis",
  "icon": "build/icon.svg",
  "publisherName": "MD Viewer",
  "certificateFile": "cert/certificate.pfx",        // ← Descomentar
  "certificatePassword": "process.env.CSC_KEY_PASSWORD"  // ← Descomentar
}
```

### 4. Compilar

```bash
npm run build:electron
```

Electron-builder automáticamente firmará todos los `.exe` si detecta `CSC_LINK`.

---

## Verificar firma

### Método 1: Properties de Windows
1. Click derecho en `.exe` → Properties
2. Pestaña "Digital Signatures"
3. Debe aparecer tu nombre/empresa

### Método 2: Signtool (línea de comandos)
```cmd
signtool verify /pa "dist/MD Viewer Setup 2.0.0.exe"
```

---

## Alternativas gratuitas (NO recomendadas para producción)

### Self-signed certificate
- **Costo:** Gratis
- **Desventaja:** Windows SIGUE mostrando warning "Editor desconocido"
- **Uso:** Solo para testing interno

```bash
# Crear certificado self-signed (PowerShell como Admin)
New-SelfSignedCertificate -Type CodeSigningCert -Subject "CN=MD Viewer" -CertStoreLocation Cert:\CurrentUser\My
```

---

## Timestamping

Cuando firmas código, incluye un timestamp para que la firma siga válida aunque el certificado expire.

Electron-builder lo hace automáticamente, pero si usas `signtool` manualmente:

```cmd
signtool sign /f certificate.pfx /p PASSWORD /t http://timestamp.digicert.com app.exe
```

**Servidores de timestamp:**
- DigiCert: `http://timestamp.digicert.com`
- Sectigo: `http://timestamp.sectigo.com`
- GlobalSign: `http://timestamp.globalsign.com`

---

## Costos estimados

| Tipo | Proveedor | Precio/año | SmartScreen |
|------|-----------|------------|-------------|
| **EV** | Sectigo | ~400€ | Sin warning |
| **EV** | DigiCert | ~500€ | Sin warning |
| **OV** | Sectigo | ~120€ | Warning inicial |
| **OV** | SSL.com | ~80€ | Warning inicial |

---

## ¿Vale la pena?

### SÍ, si:
- Vas a distribuir públicamente
- Quieres parecer profesional
- Tienes presupuesto (~400€/año EV)

### NO, si:
- Solo para uso personal
- Distribución interna/privada
- Presupuesto limitado

**Alternativa temporal:** Publica en Microsoft Store (gratis después de $19 registro), automáticamente firmado por Microsoft.

---

## Estado actual

⚠️ **MD Viewer actualmente NO está firmado**

Para obtener certificado en el futuro:
1. Espera a tener ~500-1000 usuarios/descargas
2. Calcula ROI (¿vale la pena 400€/año?)
3. Compra certificado EV si decides invertir
4. Sigue pasos de este documento

---

**Última actualización:** 2026-05-10
