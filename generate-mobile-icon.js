const sharp = require('sharp');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🎨 Generando icono para móvil...\n');

// Create resources directory if it doesn't exist
const resourcesDir = path.join(__dirname, 'resources');
if (!fs.existsSync(resourcesDir)) {
  fs.mkdirSync(resourcesDir, { recursive: true });
}

// Read SVG and convert to 1024x1024 PNG
const svgPath = path.join(__dirname, 'resources', 'icon.png.svg');
const pngPath = path.join(__dirname, 'resources', 'icon.png');

sharp(svgPath)
  .resize(1024, 1024)
  .png()
  .toFile(pngPath)
  .then(() => {
    console.log('✅ Icon.png generado (1024x1024)');
    console.log('📦 Generando iconos para Android/iOS...\n');

    // Run capacitor-assets to generate all icon sizes
    try {
      execSync('npx @capacitor/assets generate --iconBackgroundColor "#0f0f13" --iconBackgroundColorDark "#0f0f13" --android', {
        cwd: __dirname,
        stdio: 'inherit'
      });

      console.log('\n✅ Iconos de Android generados correctamente');
      console.log('📝 Ahora compila el APK: cd android && .\\gradlew.bat assembleRelease');
    } catch (error) {
      console.error('❌ Error al generar iconos:', error.message);
    }
  })
  .catch(err => {
    console.error('❌ Error al convertir SVG a PNG:', err.message);
  });
