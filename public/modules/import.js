// ── Import Functions ───────────────────────────────────

import { base64ToUtf8, fixEncoding } from './utils.js';
import { addFile, getFiles, getFilesystem, saveFileIndex } from './storage.js';
import { renderTree } from './render.js';
import { showToast } from './ui.js';
import { APP_DIR } from './storage.js';

let FilePicker;

export function initializeFilePicker(plugin) {
  FilePicker = plugin;
}

export async function importFiles() {
  try {
    if (!FilePicker) {
      showToast('File picker no disponible (modo web)', 'error');
      return;
    }

    showToast('Selecciona uno o varios archivos .md...', '');

    const Filesystem = getFilesystem();
    try {
      await Filesystem.mkdir({
        path: APP_DIR,
        directory: 'DATA',
        recursive: true
      });
    } catch (e) {
      console.log('[DEBUG] Error creando directorio:', e.message);
    }

    // FilePicker permite selección múltiple
    // Si los archivos vienen de carpetas, preservará la estructura en el path
    const result = await FilePicker.pickFiles({
      types: ['text/markdown', 'text/plain', '*/*'],
      multiple: true,
      readData: true
    });

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
        try {
          textContent = fixEncoding(base64ToUtf8(file.data));
        } catch (e) {
          textContent = file.data;
        }

        // Detectar si viene de una carpeta (path puede incluir estructura)
        let fileName = file.name;
        let filePath = file.path || fileName;

        // Normalizar el path y preservar estructura de carpetas
        filePath = filePath.replace(/\\/g, '/'); // Windows paths

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

        // Guardar archivo con estructura de carpetas
        await Filesystem.writeFile({
          path: `${APP_DIR}/${filePath}`,
          data: textContent,
          directory: 'DATA'
        });

        addFile({
          path: filePath,
          name: filePath.split('/').pop(),
          content: textContent
        });

        imported++;
      } catch (e) {
        console.error('[DEBUG] Error importando', file.name, e);
        errors++;
      }
    }

    await saveFileIndex();
    await renderTree();

    let msg = `✓ ${imported} archivo${imported !== 1 ? 's' : ''} importado${imported !== 1 ? 's' : ''}`;
    if (errors > 0) msg += ` (${errors} error${errors !== 1 ? 'es' : ''})`;

    showToast(msg, imported > 0 ? 'success' : 'error');

  } catch (e) {
    console.error('[DEBUG] Error al importar:', e);
    showToast('Error al importar: ' + e.message, 'error');
  }
}

export async function importFolder() {
  // Intentar importar carpeta completa (si el plugin lo soporta)
  try {
    if (!FilePicker) {
      showToast('File picker no disponible', 'error');
      return;
    }

    // Nota: La mayoría de plugins de Capacitor no soportan pickDirectory
    // Esta función queda preparada para cuando esté disponible
    showToast('Función de importar carpeta en desarrollo', 'error');

    // TODO: Implementar cuando @capawesome/capacitor-file-picker soporte directorios
    // o usar un plugin alternativo

  } catch (e) {
    console.error('[DEBUG] Error al importar carpeta:', e);
    showToast('Error al importar carpeta: ' + e.message, 'error');
  }
}
