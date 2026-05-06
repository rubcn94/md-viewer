// MD Viewer Mobile - Main App Orchestrator

import { initializePlugins, loadFileIndex, saveFileIndex } from './modules/storage.js';
import { toggleSidebar, showEmpty } from './modules/ui.js';
import { renderTree } from './modules/render.js';
import { openFile, toggleRaw, removeFile, getCurrentFile, clearCurrentFile } from './modules/fileOperations.js';
import { toggleFolder, removeFolder } from './modules/folderOperations.js';
import { initSearch } from './modules/search.js';
import { importFiles, initializeFilePicker } from './modules/import.js';
import { addTab, closeTab, closeTabByPath, switchToTab, switchToNextTab, closeAllTabs, renderTabs } from './modules/tabs.js';

// ── Global State ──────────────────────────────────────
let pluginsReady = false;

// ── Initialization ────────────────────────────────────
async function init() {
  // Initialize Capacitor plugins
  if (window.Capacitor) {
    await new Promise(resolve => {
      if (window.Capacitor.Plugins) {
        resolve();
      } else {
        document.addEventListener('deviceready', resolve);
      }
    });

    const { Filesystem, Preferences, FilePicker } = window.Capacitor.Plugins;
    initializePlugins({ Filesystem, Preferences });
    initializeFilePicker(FilePicker);

    console.log('[DEBUG] Plugins cargados:', {
      Filesystem: !!Filesystem,
      Preferences: !!Preferences,
      FilePicker: !!FilePicker,
    });

    pluginsReady = true;
  }

  // Load saved files
  await loadFileIndex();
  await renderTree();

  // Initialize search
  initSearch();

  // Initialize tabs
  renderTabs();

  console.log('[INFO] MD Viewer Mobile iniciado correctamente');
}

// ── Expose Global Functions ───────────────────────────
// These functions are called from onclick handlers in HTML
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
