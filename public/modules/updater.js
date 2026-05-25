// ── Auto-Update System ─────────────────────────────────

import { getPlatform } from './storage.js';
import { showToast } from './ui.js';

const CURRENT_VERSION = '2.0.5';
const UPDATE_CHECK_URL = 'https://raw.githubusercontent.com/YOUR-USERNAME/md-viewer/main/version.json';
const GITHUB_RELEASES_URL = 'https://github.com/YOUR-USERNAME/md-viewer/releases/latest';

let updateBanner = null;

// ── Check for Updates ──────────────────────────────────
export async function checkForUpdates() {
  const platform = getPlatform();

  // Solo verificar en producción (no en dev web)
  if (platform === 'unknown') {
    console.log('[Updater] Skipping update check (development mode)');
    return;
  }

  try {
    console.log('[Updater] Checking for updates...');

    // Fetch version.json desde GitHub
    const response = await fetch(UPDATE_CHECK_URL, {
      cache: 'no-cache'
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    const latestVersion = data.version;

    console.log(`[Updater] Current: ${CURRENT_VERSION}, Latest: ${latestVersion}`);

    if (isNewerVersion(latestVersion, CURRENT_VERSION)) {
      console.log('[Updater] Update available!');
      showUpdateBanner(latestVersion, data);
    } else {
      console.log('[Updater] App is up to date');
    }
  } catch (e) {
    console.error('[Updater] Failed to check for updates:', e);
    // No mostrar error al usuario, solo log silencioso
  }
}

// ── Version Comparison ────────────────────────────────
function isNewerVersion(latest, current) {
  const latestParts = latest.split('.').map(Number);
  const currentParts = current.split('.').map(Number);

  for (let i = 0; i < 3; i++) {
    if (latestParts[i] > currentParts[i]) return true;
    if (latestParts[i] < currentParts[i]) return false;
  }

  return false;
}

// ── Show Update Banner ────────────────────────────────
function showUpdateBanner(version, data) {
  // Remove old banner if exists
  if (updateBanner) {
    updateBanner.remove();
  }

  const platform = getPlatform();
  const downloadUrl = platform === 'electron'
    ? data.downloadUrls?.windows || GITHUB_RELEASES_URL
    : data.downloadUrls?.android || GITHUB_RELEASES_URL;

  // Create banner
  updateBanner = document.createElement('div');
  updateBanner.className = 'update-banner';
  updateBanner.innerHTML = `
    <div class="update-banner-content">
      <div class="update-icon">🚀</div>
      <div class="update-info">
        <div class="update-title">Nueva versión disponible: v${version}</div>
        <div class="update-desc">${data.description || 'Actualización disponible con mejoras y correcciones'}</div>
      </div>
      <div class="update-actions">
        <button class="btn-update-download" onclick="window.downloadUpdate('${downloadUrl}')">
          Descargar
        </button>
        <button class="btn-update-dismiss" onclick="window.dismissUpdateBanner()">
          Más tarde
        </button>
      </div>
    </div>
  `;

  document.body.appendChild(updateBanner);

  // Animate in
  setTimeout(() => {
    updateBanner.classList.add('visible');
  }, 100);
}

// ── Download Update ───────────────────────────────────
export function downloadUpdate(url) {
  const platform = getPlatform();

  if (platform === 'electron') {
    // En Electron, abrir link en navegador
    window.electronAPI?.shell.openExternal(url);
    showToast('Se abrirá el navegador para descargar la actualización', 'success');
  } else {
    // En Android, abrir link (abrirá navegador o descarga directa)
    window.open(url, '_system');
    showToast('Descargando actualización...', 'success');
  }

  dismissUpdateBanner();
}

// ── Dismiss Banner ────────────────────────────────────
export function dismissUpdateBanner() {
  if (updateBanner) {
    updateBanner.classList.remove('visible');
    setTimeout(() => {
      updateBanner.remove();
      updateBanner = null;
    }, 300);
  }
}

// ── Auto-check on startup (with delay) ───────────────
export function initUpdater() {
  // Esperar 5 segundos después de cargar la app
  setTimeout(() => {
    checkForUpdates();
  }, 5000);

  // Re-check cada 6 horas
  setInterval(() => {
    checkForUpdates();
  }, 6 * 60 * 60 * 1000);
}

// ── Get Current Version ───────────────────────────────
export function getCurrentVersion() {
  return CURRENT_VERSION;
}
