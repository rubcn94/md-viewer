// ── Search Functions ───────────────────────────────────

import { getFiles } from './storage.js';
import { renderSearchResults } from './render.js';

let searchTimeout = null;

export function initSearch() {
  const searchInput = document.getElementById('searchInput');
  searchInput.addEventListener('input', (e) => {
    clearTimeout(searchTimeout);
    const q = e.target.value.trim();
    if (q.length < 2) {
      if (window.getCurrentFile && !window.getCurrentFile()) {
        if (window.showEmpty) window.showEmpty();
      }
      return;
    }
    searchTimeout = setTimeout(() => doSearch(q), 300);
  });
}

export function doSearch(query) {
  const q = query.toLowerCase();
  const results = [];
  const fileIndex = getFiles();

  for (const file of fileIndex) {
    const contentLower = file.content.toLowerCase();
    const nameLower = file.name.toLowerCase();

    if (nameLower.includes(q) || contentLower.includes(q)) {
      let snippet = '';
      const idx = contentLower.indexOf(q);
      if (idx !== -1) {
        const start = Math.max(0, idx - 40);
        const end = Math.min(file.content.length, idx + q.length + 40);
        snippet = (start > 0 ? '…' : '') + file.content.substring(start, end) + (end < file.content.length ? '…' : '');
      } else {
        snippet = file.content.substring(0, 100) + (file.content.length > 100 ? '…' : '');
      }

      results.push({
        file,
        snippet: snippet
      });
    }
  }

  renderSearchResults(query, results);
}
