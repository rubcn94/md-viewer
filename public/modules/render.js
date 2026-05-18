// ── Render Functions ───────────────────────────────────

import { escapeHtml, escapeAttr } from './utils.js';
import { getFiles } from './storage.js';

// Filter state
let showOnlyFavorites = false;

export async function renderTree(currentFile = null) {
  const treeEl = document.getElementById('fileTree');
  let fileIndex = getFiles();

  // Apply favorites filter if enabled
  if (showOnlyFavorites) {
    fileIndex = fileIndex.filter(f => f.starred);
  }

  if (fileIndex.length === 0) {
    treeEl.innerHTML = `
      <div style="padding: 20px 12px; text-align: center; color: var(--text-muted); font-size: 12px;">
        No hay archivos aún.<br>Pulsa <strong>+ Importar</strong>
      </div>
    `;
    return;
  }

  // Build recursive tree structure
  const tree = buildFileTree(fileIndex);
  const html = renderTreeNode(tree, currentFile);
  treeEl.innerHTML = html;
}

function buildFileTree(files) {
  const tree = { folders: {}, files: [] };

  for (const file of files) {
    if (file.path.includes('/')) {
      const parts = file.path.split('/');
      insertIntoTree(tree, parts, file);
    } else {
      tree.files.push(file);
    }
  }

  return tree;
}

function insertIntoTree(node, parts, file) {
  if (parts.length === 1) {
    node.files.push(file);
    return;
  }

  const folderName = parts[0];
  if (!node.folders[folderName]) {
    node.folders[folderName] = { folders: {}, files: [] };
  }

  insertIntoTree(node.folders[folderName], parts.slice(1), file);
}

function renderTreeNode(node, currentFile, pathPrefix = '') {
  let html = '';

  // Render folders
  for (const [folderName, subNode] of Object.entries(node.folders)) {
    const folderPath = pathPrefix ? `${pathPrefix}/${folderName}` : folderName;
    const fileCount = countFiles(subNode);

    html += `
      <div class="folder-item" data-folder="${escapeAttr(folderPath)}">
        <div class="folder-header" onclick="window.toggleFolder(this)">
          <span class="folder-icon">▶</span>
          <span class="folder-name">${escapeHtml(folderName)}</span>
          <span class="folder-count">${fileCount}</span>
          <button class="btn-remove-folder" onclick="event.stopPropagation(); window.removeFolder('${escapeAttr(folderPath)}')" title="Eliminar carpeta">✕</button>
        </div>
        <div class="folder-children">
          ${renderTreeNode(subNode, currentFile, folderPath)}
        </div>
      </div>
    `;
  }

  // Render files
  for (const file of node.files) {
    const activeClass = currentFile && currentFile.path === file.path ? ' active' : '';
    const readIndicator = file.read ? '<span class="read-tick">✓</span>' : '';
    const bookmarkIndicator = file.bookmark ? '<span class="bookmark-flag">📌</span>' : '';

    html += `
      <div class="file-item${activeClass}" data-path="${escapeAttr(file.path)}">
        <span class="file-icon" onclick="window.openFile('${escapeAttr(file.path)}')">📄</span>
        <span class="file-name" onclick="window.openFile('${escapeAttr(file.path)}')">${escapeHtml(file.name)}</span>
        ${readIndicator}
        ${bookmarkIndicator}
        <button class="btn-remove-file" onclick="event.stopPropagation(); window.removeFile('${escapeAttr(file.path)}')" title="Eliminar archivo">✕</button>
      </div>
    `;
  }

  return html;
}

function countFiles(node) {
  let count = node.files.length;
  for (const subNode of Object.values(node.folders)) {
    count += countFiles(subNode);
  }
  return count;
}

// ── Helper: slugify para IDs de headers ──────────────
function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')           // Espacios → guiones
    .replace(/[^\w\-]+/g, '')       // Remover caracteres no alfanuméricos
    .replace(/\-\-+/g, '-')         // Múltiples guiones → uno solo
    .replace(/^-+/, '')             // Remover guión al inicio
    .replace(/-+$/, '');            // Remover guión al final
}

// ── Configurar marked.js para generar IDs ────────────
function configureMarked() {
  const renderer = new marked.Renderer();

  // Override del renderer de headers para añadir IDs
  renderer.heading = function(text, level) {
    const escapedText = slugify(text);
    return `<h${level} id="${escapedText}">${text}</h${level}>`;
  };

  marked.setOptions({
    renderer: renderer,
    breaks: true,       // Saltos de línea automáticos (GFM)
    gfm: true          // GitHub Flavored Markdown
  });
}

// ── Inicializar configuración de marked ──────────────
configureMarked();

// ── Setup: navegación suave en TOC ────────────────────
function setupTOCNavigation() {
  const contentArea = document.querySelector('.content-area');
  if (!contentArea) return;

  // Event delegation: interceptar clicks en links internos (#header)
  contentArea.addEventListener('click', (e) => {
    const link = e.target.closest('a[href^="#"]');
    if (!link) return;

    e.preventDefault();

    const targetId = link.getAttribute('href').substring(1);
    const targetElement = document.getElementById(targetId);

    if (targetElement) {
      // Scroll suave a la sección
      targetElement.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });

      // Opcional: añadir highlight temporal al header
      targetElement.classList.add('toc-target-highlight');
      setTimeout(() => {
        targetElement.classList.remove('toc-target-highlight');
      }, 2000);
    }
  });
}

export function renderMarkdown(file) {
  const contentArea = document.getElementById('contentArea');

  try {
    const html = marked.parse(file.content);

    contentArea.innerHTML = `
      <div class="content-area" style="flex:1; overflow-y:auto; padding:24px 20px;">
        <div class="md-body">${html}</div>
      </div>
    `;

    addCopyButtons();

    document.querySelectorAll('.md-body pre code').forEach((block) => {
      hljs.highlightElement(block);
    });

    // Setup TOC navigation
    setupTOCNavigation();

    // Restore highlights
    if (window.restoreHighlights) {
      window.restoreHighlights(file);
    }

    // Initialize highlight system (Notion-style floating menu)
    if (window.initHighlightSystem) {
      window.initHighlightSystem();
    }

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


// -- Favorites Filter --

export function toggleFavoritesFilter() {
  const checkbox = document.getElementById('filterFavorites');
  showOnlyFavorites = checkbox.checked;
  renderTree();
}
