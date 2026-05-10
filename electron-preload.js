const { contextBridge, ipcRenderer } = require('electron');

// Exponer API segura al renderer process
contextBridge.exposeInMainWorld('electronAPI', {
  // Storage (Preferences)
  storage: {
    set: (key, value) => ipcRenderer.invoke('storage:set', key, value),
    get: (key) => ipcRenderer.invoke('storage:get', key)
  },

  // Filesystem
  filesystem: {
    writeFile: (path, content) => ipcRenderer.invoke('fs:writeFile', path, content),
    readFile: (path) => ipcRenderer.invoke('fs:readFile', path),
    deleteFile: (path) => ipcRenderer.invoke('fs:deleteFile', path),
    deleteDir: (path) => ipcRenderer.invoke('fs:deleteDir', path)
  },

  // File Picker
  filePicker: {
    pickFiles: () => ipcRenderer.invoke('filePicker:pickFiles'),
    pickFolder: () => ipcRenderer.invoke('filePicker:pickFolder')
  },

  // Plataforma
  platform: 'electron'
});

console.log('[Preload] Electron API exposed to window.electronAPI');
