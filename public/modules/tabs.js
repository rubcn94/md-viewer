// ── Tabs System ────────────────────────────────────────

import { escapeHtml, escapeAttr } from './utils.js';

let openTabs = []; // Array of { path, name }
let activeTabPath = null;

export function getTabs() {
  return openTabs;
}

export function getActiveTab() {
  return activeTabPath;
}

export function addTab(file) {
  // Check if already open
  const existing = openTabs.find(t => t.path === file.path);
  if (!existing) {
    openTabs.push({
      path: file.path,
      name: file.name
    });
  }
  activeTabPath = file.path;
  renderTabs();
}

export function closeTab(filePath) {
  const index = openTabs.findIndex(t => t.path === filePath);
  if (index === -1) return false;

  openTabs.splice(index, 1);

  if (activeTabPath === filePath) {
    // Switch to another tab
    if (openTabs.length > 0) {
      const nextTab = openTabs[Math.max(0, index - 1)];
      activeTabPath = nextTab.path;
      if (window.openFile) {
        window.openFile(nextTab.path);
      }
      renderTabs();
      return true;
    } else {
      activeTabPath = null;
      renderTabs();
      return false;
    }
  }

  renderTabs();
  return true;
}

export function closeTabByPath(filePath) {
  return closeTab(filePath);
}

export function switchToTab(filePath) {
  const tab = openTabs.find(t => t.path === filePath);
  if (!tab) return false;

  activeTabPath = filePath;
  if (window.openFile) {
    window.openFile(filePath);
  }
  renderTabs();
  return true;
}

export function switchToNextTab() {
  if (openTabs.length === 0) return false;

  const currentIndex = openTabs.findIndex(t => t.path === activeTabPath);
  const nextIndex = (currentIndex + 1) % openTabs.length;
  const nextTab = openTabs[nextIndex];

  return switchToTab(nextTab.path);
}

export function closeAllTabs() {
  openTabs = [];
  activeTabPath = null;
  renderTabs();
}

export function renderTabs() {
  const tabBar = document.getElementById('tabBar');
  if (!tabBar) return;

  if (openTabs.length === 0) {
    tabBar.innerHTML = '';
    tabBar.style.display = 'none';
    return;
  }

  tabBar.style.display = 'flex';

  let html = '';
  for (const tab of openTabs) {
    const isActive = tab.path === activeTabPath;
    html += `
      <div class="tab ${isActive ? 'active' : ''}" data-path="${escapeAttr(tab.path)}">
        <span class="tab-name" onclick="window.switchToTab('${escapeAttr(tab.path)}')">${escapeHtml(tab.name)}</span>
        <button class="tab-close" onclick="event.stopPropagation(); window.closeTab('${escapeAttr(tab.path)}')" title="Cerrar">✕</button>
      </div>
    `;
  }

  tabBar.innerHTML = html;
}
