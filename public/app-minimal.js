// MD Viewer Mobile - MINIMAL VERSION (Sin features nuevas)
// Solo funcionalidad básica: importar, renderizar, tabs

import { initializePlugins, loadFileIndex, saveFileIndex } from './modules/storage.js';
import { toggleSidebar, showEmpty } from './modules/ui.js';
import { renderTree } from './modules/render-minimal.js';
import { openFile, toggleRaw, removeFile, getCurrentFile, clearCurrentFile } from './modules/fileOperations.js';
import { toggleFolder, removeFolder } from './modules/folderOperations.js';
import { initSearch } from './modules/search.js';
import { importFiles, initializeFilePicker } from './modules/import.js';
import { addTab, closeTab, closeTabByPath, switchToTab, switchToNextTab, closeAllTabs, renderTabs } from './modules/tabs.js';

// ── Global State ──────────────────────────────────────
let pluginsReady = false;

// ── Initialization ────────────────────────────────────
async function init() {
  try {
    console.log('[INFO] Iniciando MD Viewer (MINIMAL)...');

    // Initialize Capacitor plugins
    if (window.Capacitor) {
      console.log('[DEBUG] Capacitor detected');

      const { Filesystem, Preferences, FilePicker } = window.Capacitor.Plugins;

      if (!Filesystem || !Preferences || !FilePicker) {
        throw new Error('Plugins no disponibles');
      }

      initializePlugins({ Filesystem, Preferences });
      initializeFilePicker(FilePicker);

      console.log('[DEBUG] ✓ Plugins cargados');
      pluginsReady = true;
    } else {
      console.warn('[WARN] Capacitor no detectado');
    }

    // Load saved files
    await loadFileIndex();
    console.log('[DEBUG] ✓ FileIndex cargado');

    // Render tree
    await renderTree();
    console.log('[DEBUG] ✓ Tree renderizado');

    // Initialize search
    initSearch();
    console.log('[DEBUG] ✓ Search inicializado');

    // Initialize tabs
    renderTabs();
    console.log('[DEBUG] ✓ Tabs renderizados');

    console.log('[INFO] ✓ App iniciada correctamente (MINIMAL)');

  } catch (error) {
    console.error('[ERROR] Error fatal:', error);
    alert('Error al inicializar: ' + error.message);
  }
}

// ── Expose Global Functions ───────────────────────────
window.toggleSidebar = toggleSidebar;
window.showEmpty = showEmpty;
window.importFiles = importFiles;
window.openFile = openFile;
window.toggleRaw = toggleRaw;
window.removeFile = removeFile;
window.toggleFolder = toggleFolder;
window.removeFolder = removeFolder;
window.getCurrentFile = getCurrentFile;
window.clearCurrentFile = clearCurrentFile;

// Tab management
window.addTab = addTab;
window.closeTab = closeTab;
window.closeTabByPath = closeTabByPath;
window.switchToTab = switchToTab;
window.switchToNextTab = switchToNextTab;
window.closeAllTabs = closeAllTabs;

// ── Start App ─────────────────────────────────────────
document.addEventListener('DOMContentLoaded', init);
