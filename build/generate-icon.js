// Simple icon generator using Canvas API in Node.js
const fs = require('fs');
const path = require('path');

// Create a simple HTML file that generates the icon
const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body>
<canvas id="canvas" width="256" height="256"></canvas>
<script>
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

// Background
ctx.fillStyle = '#0f0f13';
ctx.fillRect(0, 0, 256, 256);

// Border
ctx.strokeStyle = '#5865f2';
ctx.lineWidth = 4;
ctx.strokeRect(8, 8, 240, 240);

// M letter
ctx.fillStyle = '#5865f2';
ctx.font = 'bold 72px Arial';
ctx.textAlign = 'center';
ctx.textBaseline = 'middle';
ctx.fillText('M', 128, 90);

// D letter
ctx.fillStyle = '#7289da';
ctx.fillText('D', 128, 160);

// Document icon
ctx.fillStyle = '#3ba55c';
ctx.globalAlpha = 0.8;
ctx.fillRect(180, 180, 48, 56);
ctx.globalAlpha = 1.0;

ctx.strokeStyle = '#0f0f13';
ctx.lineWidth = 2;
ctx.beginPath();
ctx.moveTo(188, 192);
ctx.lineTo(220, 192);
ctx.stroke();
ctx.beginPath();
ctx.moveTo(188, 204);
ctx.lineTo(220, 204);
ctx.stroke();
ctx.beginPath();
ctx.moveTo(188, 216);
ctx.lineTo(212, 216);
ctx.stroke();

// Export
const dataUrl = canvas.toDataURL('image/png');
console.log(dataUrl);
</script>
</body>
</html>
`;

console.log('Para generar el icono:');
console.log('1. Abre build/icon-generator.html en un navegador');
console.log('2. Abre DevTools (F12)');
console.log('3. Copia el data URL de la consola');
console.log('4. Pega en https://convertio.co/download/ para convertir a PNG');
console.log('O usa el SVG directamente en electron-builder');

fs.writeFileSync(path.join(__dirname, 'icon-generator.html'), html);
console.log('✓ Creado: build/icon-generator.html');
