const express = require('express');
const { marked } = require('marked');
const hljs = require('highlight.js');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 3000;
const CONFIG_FILE = path.join(__dirname, 'config.json');

// Configurar marked con syntax highlighting
marked.setOptions({
  highlight: function(code, lang) {
    if (lang && hljs.getLanguage(lang)) {
      return hljs.highlight(code, { language: lang }).value;
    }
    return hljs.highlightAuto(code).value;
  },
  breaks: true,
  gfm: true
});

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname + '/public'));

// --- Config persistence ---
function loadConfig() {
  if (!fs.existsSync(CONFIG_FILE)) {
    return { folders: [], pinnedFiles: [] };
  }
  try {
    return JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
  } catch {
    return { folders: [], pinnedFiles: [] };
  }
}

function saveConfig(config) {
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
}

// --- API: obtener árbol de archivos ---
function scanFolder(folderPath) {
  const result = { name: path.basename(folderPath), path: folderPath, type: 'folder', children: [] };
  
  if (!fs.existsSync(folderPath)) return null;
  
  const items = fs.readdirSync(folderPath, { withFileTypes: true });
  
  for (const item of items) {
    if (item.name.startsWith('.')) continue;
    const itemPath = path.join(folderPath, item.name);
    
    if (item.isDirectory()) {
      const sub = scanFolder(itemPath);
      if (sub) result.children.push(sub);
    } else if (item.name.endsWith('.md') || item.name.endsWith('.markdown')) {
      result.children.push({
        name: item.name,
        path: itemPath,
        type: 'file',
        size: fs.statSync(itemPath).size,
        modified: fs.statSync(itemPath).mtime
      });
    }
  }
  
  // Ordenar: carpetas primero, luego archivos
  result.children.sort((a, b) => {
    if (a.type !== b.type) return a.type === 'folder' ? -1 : 1;
    return a.name.localeCompare(b.name);
  });
  
  return result;
}

// GET /api/tree — árbol completo de todas las carpetas configuradas
app.get('/api/tree', (req, res) => {
  const config = loadConfig();
  const tree = config.folders.map(f => scanFolder(f)).filter(Boolean);
  res.json({ folders: tree, config });
});

// POST /api/folders — añadir carpeta
app.post('/api/folders', (req, res) => {
  const { folderPath } = req.body;
  if (!folderPath) return res.status(400).json({ error: 'folderPath requerido' });
  
  const absPath = path.resolve(folderPath);
  if (!fs.existsSync(absPath)) return res.status(404).json({ error: `Carpeta no encontrada: ${absPath}` });
  if (!fs.statSync(absPath).isDirectory()) return res.status(400).json({ error: 'La ruta no es una carpeta' });
  
  const config = loadConfig();
  if (!config.folders.includes(absPath)) {
    config.folders.push(absPath);
    saveConfig(config);
  }
  
  res.json({ success: true, path: absPath, tree: scanFolder(absPath) });
});

// DELETE /api/folders — eliminar carpeta de la config
app.delete('/api/folders', (req, res) => {
  const { folderPath } = req.body;
  const config = loadConfig();
  config.folders = config.folders.filter(f => f !== folderPath);
  saveConfig(config);
  res.json({ success: true });
});

// GET /api/render?file=<ruta> — renderizar MD a HTML
app.get('/api/render', (req, res) => {
  const filePath = req.query.file;
  if (!filePath) return res.status(400).json({ error: 'file requerido' });
  
  // Seguridad: solo archivos dentro de carpetas configuradas
  const config = loadConfig();
  const allowed = config.folders.some(f => filePath.startsWith(f));
  if (!allowed) return res.status(403).json({ error: 'Acceso no permitido' });
  
  if (!fs.existsSync(filePath)) return res.status(404).json({ error: 'Archivo no encontrado' });
  
  const raw = fs.readFileSync(filePath, 'utf8');
  const html = marked(raw);
  const stats = fs.statSync(filePath);
  
  res.json({
    html,
    raw,
    name: path.basename(filePath),
    path: filePath,
    size: stats.size,
    modified: stats.mtime,
    wordCount: raw.split(/\s+/).length
  });
});

// GET /api/search?q=<query> — buscar en todos los MD
app.get('/api/search', (req, res) => {
  const q = (req.query.q || '').toLowerCase().trim();
  if (!q) return res.json({ results: [] });
  
  const config = loadConfig();
  const results = [];
  
  function searchInFolder(folderPath) {
    if (!fs.existsSync(folderPath)) return;
    const items = fs.readdirSync(folderPath, { withFileTypes: true });
    for (const item of items) {
      if (item.name.startsWith('.')) continue;
      const itemPath = path.join(folderPath, item.name);
      if (item.isDirectory()) {
        searchInFolder(itemPath);
      } else if (item.name.endsWith('.md') || item.name.endsWith('.markdown')) {
        const content = fs.readFileSync(itemPath, 'utf8');
        if (content.toLowerCase().includes(q) || item.name.toLowerCase().includes(q)) {
          // Extraer contexto
          const idx = content.toLowerCase().indexOf(q);
          const start = Math.max(0, idx - 80);
          const end = Math.min(content.length, idx + 120);
          const snippet = content.substring(start, end).replace(/\n/g, ' ');
          results.push({
            file: itemPath,
            name: item.name,
            snippet: (start > 0 ? '…' : '') + snippet + (end < content.length ? '…' : ''),
            matchIndex: idx
          });
        }
      }
    }
  }
  
  config.folders.forEach(searchInFolder);
  res.json({ results: results.slice(0, 50), query: q });
});

app.listen(PORT, () => {
  console.log(`\n🚀 MD Viewer corriendo en http://localhost:${PORT}\n`);
  console.log('Uso:');
  console.log('  Abre el navegador en http://localhost:3000');
  console.log('  Añade carpetas desde la interfaz o via API:\n');
  console.log('  POST /api/folders  { "folderPath": "/ruta/a/tu/carpeta" }\n');
});
