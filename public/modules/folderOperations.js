// ── Folder Operations ──────────────────────────────────

import { getFilesystem, removeFilesMatching, saveFileIndex, getPlatform } from './storage.js';
import { renderTree } from './render.js';
import { showToast, showEmpty } from './ui.js';
import { APP_DIR } from './storage.js';

export function toggleFolder(headerEl) {
  const folderItem = headerEl.closest('.folder-item');
  folderItem.classList.toggle('open');
}

export async function removeFolder(folderName) {
  if (!confirm(`¿Eliminar carpeta "${folderName}" y todos sus archivos?`)) return;

  const removed = removeFilesMatching(f => f.path.startsWith(folderName + '/'));
  const platform = getPlatform();

  try {
    if (platform === 'electron') {
      // Electron: eliminar carpeta recursivamente
      await window.electronAPI.filesystem.deleteDir(folderName);
    } else if (platform === 'capacitor') {
      // Capacitor: eliminar archivos uno por uno
      const Filesystem = getFilesystem();
      if (Filesystem) {
        try {
          const { files } = await Filesystem.readdir({
            path: `${APP_DIR}/${folderName}`,
            directory: 'DATA'
          });

          for (const file of files) {
            try {
              await Filesystem.deleteFile({
                path: `${APP_DIR}/${folderName}/${file.name}`,
                directory: 'DATA'
              });
            } catch (e) {
              console.log('Error deleting file:', e.message);
            }
          }
        } catch (e) {
          console.log('Error reading folder:', e.message);
        }
      }
    }
  } catch (e) {
    console.log('Error deleting folder:', e.message);
  }

  await saveFileIndex();
  await renderTree();

  if (window.getCurrentFile && window.getCurrentFile()?.path.startsWith(folderName + '/')) {
    if (window.closeAllTabs) {
      window.closeAllTabs();
    }
    showEmpty();
  }

  showToast(`Carpeta eliminada (${removed} archivos)`, 'success');
}
