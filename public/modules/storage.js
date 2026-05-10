// ── Storage Management ─────────────────────────────────

export const APP_DIR = 'md-viewer-docs';
export let fileIndex = [];
let Filesystem, Preferences;
let platform = 'unknown'; // 'capacitor' or 'electron'

export function initializePlugins(plugins) {
  if (plugins.Filesystem && plugins.Preferences) {
    // Capacitor (mobile)
    Filesystem = plugins.Filesystem;
    Preferences = plugins.Preferences;
    platform = 'capacitor';
  } else if (window.electronAPI) {
    // Electron (desktop)
    platform = 'electron';
  }
  console.log(`[Storage] Platform detected: ${platform}`);
}

export function getFilesystem() {
  return Filesystem;
}

export function getPreferences() {
  return Preferences;
}

export function getPlatform() {
  return platform;
}

export async function loadFileIndex() {
  try {
    if (platform === 'electron') {
      const { value } = await window.electronAPI.storage.get('fileIndex');
      fileIndex = value ? JSON.parse(value) : [];
    } else if (platform === 'capacitor') {
      const { value } = await Preferences.get({ key: 'fileIndex' });
      fileIndex = value ? JSON.parse(value) : [];
    } else {
      console.warn('[Storage] Unknown platform, using empty fileIndex');
      fileIndex = [];
    }
    return fileIndex;
  } catch (e) {
    console.error('Error loading file index:', e);
    fileIndex = [];
    return fileIndex;
  }
}

export async function saveFileIndex() {
  try {
    const data = JSON.stringify(fileIndex);
    if (platform === 'electron') {
      await window.electronAPI.storage.set('fileIndex', data);
    } else if (platform === 'capacitor') {
      await Preferences.set({
        key: 'fileIndex',
        value: data
      });
    }
  } catch (e) {
    console.error('Error saving file index:', e);
  }
}

export function addFile(file) {
  // Ensure file has metadata fields
  const fileWithMeta = {
    ...file,
    read: file.read || false,
    bookmark: file.bookmark || null, // {line: number, scroll: number}
    highlights: file.highlights || [] // [{id, startLine, endLine, text, color}]
  };
  fileIndex.push(fileWithMeta);
}

export async function updateFileMetadata(path, metadata) {
  const file = fileIndex.find(f => f.path === path);
  if (file) {
    Object.assign(file, metadata);
    await saveFileIndex();
  }
}

export function removeFile(path) {
  const index = fileIndex.findIndex(f => f.path === path);
  if (index !== -1) {
    fileIndex.splice(index, 1);
  }
}

export function getFile(path) {
  return fileIndex.find(f => f.path === path);
}

export function getFiles() {
  return fileIndex;
}

export function clearFileIndex() {
  fileIndex = [];
}

export function filterFiles(predicate) {
  return fileIndex.filter(predicate);
}

export function removeFilesMatching(predicate) {
  const before = fileIndex.length;
  fileIndex = fileIndex.filter(f => !predicate(f));
  return before - fileIndex.length;
}
