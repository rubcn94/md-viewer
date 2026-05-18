// ── Import Functions ───────────────────────────────────

import { base64ToUtf8, fixEncoding, utf8ToBase64, isBase64 } from './utils.js';
import { addFile, getFiles, getFilesystem, saveFileIndex, getPlatform } from './storage.js';
import { renderTree } from './render.js';
import { showToast } from './ui.js';
import { APP_DIR } from './storage.js';

let FilePicker;

export function initializeFilePicker(plugin) {
  FilePicker = plugin;
}

// Helper: crear carpetas padre recursivamente
async function ensureParentFolders(filePath) {
  const platform = getPlatform();
  const pathParts = filePath.split('/');

  if (pathParts.length > 1) {
    // Tiene carpetas, crearlas recursivamente
    for (let i = 1; i < pathParts.length; i++) {
      const folderPath = pathParts.slice(0, i).join('/');
      try {
        if (platform === 'electron') {
          // Electron maneja creación de carpetas automáticamente en writeFile
          // No necesitamos crear carpetas explícitamente
        } else if (platform === 'capacitor') {
          const Filesystem = getFilesystem();
          await Filesystem.mkdir({
            path: `${APP_DIR}/${folderPath}`,
            directory: 'DATA',
            recursive: true
          });
        }
      } catch (e) {
        // Carpeta ya existe o error menor, continuar
        if (!e.message || !e.message.includes('exists')) {
          console.warn('[DEBUG] Error creando carpeta', folderPath, e.message || e);
        }
      }
    }
  }
}

// Helper: procesar archivo ZIP
async function processZipFile(zipData) {
  try {
    const JSZip = window.JSZip;
    if (!JSZip) {
      throw new Error('JSZip no está disponible');
    }

    const platform = getPlatform();
    const zip = await JSZip.loadAsync(zipData);

    let imported = 0;
    let errors = 0;

    // Procesar todos los archivos del ZIP
    for (const [filePath, zipEntry] of Object.entries(zip.files)) {
      try {
        // Ignorar carpetas y archivos que no son .md
        if (zipEntry.dir || !filePath.endsWith('.md')) {
          continue;
        }

        // Leer contenido del archivo
        const textContent = await zipEntry.async('text');

        // Evitar duplicados
        let finalPath = filePath;
        let counter = 1;
        while (getFiles().find(f => f.path === finalPath)) {
          const pathParts = filePath.split('/');
          const fileName = pathParts[pathParts.length - 1];
          const base = fileName.replace(/\.md$/, '');
          pathParts[pathParts.length - 1] = `${base}_${counter}.md`;
          finalPath = pathParts.join('/');
          counter++;
        }

        // Crear carpetas padre
        await ensureParentFolders(finalPath);

        // Guardar archivo
        if (platform === 'electron') {
          await window.electronAPI.filesystem.writeFile(finalPath, textContent);
        } else if (platform === 'capacitor') {
          const Filesystem = getFilesystem();
          await Filesystem.writeFile({
            path: `${APP_DIR}/${finalPath}`,
            data: textContent,
            directory: 'DATA',
            encoding: 'utf8'
          });
        }

        // Añadir a fileIndex
        addFile({
          path: finalPath,
          name: finalPath.split('/').pop(),
          content: textContent
        });

        imported++;
      } catch (e) {
        console.error('[DEBUG] Error procesando archivo del ZIP', filePath, ':', e.message || e);
        errors++;
      }
    }

    return { imported, errors };
  } catch (e) {
    console.error('[DEBUG] Error procesando ZIP:', e.message || e);
    throw e;
  }
}

// ── Web-mode helpers ──────────────────────────────────

// Process an array of native File objects (web / drag-drop)
async function _processNativeFiles(nativeFiles) {
  let imported = 0;
  let errors = 0;

  for (const file of nativeFiles) {
    try {
      if (file.name.toLowerCase().endsWith('.zip')) {
        showToast('Descomprimiendo ZIP...', '');
        const arrayBuffer = await file.arrayBuffer();
        const zipResult = await processZipFile(arrayBuffer);
        imported += zipResult.imported;
        errors += zipResult.errors;
        continue;
      }

      const textContent = await file.text();
      let filePath = file.relativePath || file.name;
      if (!filePath.endsWith('.md') && !filePath.endsWith('.txt')) filePath += '.md';

      let counter = 1;
      const originalPath = filePath;
      while (getFiles().find(f => f.path === filePath)) {
        const parts = originalPath.split('/');
        const last = parts[parts.length - 1];
        const base = last.replace(/\.(md|txt)$/, '');
        parts[parts.length - 1] = `${base}_${counter}.md`;
        filePath = parts.join('/');
        counter++;
      }

      addFile({ path: filePath, name: filePath.split('/').pop(), content: textContent });
      imported++;
    } catch (e) {
      console.error('[DEBUG] Error importando', file.name, ':', e.message || e);
      errors++;
    }
  }

  await saveFileIndex();
  await renderTree();

  let msg = `✓ ${imported} archivo${imported !== 1 ? 's' : ''} importado${imported !== 1 ? 's' : ''}`;
  if (errors > 0) msg += ` (${errors} error${errors !== 1 ? 'es' : ''})`;
  showToast(msg, imported > 0 ? 'success' : 'error');
}

