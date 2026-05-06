// ── UI Helpers ─────────────────────────────────────────

export function toggleSidebar() {
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebarOverlay');
  sidebar.classList.toggle('open');
  overlay.classList.toggle('open');
}

export function showToast(message, type = '') {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.className = 'toast ' + type;
  void toast.offsetWidth;
  toast.classList.add('show');
  setTimeout(() => {
    toast.classList.remove('show');
  }, 2500);
}

export function showEmpty() {
  const contentArea = document.getElementById('contentArea');
  contentArea.innerHTML = `
    <div class="empty-state">
      <div class="empty-icon">📱</div>
      <div class="empty-title">MD Viewer Mobile</div>
      <div class="empty-sub">Importa archivos Markdown desde el menú lateral<br>y visualízalos formateados.</div>
    </div>
  `;

  // Clear tabs
  if (window.clearCurrentFile) {
    window.clearCurrentFile();
  }
  if (window.closeAllTabs) {
    window.closeAllTabs();
  }
}

export function showLoading(message = 'Cargando...') {
  const contentArea = document.getElementById('contentArea');
  contentArea.innerHTML = `
    <div class="loading">
      <div class="spinner"></div>
      <span>${message}</span>
    </div>
  `;
}

export function showError(title, message) {
  const contentArea = document.getElementById('contentArea');
  contentArea.innerHTML = `
    <div class="empty-state">
      <div class="empty-icon">⚠️</div>
      <div class="empty-title">${title}</div>
      <div class="empty-sub">${message}</div>
    </div>
  `;
}
