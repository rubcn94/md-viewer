// MD Viewer Mobile - Main App Orchestrator

import { initializePlugins, loadFileIndex, saveFileIndex, getPlatform } from './modules/storage.js';
import { toggleSidebar, showEmpty, showToast } from './modules/ui.js';
import { renderTree, toggleFavoritesFilter } from './modules/render.js';
import { openFile, toggleRaw, removeFile, getCurrentFile, clearCurrentFile } from './modules/fileOperations.js';
import { toggleFolder, removeFolder } from './modules/folderOperations.js';
import { initSearch } from './modules/search.js';
import { importFiles, initializeFilePicker, importFolder, importFromDragDrop } from './modules/import.js';
import { addTab, closeTab, closeTabByPath, switchToTab, switchToNextTab, closeAllTabs, renderTabs } from './modules/tabs.js';
import {
  toggleReadStatus,
  saveBookmark,
  goToBookmark,
  clearBookmark,
  clearAllHighlights,
  removeHighlight,
  restoreHighlights,
  toggleStarred,
  initHighlightSystem
} from './modules/readingProgress.js';
import { initLongPress } from './modules/longPress.js';

// ── Global State ──────────────────────────────────────
let pluginsReady = false;

// ── Drag & Drop Setup (Desktop only) ──────────────────
function initDragDrop() {
  const dropOverlay = document.createElement('div');
  dropOverlay.className = 'drop-overlay';
  dropOverlay.innerHTML = `
    <div class="drop-overlay-content">
      <div class="drop-icon">📁</div>
      <div class="drop-text">Suelta archivos o carpetas aquí</div>
      <div class="drop-hint">Se importarán solo archivos .md, .txt y .zip</div>
    </div>
  `;
  document.body.appendChild(dropOverlay);

  let dragCounter = 0;

  // Prevenir comportamiento por defecto en TODO el document
  document.addEventListener('dragenter', (e) => {
    e.preventDefault();
    e.stopPropagation();

    dragCounter++;
    if (e.dataTransfer && e.dataTransfer.types.includes('Files')) {
      dropOverlay.classList.add('active');
    }
  }, true); // useCapture = true para capturar antes que elementos hijos

  document.addEventListener('dragover', (e) => {
    e.preventDefault();
    e.stopPropagation();

    // IMPORTANTE: siempre setear dropEffect en dragover
    if (e.dataTransfer && e.dataTransfer.types.includes('Files')) {
      e.dataTransfer.dropEffect = 'copy';
    }
  }, true);

  document.addEventListener('dragleave', (e) => {
    e.preventDefault();
    e.stopPropagation();

    dragCounter--;
    if (dragCounter === 0) {
      dropOverlay.classList.remove('active');
    }
  }, true);

  document.addEventListener('drop', async (e) => {
    e.preventDefault();
    e.stopPropagation();

    dragCounter = 0;
    dropOverlay.classList.remove('active');

    if (e.dataTransfer && e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      // Usar DataTransferItemList para soportar carpetas
      const items = Array.from(e.dataTransfer.items);
      await importFromDragDrop(items);
    } else if (e.dataTransfer && e.dataTransfer.files.length > 0) {
      // Fallback para navegadores que no soportan DataTransferItem
      const files = Array.from(e.dataTransfer.files);

      // Convertir Files a formato compatible
      const items = files.map(file => ({
        kind: 'file',
        getAsFile: () => file,
        webkitGetAsEntry: () => ({
          isFile: true,
          isDirectory: false,
          name: file.name,
          file: (callback) => callback(file)
        })
      }));

      await importFromDragDrop(items);
    }
  }, true);
}

// ── Initialization ────────────────────────────────────
async function init() {
  try {
    // console.log('[INFO] Iniciando MD Viewer...');

    // Detectar plataforma: Electron o Capacitor
    if (window.electronAPI) {
      // Electron Desktop
      // console.log('[DEBUG] Electron detected');
      initializePlugins({}); // Pasamos objeto vacío, Electron usa window.electronAPI
      initializeFilePicker(null); // No necesitamos FilePicker en Electron
      pluginsReady = true;
      // console.log('[DEBUG] Electron API ready');
    } else if (window.Capacitor) {
      // Capacitor Mobile
      // console.log('[DEBUG] Capacitor detected');

      await new Promise(resolve => {
        if (window.Capacitor.Plugins) {
          resolve();
        } else {
          document.addEventListener('deviceready', resolve);
        }
      });

      const { Filesystem, Preferences, FilePicker } = window.Capacitor.Plugins;

      if (!Filesystem || !Preferences || !FilePicker) {
        throw new Error('Plugins no disponibles: ' + JSON.stringify({
          Filesystem: !!Filesystem,
          Preferences: !!Preferences,
          FilePicker: !!FilePicker
        }));
      }

      initializePlugins({ Filesystem, Preferences });
      initializeFilePicker(FilePicker);

      // console.log('[DEBUG] Plugins cargados:', {
      //   Filesystem: !!Filesystem,
      //   Preferences: !!Preferences,
      //   FilePicker: !!FilePicker,
      // });

      pluginsReady = true;
    } else {
      console.warn('[WARN] No platform detected (web mode)');
    }

    // Load saved files
    // console.log('[DEBUG] Loading file index...');
    await loadFileIndex();

    // console.log('[DEBUG] Rendering tree...');
    await renderTree();

    // Initialize search
    // console.log('[DEBUG] Initializing search...');
    initSearch();

    // Initialize tabs
    // console.log('[DEBUG] Rendering tabs...');
    renderTabs();

    // Initialize long-press gestures
    // console.log('[DEBUG] Initializing long-press...');
    initLongPress();

    // Initialize drag & drop (desktop only)
    if (getPlatform() === 'electron') {
      // console.log('[DEBUG] Initializing drag & drop...');
      initDragDrop();
    }

    // console.log('[INFO] ✓ MD Viewer Mobile iniciado correctamente');
  } catch (error) {
    console.error('[ERROR] Error fatal al inicializar:', error);

    // Show error on screen
    const contentArea = document.getElementById('contentArea');
    if (contentArea) {
      contentArea.innerHTML = `
        <div style="padding: 20px; color: #f00; font-family: monospace;">
          <h2>❌ Error de Inicialización</h2>
          <p><strong>Error:</strong> ${error.message}</p>
          <pre style="background: #111; padding: 10px; overflow-x: auto;">${error.stack}</pre>
          <p>Abre debug.html para más información</p>
        </div>
      `;
    }

    throw error;
  }
}

// ── Expose Global Functions ───────────────────────────
// These functions are called from onclick handlers in HTML
window.toggleSidebar = toggleSidebar;
window.showEmpty = showEmpty;
window.importFiles = importFiles;
window.importFolder = importFolder;
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

// Reading progress
window.toggleReadStatus = toggleReadStatus;
window.saveBookmark = saveBookmark;
window.goToBookmark = goToBookmark;
window.clearBookmark = clearBookmark;
window.clearAllHighlights = clearAllHighlights;
window.removeHighlight = removeHighlight;
window.toggleStarred = toggleStarred;
window.toggleFavoritesFilter = toggleFavoritesFilter;
window.restoreHighlights = restoreHighlights;
window.initHighlightSystem = initHighlightSystem;

// ── Start App ─────────────────────────────────────────
document.addEventListener('DOMContentLoaded', init);
