const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const { autoUpdater } = require('electron-updater');
const path = require('path');
const fs = require('fs').promises;
const fsSync = require('fs');

// Ruta de datos del usuario
const USER_DATA_PATH = app.getPath('userData');
const MD_VIEWER_DIR = path.join(USER_DATA_PATH, 'md-viewer-docs');

// Asegurar que el directorio de datos existe
if (!fsSync.existsSync(MD_VIEWER_DIR)) {
  fsSync.mkdirSync(MD_VIEWER_DIR, { recursive: true });
}

let mainWindow;

// ========================================
// Auto-Updater Configuration
// ========================================
autoUpdater.autoDownload = false; // No descargar automáticamente
autoUpdater.autoInstallOnAppQuit = true; // Instalar al cerrar

autoUpdater.on('update-available', (info) => {
  console.log('[AutoUpdater] Update available:', info.version);
  dialog.showMessageBox(mainWindow, {
    type: 'info',
    title: 'Actualización disponible',
    message: `Nueva versión ${info.version} disponible. ¿Descargar ahora?`,
    buttons: ['Descargar', 'Más tarde']
  }).then((result) => {
    if (result.response === 0) {
      autoUpdater.downloadUpdate();
    }
  });
});

autoUpdater.on('update-not-available', () => {
  console.log('[AutoUpdater] App is up to date');
});

autoUpdater.on('download-progress', (progress) => {
  console.log(`[AutoUpdater] Download progress: ${Math.round(progress.percent)}%`);
  mainWindow.setProgressBar(progress.percent / 100);
});

autoUpdater.on('update-downloaded', (info) => {
  console.log('[AutoUpdater] Update downloaded:', info.version);
  mainWindow.setProgressBar(-1); // Remove progress bar
  dialog.showMessageBox(mainWindow, {
    type: 'info',
    title: 'Actualización lista',
    message: `Versión ${info.version} descargada. Se instalará al cerrar la aplicación.`,
    buttons: ['Reiniciar ahora', 'Más tarde']
  }).then((result) => {
    if (result.response === 0) {
      autoUpdater.quitAndInstall();
    }
  });
});