// Helper: pick files natively in a plain browser
function pickFilesWeb() {
  return new Promise((resolve) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = true;
    input.accept = '.md,.txt,.zip';
    input.addEventListener('change', () => resolve(Array.from(input.files)));
    input.addEventListener('cancel', () => resolve([]));
    input.click();
  });
}

export async function importFiles() {
  try {
    const platform = getPlatform();

    if (platform === 'capacitor' && !FilePicker) {
      showToast('File picker no disponible', 'error');
      return;
    } else if (platform === 'electron' && !window.electronAPI) {
      showToast('Electron API no disponible', 'error');
      return;
    }

    // ── Web mode: use native browser file input ───────
    if (platform === 'web') {
      showToast('Selecciona uno o varios archivos .md...', '');
      const nativeFiles = await pickFilesWeb();
      if (nativeFiles.length === 0) {
        showToast('No se seleccionaron archivos', '');
        return;
      }
      await _processNativeFiles(nativeFiles);
      return;
    }

    showToast('Selecciona uno o varios archivos .md...', '');

    // Crear directorio base (solo Capacitor)
    if (platform === 'capacitor') {
      const Filesystem = getFilesystem();
      try {
        await Filesystem.mkdir({
          path: APP_DIR,
          directory: 'DATA',
          recursive: true
        });
      } catch (e) {
        // Directorio ya existe, continuar
      }
    }

    // Seleccionar archivos según plataforma
    let result;
    if (platform === 'electron') {
      result = await window.electronAPI.filePicker.pickFiles();
    } else if (platform === 'capacitor') {
      result = await FilePicker.pickFiles({
        types: ['text/markdown', 'text/plain', '*/*'],
        multiple: true,
        readData: true
      });
    }

    if (!result.files || result.files.length === 0) {
      showToast('No se seleccionaron archivos', '');
      return;
    }

    let imported = 0;
    let errors = 0;

    for (const file of result.files) {
      try {
        if (!file.data) {
          errors++;
          continue;
        }

        // Detectar si es un archivo ZIP
        if (file.name.toLowerCase().endsWith('.zip')) {
          showToast('Descomprimiendo ZIP...', '');

          // Convertir base64 a binary si es necesario
          let zipData;
          if (isBase64(file.data)) {
            const binaryString = atob(file.data);
            const bytes = new Uint8Array(binaryString.length);
            for (let i = 0; i < binaryString.length; i++) {
              bytes[i] = binaryString.charCodeAt(i);
            }
            zipData = bytes;
          } else {
            zipData = file.data;
          }

          const zipResult = await processZipFile(zipData);
          imported += zipResult.imported;
          errors += zipResult.errors;
          continue;
        }

        let textContent;

        // Detectar si file.data es base64 o texto plano
        if (isBase64(file.data)) {
          try {
            textContent = fixEncoding(base64ToUtf8(file.data));
          } catch (e) {
            textContent = file.data;
          }
        } else {
          textContent = file.data;
        }

        // Usar solo el nombre del archivo
        let fileName = file.name;

        // Asegurar extensión .md
        if (!fileName.endsWith('.md')) {
          fileName += '.md';
        }

        let filePath = fileName;

        // Evitar duplicados
        let counter = 1;
        const originalPath = filePath;
        while (getFiles().find(f => f.path === filePath)) {
          const parts = originalPath.split('/');
          const lastPart = parts[parts.length - 1];
          const base = lastPart.replace(/\.md$/, '');
          parts[parts.length - 1] = `${base}_${counter}.md`;
          filePath = parts.join('/');
          counter++;
        }

        // Crear carpetas padre si es necesario
        await ensureParentFolders(filePath);

        // Guardar archivo según plataforma
        if (platform === 'electron') {
          await window.electronAPI.filesystem.writeFile(filePath, textContent);
        } else if (platform === 'capacitor') {
          const Filesystem = getFilesystem();
          await Filesystem.writeFile({
            path: `${APP_DIR}/${filePath}`,
            data: textContent,
            directory: 'DATA',
            encoding: 'utf8'
          });
        }

        addFile({
          path: filePath,
          name: filePath.split('/').pop(),
          content: textContent
        });

        imported++;
      } catch (e) {
        console.error('[DEBUG] Error importando', file.name, ':', e.message || e);
        errors++;
      }
    }

    await saveFileIndex();
    await renderTree();

    let msg = `✓ ${imported} archivo${imported !== 1 ? 's' : ''} importado${imported !== 1 ? 's' : ''}`;
    if (errors > 0) msg += ` (${errors} error${errors !== 1 ? 'es' : ''})`;

    showToast(msg, imported > 0 ? 'success' : 'error');

  } catch (e) {
    console.error('[DEBUG] Error al importar:', e.message || e);
    showToast('Error al importar: ' + (e.message || 'Error desconocido'), 'error');
  }
}

