// ── Render Functions ───────────────────────────────────

import { escapeHtml, escapeAttr } from './utils.js';
import { getFiles } from './storage.js';

export async function renderTree(currentFile = null) {
  const treeEl = document.getElementById('fileTree');
  const fileIndex = getFiles();

  if (fileIndex.length === 0) {
    treeEl.innerHTML = `
      <div style="padding: 20px 12px; text-align: center; color: var(--text-muted); font-size: 12px;">
        No hay archivos aún.<br>Pulsa <strong>+ Importar</strong>
      </div>
    `;
    return;
  }

  const folders = {};
  const rootFiles = [];

  for (const file of fileIndex) {
    if (file.path.includes('/')) {
      const parts = file.path.split('/');
      const folder = parts[0];
      if (!folders[folder]) folders[folder] = [];
      folders[folder].push(file);
    } else {
      rootFiles.push(file);
    }
  }

  let html = '';

  for (const [folderName, files] of Object.entries(folders)) {
    html += `
      <div class="folder-item" data-folder="${escapeHtml(folderName)}">
        <div class="folder-header" onclick="window.toggleFolder(this)">
          <span class="folder-icon">▶</span>
          <span class="folder-name">${escapeHtml(folderName)}</span>
          <button class="btn-remove-folder" onclick="event.stopPropagation(); window.removeFolder('${escapeAttr(folderName)}')" title="Eliminar carpeta">✕</button>
        </div>
        <div class="folder-children">
    `;

    for (const file of files) {
      const activeClass = currentFile && currentFile.path === file.path ? ' active' : '';
      html += `
        <div class="file-item${activeClass}" data-path="${escapeAttr(file.path)}">
          <span class="file-icon" onclick="window.openFile('${escapeAttr(file.path)}')">📄</span>
          <span class="file-name" onclick="window.openFile('${escapeAttr(file.path)}')">${escapeHtml(file.name)}</span>
          <button class="btn-remove-file" onclick="event.stopPropagation(); window.removeFile('${escapeAttr(file.path)}')" title="Eliminar archivo">✕</button>
        </div>
      `;
    }

    html += '</div></div>';
  }

  for (const file of rootFiles) {
    const activeClass = currentFile && currentFile.path === file.path ? ' active' : '';
    html += `
      <div class="file-item${activeClass}" data-path="${escapeAttr(file.path)}">
        <span class="file-icon" onclick="window.openFile('${escapeAttr(file.path)}')">📄</span>
        <span class="file-name" onclick="window.openFile('${escapeAttr(file.path)}')">${escapeHtml(file.name)}</span>
        <button class="btn-remove-file" onclick="event.stopPropagation(); window.removeFile('${escapeAttr(file.path)}')" title="Eliminar archivo">✕</button>
      </div>
    `;
  }

  treeEl.innerHTML = html;
}

export function renderMarkdown(file) {
  const contentArea = document.getElementById('contentArea');

  try {
    const html = marked.parse(file.content);
    contentArea.innerHTML = `
      <div class="doc-header">
        <span class="doc-title">${escapeHtml(file.name)}</span>
        <span class="doc-meta">${file.content.length} caracteres</span>
        <button class="btn-raw" onclick="window.toggleRaw()">Raw</button>
        <button class="btn-close" onclick="window.closeTab('${escapeAttr(file.path)}')">✕</button>
      </div>
      <div class="content-area" style="flex:1; overflow-y:auto; padding:24px 20px;">
        <div class="md-body">${html}</div>
      </div>
    `;

    addCopyButtons();

    document.querySelectorAll('.md-body pre code').forEach((block) => {
      hljs.highlightElement(block);
    });

    return true;
  } catch (e) {
    contentArea.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">⚠️</div>
        <div class="empty-title">Error al renderizar</div>
        <div class="empty-sub">${escapeHtml(e.message)}</div>
      </div>
    `;
    return false;
  }
}

export function renderRaw(file) {
  const contentArea = document.getElementById('contentArea');
  contentArea.innerHTML = `
    <div class="doc-header">
      <span class="doc-title">${escapeHtml(file.name)}</span>
      <span class="doc-meta">Raw</span>
      <button class="btn-raw" onclick="window.toggleRaw()">Render</button>
      <button class="btn-close" onclick="window.closeTab('${escapeAttr(file.path)}')">✕</button>
    </div>
    <div class="content-area" style="flex:1; overflow-y:auto; padding:24px 20px;">
      <pre style="background:var(--surface); padding:16px; border-radius:8px; overflow-x:auto; font-family:var(--mono); font-size:12px; line-height:1.6; color:var(--text-dim);">${escapeHtml(file.content)}</pre>
    </div>
  `;
}

export function renderSearchResults(query, results) {
  const contentArea = document.getElementById('contentArea');

  if (results.length === 0) {
    contentArea.innerHTML = `
      <div class="search-results">
        <div class="search-results-title">Sin resultados para "${escapeHtml(query)}"</div>
      </div>
    `;
    return;
  }

  let html = `<div class="search-results"><div class="search-results-title">${results.length} resultado${results.length !== 1 ? 's' : ''} para "${escapeHtml(query)}"</div>`;

  for (const r of results) {
    // Highlight search term in snippet
    const highlightedSnippet = highlightSearchTerm(r.snippet, query);
    html += `
      <div class="search-result-item" onclick="window.openFile('${escapeAttr(r.file.path)}')">
        <div class="result-name">${escapeHtml(r.file.name)}</div>
        <div class="result-snippet">${highlightedSnippet}</div>
        <div class="result-path">${escapeHtml(r.file.path)}</div>
      </div>
    `;
  }

  html += '</div>';
  contentArea.innerHTML = html;
}

function highlightSearchTerm(text, query) {
  const escapedText = escapeHtml(text);
  const regex = new RegExp(`(${escapeRegex(query)})`, 'gi');
  return escapedText.replace(regex, '<mark style="background: var(--accent); color: white; padding: 1px 3px; border-radius: 2px;">$1</mark>');
}

function escapeRegex(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function addCopyButtons() {
  document.querySelectorAll('.md-body pre').forEach(pre => {
    if (pre.querySelector('.copy-btn')) return;
    const btn = document.createElement('button');
    btn.className = 'copy-btn';
    btn.textContent = 'Copiar';
    btn.onclick = async () => {
      const code = pre.querySelector('code')?.textContent || pre.textContent;
      try {
        await navigator.clipboard.writeText(code);
        btn.textContent = 'Copiado';
        btn.classList.add('copied');
        setTimeout(() => {
          btn.textContent = 'Copiar';
          btn.classList.remove('copied');
        }, 2000);
      } catch (e) {
        const textarea = document.createElement('textarea');
        textarea.value = code;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        btn.textContent = 'Copiado';
        btn.classList.add('copied');
        setTimeout(() => {
          btn.textContent = 'Copiar';
          btn.classList.remove('copied');
        }, 2000);
      }
    };
    pre.style.position = 'relative';
    pre.appendChild(btn);
  });
}
