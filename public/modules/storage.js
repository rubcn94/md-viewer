// ── Storage Management ─────────────────────────────────

export const APP_DIR = 'md-viewer-docs';
export let fileIndex = [];
let Filesystem, Preferences;

export function initializePlugins(plugins) {
  Filesystem = plugins.Filesystem;
  Preferences = plugins.Preferences;
}

export function getFilesystem() {
  return Filesystem;
}

export function getPreferences() {
  return Preferences;
}

export async function loadFileIndex() {
  try {
    const { value } = await Preferences.get({ key: 'fileIndex' });
    fileIndex = value ? JSON.parse(value) : [];
    return fileIndex;
  } catch (e) {
    console.error('Error loading file index:', e);
    fileIndex = [];
    return fileIndex;
  }
}

export async function saveFileIndex() {
  try {
    await Preferences.set({
      key: 'fileIndex',
      value: JSON.stringify(fileIndex)
    });
  } catch (e) {
    console.error('Error saving file index:', e);
  }
}

export function addFile(file) {
  fileIndex.push(file);
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