export async function importFolder() {
  try {
    const platform = getPlatform();

    // Verificar disponibilidad según plataforma
    if (platform === 'capacitor' && !FilePicker) {
      showToast('File picker no disponible', 'error');
      return;
    } else if (platform === 'electron' && !window.electronAPI) {
      showToast('Electron API no disponible', 'error');
      return;
    }

    showToast('Selecciona una carpeta...', '');

    // Crear directorio base (solo Capacitor)
    if (platform === 'capacitor') {
      const Filesystem = getFilesystem();
      try {
        await Filesystem.mkdir({
          path: APP_DIR,
          directory: 'DATA',
          recursive: true
        });
      } catch (e) {
        // Directorio ya existe, continuar
      }
    }

    // Seleccionar carpeta según plataforma
    let result;
    if (platform === 'electron') {
      result = await window.electronAPI.filePicker.pickFolder();
    } else if (platform === 'capacitor') {
      // Capacitor no tiene picker de carpetas, usar múltiples archivos
      result = await FilePicker.pickFiles({
        types: ['text/markdown', 'text/plain', '*/*'],
        multiple: true,
        readData: true
      });
    }

    if (!result.files || result.files.length === 0) {
      showToast('No se seleccionaron archivos', '');
      return;
    }

    let imported = 0;
    let errors = 0;

    for (const file of result.files) {
      try {
        if (!file.data) {
          errors++;
          continue;
        }

        let textContent;

        // Detectar si file.data es base64 o texto plano
        if (isBase64(file.data)) {
          try {
            textContent = fixEncoding(base64ToUtf8(file.data));
          } catch (e) {
            textContent = file.data;
          }
        } else {
          textContent = file.data;
        }

        // Usar el path del archivo (preserva estructura de carpetas)
        let filePath = file.path || file.name;

        // Asegurar extensión .md
        if (!filePath.endsWith('.md')) {
          filePath += '.md';
        }

        // Evitar duplicados
        let counter = 1;
        const originalPath = filePath;
        while (getFiles().find(f => f.path === filePath)) {
          const parts = originalPath.split('/');
          const lastPart = parts[parts.length - 1];
          const base = lastPart.replace(/\.md$/, '');
          parts[parts.length - 1] = `${base}_${counter}.md`;
          filePath = parts.join('/');
          counter++;
        }

        // Crear carpetas padre si es necesario
        await ensureParentFolders(filePath);

        // Guardar archivo según plataforma
        if (platform === 'electron') {
          await window.electronAPI.filesystem.writeFile(filePath, textContent);
        } else if (platform === 'capacitor') {
          const Filesystem = getFilesystem();
          await Filesystem.writeFile({
            path: `${APP_DIR}/${filePath}`,
            data: textContent,
            directory: 'DATA',
            encoding: 'utf8'
          });
        }

        addFile({
          path: filePath,
          name: filePath.split('/').pop(),
          content: textContent
        });

        imported++;
      } catch (e) {
        console.error('[DEBUG] Error importando', file.name, ':', e.message || e);
        errors++;
      }
    }

    await saveFileIndex();
    await renderTree();

    let msg = `✓ ${imported} archivo${imported !== 1 ? 's' : ''} importado${imported !== 1 ? 's' : ''}`;
    if (errors > 0) msg += ` (${errors} error${errors !== 1 ? 'es' : ''})`;

    showToast(msg, imported > 0 ? 'success' : 'error');

  } catch (e) {
    console.error('[DEBUG] Error al importar:', e.message || e);
    showToast('Error al importar: ' + (e.message || 'Error desconocido'), 'error');
  }
}

