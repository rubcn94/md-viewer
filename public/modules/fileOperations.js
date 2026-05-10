// ── File Operations ────────────────────────────────────

import { getFile, removeFile as removeFromIndex, getFilesystem, saveFileIndex, getPlatform } from './storage.js';
import { renderMarkdown, renderRaw, renderTree } from './render.js';
import { showToast, showEmpty } from './ui.js';
import { APP_DIR } from './storage.js';

let currentFile = null;
let showingRaw = false;

export function getCurrentFile() {
  return currentFile;
}

export function setCurrentFile(file) {
  currentFile = file;
}

export function clearCurrentFile() {
  currentFile = null;
  showingRaw = false;
}

export function isShowingRaw() {
  return showingRaw;
}

export async function openFile(filePath) {
  const file = getFile(filePath);
  if (!file) return;

  currentFile = file;
  showingRaw = false;

  // Add to tabs
  if (window.addTab) {
    window.addTab(file);
  }

  renderMarkdown(file);
  await renderTree(currentFile);

  if (window.innerWidth <= 640) {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');
    sidebar.classList.remove('open');
    overlay.classList.remove('open');
  }
}

export function toggleRaw() {
  if (!currentFile) return;

  showingRaw = !showingRaw;

  if (showingRaw) {
    renderRaw(currentFile);
  } else {
    renderMarkdown(currentFile);
  }
}

export async function removeFile(filePath) {
  if (!confirm(`¿Eliminar "${filePath}"?`)) return;

  const platform = getPlatform();

  try {
    if (platform === 'electron') {
      await window.electronAPI.filesystem.deleteFile(filePath);
    } else if (platform === 'capacitor') {
      const Filesystem = getFilesystem();
      if (Filesystem) {
        await Filesystem.deleteFile({
          path: `${APP_DIR}/${filePath}`,
          directory: 'DATA'
        });
      }
    }
  } catch (e) {
    console.log('Error deleting file from filesystem:', e.message);
  }

  removeFromIndex(filePath);
  await saveFileIndex();
  await renderTree();

  // Close tab if it's open
  if (window.closeTabByPath) {
    window.closeTabByPath(filePath);
  }

  if (currentFile && currentFile.path === filePath) {
    // Switch to another tab or show empty
    if (window.switchToNextTab) {
      if (!window.switchToNextTab()) {
        showEmpty();
      }
    } else {
      showEmpty();
    }
  }

  showToast('Archivo eliminado', 'success');
}