autoUpdater.on('error', (err) => {
  console.error('[AutoUpdater] Error:', err);
});

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    backgroundColor: '#0f0f13',
    webPreferences: {
      preload: path.join(__dirname, 'electron-preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false
    },
    icon: path.join(__dirname, 'public', 'icon.png') // opcional
  });

  // Cargar index.html desde public/
  mainWindow.loadFile('public/index.html');

  // Abrir DevTools en desarrollo
  if (process.env.NODE_ENV === 'development') {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  createWindow();

  // Check for updates (solo en producción)
  if (process.env.NODE_ENV !== 'development') {
    setTimeout(() => {
      autoUpdater.checkForUpdates();
    }, 3000); // Esperar 3s después de abrir
  }

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// ========================================
// IPC Handlers - Storage
// ========================================

// Guardar fileIndex
ipcMain.handle('storage:set', async (event, key, value) => {
  try {
    const filePath = path.join(USER_DATA_PATH, `${key}.json`);
    await fs.writeFile(filePath, value, 'utf-8');
    return { success: true };
  } catch (error) {
    console.error('Error saving storage:', error);
    return { success: false, error: error.message };
  }
});

// Cargar fileIndex
ipcMain.handle('storage:get', async (event, key) => {
  try {
    const filePath = path.join(USER_DATA_PATH, `${key}.json`);
    const data = await fs.readFile(filePath, 'utf-8');
    return { value: data };
  } catch (error) {
    if (error.code === 'ENOENT') {
      return { value: null }; // No existe
    }
    console.error('Error loading storage:', error);
    return { value: null };
  }
});

// ========================================
// IPC Handlers - Filesystem
// ========================================

// Escribir archivo
ipcMain.handle('fs:writeFile', async (event, relativePath, content) => {
  try {
    const fullPath = path.join(MD_VIEWER_DIR, relativePath);
    const dir = path.dirname(fullPath);

    // Crear directorio si no existe
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(fullPath, content, 'utf-8');

    return { success: true };
  } catch (error) {
    console.error('Error writing file:', error);
    return { success: false, error: error.message };
  }
});

// Leer archivo
ipcMain.handle('fs:readFile', async (event, relativePath) => {
  try {
    const fullPath = path.join(MD_VIEWER_DIR, relativePath);
    const data = await fs.readFile(fullPath, 'utf-8');
    return { data };
  } catch (error) {
    console.error('Error reading file:', error);
    return { data: null, error: error.message };
  }
});

// Eliminar archivo
ipcMain.handle('fs:deleteFile', async (event, relativePath) => {
  try {
    const fullPath = path.join(MD_VIEWER_DIR, relativePath);
    await fs.unlink(fullPath);
    return { success: true };
  } catch (error) {
    console.error('Error deleting file:', error);
    return { success: false, error: error.message };
  }
});

// Eliminar directorio recursivamente
ipcMain.handle('fs:deleteDir', async (event, relativePath) => {
  try {
    const fullPath = path.join(MD_VIEWER_DIR, relativePath);
    await fs.rm(fullPath, { recursive: true, force: true });
    return { success: true };
  } catch (error) {
    console.error('Error deleting directory:', error);
    return { success: false, error: error.message };
  }
});

// ========================================
// IPC Handlers - File Picker
// ========================================

// Importar archivos (múltiple selección)
ipcMain.handle('filePicker:pickFiles', async () => {
  try {
    const result = await dialog.showOpenDialog(mainWindow, {
      title: 'Importar archivos Markdown',
      properties: ['openFile', 'multiSelections'],
      filters: [
        { name: 'Markdown', extensions: ['md', 'markdown'] },
        { name: 'Texto', extensions: ['txt'] },
        { name: 'Todos', extensions: ['*'] }
      ]
    });

    if (result.canceled) {
      return { files: [] };
    }

    // Leer contenido de cada archivo
    const files = await Promise.all(
      result.filePaths.map(async (filePath) => {
        const content = await fs.readFile(filePath, 'utf-8');
        const name = path.basename(filePath);

        // Convertir a base64 (compatibilidad con código Capacitor)
        const base64 = Buffer.from(content, 'utf-8').toString('base64');

        return {
          name,
          path: filePath,
          data: base64,
          mimeType: 'text/markdown'
        };
      })
    );

    return { files };
  } catch (error) {
    console.error('Error picking files:', error);
    return { files: [], error: error.message };
  }
});

// Importar carpeta completa
ipcMain.handle('filePicker:pickFolder', async () => {
  try {
    const result = await dialog.showOpenDialog(mainWindow, {
      title: 'Importar carpeta',
      properties: ['openDirectory']
    });

    if (result.canceled) {
      return { files: [] };
    }

    const folderPath = result.filePaths[0];
    const files = [];

    // Función recursiva para leer archivos
    async function scanDirectory(dirPath, basePath = '') {
      const entries = await fs.readdir(dirPath, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(dirPath, entry.name);
        const relativePath = path.join(basePath, entry.name);

        if (entry.isDirectory()) {
          await scanDirectory(fullPath, relativePath);
        } else if (entry.isFile() && (entry.name.endsWith('.md') || entry.name.endsWith('.markdown') || entry.name.endsWith('.txt'))) {
          const content = await fs.readFile(fullPath, 'utf-8');
          const base64 = Buffer.from(content, 'utf-8').toString('base64');

          files.push({
            name: entry.name,
            path: relativePath.replace(/\\/g, '/'), // Normalizar path
            data: base64,
            mimeType: 'text/markdown'
          });
        }
      }
    }

    await scanDirectory(folderPath);

    return { files };
  } catch (error) {
    console.error('Error picking folder:', error);
    return { files: [], error: error.message };
  }
});

console.log(`[Electron] MD Viewer Desktop ready`);
console.log(`[Electron] Data directory: ${MD_VIEWER_DIR}`);