// Helper: leer carpeta recursivamente (FileSystemEntry API)
async function readDirectory(directoryEntry, basePath = '') {
  const files = [];

  return new Promise((resolve) => {
    const reader = directoryEntry.createReader();

    function readEntries() {
      reader.readEntries(async (entries) => {
        if (entries.length === 0) {
          resolve(files);
          return;
        }

        for (const entry of entries) {
          if (entry.isFile) {
            // Solo procesar archivos .md, .txt o .zip
            if (entry.name.endsWith('.md') || entry.name.endsWith('.txt') || entry.name.endsWith('.zip')) {
              const file = await new Promise((resolveFile) => {
                entry.file((f) => {
                  // Añadir path relativo desde la carpeta arrastrada
                  const relativePath = basePath ? `${basePath}/${entry.name}` : entry.name;
                  f.relativePath = relativePath;
                  resolveFile(f);
                }, (e) => {
                  console.error('[DEBUG] Error leyendo archivo', entry.name, ':', e);
                  resolveFile(null);
                });
              });

              if (file) {
                files.push(file);
              }
            }
          } else if (entry.isDirectory) {
            // Recursión: leer subcarpeta
            const subPath = basePath ? `${basePath}/${entry.name}` : entry.name;
            const subFiles = await readDirectory(entry, subPath);
            files.push(...subFiles);
          }
        }

        // Continuar leyendo más entradas (API lee en chunks)
        readEntries();
      }, (e) => {
        console.error('[DEBUG] Error leyendo directorio:', e);
        resolve(files);
      });
    }

    readEntries();
  });
}

// ── Drag & Drop Import (Desktop only) ─────────────────
export async function importFromDragDrop(dataTransferItems) {
  try {
    const platform = getPlatform();

    if (platform !== 'electron' && platform !== 'web') {
      showToast('Drag & drop no disponible en esta plataforma', 'error');
      return;
    }

    if (platform === 'electron' && !window.electronAPI) {
      showToast('Electron API no disponible', 'error');
      return;
    }

    if (!dataTransferItems || dataTransferItems.length === 0) {
      showToast('No se encontraron archivos', 'error');
      return;
    }

    showToast('Procesando archivos y carpetas...', '');

    // Procesar DataTransferItems para obtener archivos y carpetas
    const allFiles = [];

    for (const item of dataTransferItems) {
      if (item.kind === 'file') {
        const entry = item.webkitGetAsEntry();

        if (entry.isFile) {
          // Es un archivo individual
          const file = item.getAsFile();
          if (file && (file.name.endsWith('.md') || file.name.endsWith('.txt') || file.name.endsWith('.zip'))) {
            file.relativePath = file.name;
            allFiles.push(file);
          }
        } else if (entry.isDirectory) {
          // Es una carpeta, leer recursivamente
          const folderFiles = await readDirectory(entry);
          allFiles.push(...folderFiles);
        }
      }
    }

    if (allFiles.length === 0) {
      showToast('No se encontraron archivos .md, .txt o .zip', 'error');
      return;
    }

    showToast(`Importando ${allFiles.length} archivo${allFiles.length !== 1 ? 's' : ''}...`, '');

    let imported = 0;
    let errors = 0;

    for (const nativeFile of allFiles) {
      try {
        // Verificar si es .zip
        if (nativeFile.name.toLowerCase().endsWith('.zip')) {
          showToast('Descomprimiendo ZIP...', '');

          // Leer archivo como ArrayBuffer
          const arrayBuffer = await nativeFile.arrayBuffer();
          const zipResult = await processZipFile(arrayBuffer);
          imported += zipResult.imported;
          errors += zipResult.errors;
          continue;
        }

        // Leer contenido del archivo como texto
        const textContent = await nativeFile.text();

        // Usar el path relativo si existe, sino solo el nombre
        let filePath = nativeFile.relativePath || nativeFile.name;

        // Asegurar extensión .md
        if (!filePath.endsWith('.md') && !filePath.endsWith('.txt')) {
          filePath += '.md';
        }

        // Evitar duplicados
        let counter = 1;
        const originalPath = filePath;
        while (getFiles().find(f => f.path === filePath)) {
          const parts = originalPath.split('/');
          const lastPart = parts[parts.length - 1];
          const base = lastPart.replace(/\.(md|txt)$/, '');
          parts[parts.length - 1] = `${base}_${counter}.md`;
          filePath = parts.join('/');
          counter++;
        }

        await ensureParentFolders(filePath);

        if (platform === 'electron') {
          await window.electronAPI.filesystem.writeFile(filePath, textContent);
        }

        addFile({ path: filePath, name: filePath.split('/').pop(), content: textContent });

        imported++;
      } catch (e) {
        console.error('[DEBUG] Error importando (drag & drop)', nativeFile.name, ':', e.message || e);
        errors++;
      }
    }

    await saveFileIndex();
    await renderTree();

    let msg = `✓ ${imported} archivo${imported !== 1 ? 's' : ''} importado${imported !== 1 ? 's' : ''}`;
    if (errors > 0) msg += ` (${errors} error${errors !== 1 ? 'es' : ''})`;

    showToast(msg, imported > 0 ? 'success' : 'error');

  } catch (e) {
    console.error('[DEBUG] Error al importar (drag & drop):', e.message || e);
    showToast('Error al importar: ' + (e.message || 'Error desconocido'), 'error');
  }
}
