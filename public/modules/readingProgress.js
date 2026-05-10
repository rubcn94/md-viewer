// ── Reading Progress Management ────────────────────────

import { getFile, updateFileMetadata } from './storage.js';
import { renderTree } from './render.js';
import { showToast } from './ui.js';

// ── Mark as Read ──────────────────────────────────────
export async function toggleReadStatus(filePath) {
  const file = getFile(filePath);
  if (!file) return;

  await updateFileMetadata(filePath, { read: !file.read });
  await renderTree(file);
  showToast(file.read ? 'Marcado como no leído' : 'Marcado como leído ✓', 'success');
}

// ── Bookmark Management ───────────────────────────────
export async function saveBookmark(filePath) {
  const contentArea = document.querySelector('.content-area');
  if (!contentArea) return;

  const scrollPosition = contentArea.scrollTop;
  const scrollPercent = (scrollPosition / (contentArea.scrollHeight - contentArea.clientHeight)) * 100;

  await updateFileMetadata(filePath, {
    bookmark: {
      scroll: scrollPosition,
      percent: Math.round(scrollPercent),
      timestamp: new Date().toISOString()
    }
  });

  await renderTree(getFile(filePath));
  showToast(`Marcador guardado (${Math.round(scrollPercent)}%)`, 'success');
}

export function goToBookmark(filePath) {
  const file = getFile(filePath);
  if (!file || !file.bookmark) {
    showToast('No hay marcador guardado', 'error');
    return;
  }

  const contentArea = document.querySelector('.content-area');
  if (!contentArea) return;

  contentArea.scrollTo({
    top: file.bookmark.scroll,
    behavior: 'smooth'
  });

  showToast(`Volviendo al marcador (${file.bookmark.percent}%)`, 'success');
}

export async function clearBookmark(filePath) {
  await updateFileMetadata(filePath, { bookmark: null });
  await renderTree(getFile(filePath));
  showToast('Marcador eliminado', 'success');
}

// ── Highlight Management (Notion-style) ──────────────────────────────
const HIGHLIGHT_COLORS = {
  yellow: 'rgba(255, 215, 0, 0.35)',      // Amarillo
  green: 'rgba(144, 238, 144, 0.35)',     // Verde lima
  blue: 'rgba(135, 206, 250, 0.35)',      // Azul cielo
  pink: 'rgba(255, 182, 193, 0.35)'       // Rosa suave
};

let floatingMenu = null;
let currentSelection = null;
let currentHighlightElement = null; // Para editar highlights existentes

// Initialize text selection detection
let selectionChangeTimeout = null;

let highlightPressTimer = null;
const LONG_PRESS_DURATION = 500; // milliseconds

export function initHighlightSystem() {
  const contentArea = document.querySelector('.md-body');
  if (!contentArea) return;

  // Remove previous listeners to avoid duplicates
  contentArea.removeEventListener('click', handleHighlightClick);
  document.removeEventListener('selectionchange', handleSelectionChange);

  // Add click listener for existing highlights
  contentArea.addEventListener('click', handleHighlightClick);

  // ✅ CRITICAL: Prevent Android's copy/paste toolbar completely
  // We'll show our own floating menu instead
  contentArea.addEventListener('contextmenu', (event) => {
    event.preventDefault();
    event.stopPropagation();
    return false;
  });

  // MAIN MAGIC: Listen to selection changes (works perfectly on mobile!)
  document.addEventListener('selectionchange', handleSelectionChange);

  // Close menu when clicking outside (but not when selecting text!)
  document.removeEventListener('mousedown', hideFloatingMenuIfOutside);
  document.removeEventListener('touchstart', hideFloatingMenuIfOutside);
  document.addEventListener('mousedown', hideFloatingMenuIfOutside);
  document.addEventListener('touchstart', hideFloatingMenuIfOutside, { passive: true });

  // ✅ NEW: Add long-press support for removing highlights
  setupHighlightLongPress(contentArea);
}

function setupHighlightLongPress(contentArea) {
  // Touch events for mobile
  contentArea.addEventListener('touchstart', handleHighlightTouchStart, { passive: true });
  contentArea.addEventListener('touchend', cancelHighlightLongPress);
  contentArea.addEventListener('touchmove', cancelHighlightLongPress);

  // Mouse events for desktop
  contentArea.addEventListener('mousedown', handleHighlightMouseDown);
  contentArea.addEventListener('mouseup', cancelHighlightLongPress);
  contentArea.addEventListener('mouseleave', cancelHighlightLongPress);
}

function handleHighlightTouchStart(event) {
  const highlightElement = event.target.closest('.highlight');
  if (!highlightElement) return;

  // Start long-press timer
  highlightPressTimer = setTimeout(() => {
    showHighlightDeleteMenu(highlightElement, event.touches[0].clientX, event.touches[0].clientY);
  }, LONG_PRESS_DURATION);
}

function handleHighlightMouseDown(event) {
  // Only trigger on primary button
  if (event.button !== 0) return;

  const highlightElement = event.target.closest('.highlight');
  if (!highlightElement) return;

  // Start long-press timer
  highlightPressTimer = setTimeout(() => {
    showHighlightDeleteMenu(highlightElement, event.clientX, event.clientY);
  }, LONG_PRESS_DURATION);
}

function cancelHighlightLongPress() {
  if (highlightPressTimer) {
    clearTimeout(highlightPressTimer);
    highlightPressTimer = null;
  }
}

function showHighlightDeleteMenu(highlightElement, x, y) {
  // Remove existing menu if any
  const existingMenu = document.getElementById('highlightContextMenu');
  if (existingMenu) {
    existingMenu.remove();
  }

  const menu = document.createElement('div');
  menu.id = 'highlightContextMenu';
  menu.className = 'context-menu';
  menu.style.position = 'fixed';
  menu.style.left = `${x}px`;
  menu.style.top = `${y}px`;

  menu.innerHTML = `
    <div class="context-menu-item context-menu-delete" data-action="delete">
      <span style="color: var(--red);">✕</span>
      <span>Eliminar subrayado</span>
    </div>
    <div class="context-menu-item" data-action="cancel">
      <span>↩</span>
      <span>Cancelar</span>
    </div>
  `;

  document.body.appendChild(menu);

  // Position menu to avoid going off-screen
  const rect = menu.getBoundingClientRect();
  if (rect.right > window.innerWidth) {
    menu.style.left = `${window.innerWidth - rect.width - 10}px`;
  }
  if (rect.bottom > window.innerHeight) {
    menu.style.top = `${window.innerHeight - rect.height - 10}px`;
  }

  // Add event listeners
  menu.addEventListener('click', async (e) => {
    const action = e.target.closest('[data-action]')?.dataset.action;

    if (action === 'delete') {
      await removeHighlight(highlightElement);
    }

    menu.remove();
  });

  // Close menu when clicking outside
  setTimeout(() => {
    document.addEventListener('click', function closeMenu(e) {
      if (!menu.contains(e.target)) {
        menu.remove();
        document.removeEventListener('click', closeMenu);
      }
    });
  }, 100);

  // Haptic feedback if available
  if (navigator.vibrate) {
    navigator.vibrate(50);
  }
}

// Handle selection changes (fires automatically when user selects text)
function handleSelectionChange() {
  // Clear previous timeout
  if (selectionChangeTimeout) {
    clearTimeout(selectionChangeTimeout);
  }

  // ✅ CRITICAL FIX: Reduced debounce to 100ms for better responsiveness
  // This allows the menu to appear quickly while user is extending selection
  selectionChangeTimeout = setTimeout(() => {
    const selection = window.getSelection();
    const selectedText = selection?.toString().trim();

    // Only hide if selection is truly empty (allow extending selection)
    if (!selectedText || selectedText.length < 2) {
      hideFloatingMenu();
      return;
    }

    // Verify selection is within .md-body
    if (selection.rangeCount === 0) {
      hideFloatingMenu();
      return;
    }

    const range = selection.getRangeAt(0);
    const container = range.commonAncestorContainer;
    const mdBody = document.querySelector('.md-body');

    // Check if selection is inside md-body
    const isInMdBody = mdBody && (mdBody.contains(container) || container === mdBody);
    if (!isInMdBody) {
      hideFloatingMenu();
      return;
    }

    // Check if selection is on an existing highlight
    let highlightElement = null;
    let isEditingHighlight = false;

    // Strategy: Check upwards from startContainer to see if we're inside a highlight
    let node = range.startContainer;

    // If it's a text node, start from its parent element
    if (node.nodeType === Node.TEXT_NODE) {
      node = node.parentElement;
    }

    // Walk up the DOM tree looking for a highlight element
    while (node && node !== mdBody) {
      if (node.classList && node.classList.contains('highlight')) {
        highlightElement = node;
        isEditingHighlight = true;
        break;
      }
      node = node.parentElement;
    }

    // Get selection position
    const rect = range.getBoundingClientRect();

    if (isEditingHighlight && highlightElement) {
      // Editing existing highlight
      currentHighlightElement = highlightElement;
      currentSelection = {
        range: range.cloneRange(),
        text: selectedText
      };
      showFloatingMenu(rect, true); // true = show edit menu with remove button
    } else {
      // Creating new highlight
      currentSelection = {
        range: range.cloneRange(),
        text: selectedText
      };
      currentHighlightElement = null;
      showFloatingMenu(rect, false); // false = show create menu without remove button
    }
  }, 100); // ✅ REDUCED: 100ms debounce for better responsiveness while extending selection
}

// Handle clicks on existing highlights
function handleHighlightClick(event) {
  const target = event.target;

  // Check if clicked on a highlight
  if (target.classList.contains('highlight')) {
    event.preventDefault();
    event.stopPropagation();

    currentHighlightElement = target;
    const rect = target.getBoundingClientRect();
    showFloatingMenu(rect, true); // true = editing existing highlight
  }
}

function showFloatingMenu(selectionRect, isEditingExisting = false) {
  // Prevent if rect is invalid
  if (!selectionRect || selectionRect.width === 0 || selectionRect.height === 0) {
    return;
  }

  // ✅ IMPROVED: If menu already exists and mode hasn't changed, just update position
  const existingMenu = floatingMenu;
  const modeChanged = existingMenu && (
    (isEditingExisting && !existingMenu.querySelector('.remove-btn')) ||
    (!isEditingExisting && existingMenu.querySelector('.remove-btn'))
  );

  if (existingMenu && !modeChanged) {
    // Just update position of existing menu (SMOOTH, NO RECREATION)
    updateFloatingMenuPosition(existingMenu, selectionRect, isEditingExisting);
    // Ensure it's visible (in case it was fading out)
    existingMenu.classList.add('visible');
    return;
  }

  // Remove existing menu if mode changed
  hideFloatingMenu();

  // Create floating menu
  floatingMenu = document.createElement('div');
  floatingMenu.className = 'highlight-floating-menu';

  // Different menu content based on mode
  if (isEditingExisting) {
    // Editing existing highlight: show colors + remove button
    floatingMenu.innerHTML = `
      <button class="color-btn" data-color="yellow" style="background: ${HIGHLIGHT_COLORS.yellow};" title="Amarillo"></button>
      <button class="color-btn" data-color="green" style="background: ${HIGHLIGHT_COLORS.green};" title="Verde"></button>
      <button class="color-btn" data-color="blue" style="background: ${HIGHLIGHT_COLORS.blue};" title="Azul"></button>
      <button class="color-btn" data-color="pink" style="background: ${HIGHLIGHT_COLORS.pink};" title="Rosa"></button>
      <div class="menu-separator"></div>
      <button class="remove-btn" title="Quitar subrayado">✕</button>
    `;
  } else {
    // Creating new highlight: only colors
    floatingMenu.innerHTML = `
      <button class="color-btn" data-color="yellow" style="background: ${HIGHLIGHT_COLORS.yellow};" title="Amarillo"></button>
      <button class="color-btn" data-color="green" style="background: ${HIGHLIGHT_COLORS.green};" title="Verde"></button>
      <button class="color-btn" data-color="blue" style="background: ${HIGHLIGHT_COLORS.blue};" title="Azul"></button>
      <button class="color-btn" data-color="pink" style="background: ${HIGHLIGHT_COLORS.pink};" title="Rosa"></button>
    `;
  }

  document.body.appendChild(floatingMenu);

  // Position menu using shared function
  updateFloatingMenuPosition(floatingMenu, selectionRect, isEditingExisting);

  // Animate in (instantaneous with requestAnimationFrame for smooth rendering)
  requestAnimationFrame(() => {
    if (floatingMenu) {
      floatingMenu.classList.add('visible');
    }
  });

  // Add click handlers for color buttons
  floatingMenu.querySelectorAll('.color-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const colorKey = btn.dataset.color;

      if (isEditingExisting && currentHighlightElement) {
        // Change color of existing highlight
        changeHighlightColor(currentHighlightElement, HIGHLIGHT_COLORS[colorKey]);
      } else {
        // Create new highlight
        applyHighlight(HIGHLIGHT_COLORS[colorKey]);
      }
    });
  });

  // Add click handler for remove button (if editing)
  if (isEditingExisting) {
    const removeBtn = floatingMenu.querySelector('.remove-btn');
    if (removeBtn) {
      removeBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (currentHighlightElement) {
          window.removeHighlight(currentHighlightElement);
        }
        hideFloatingMenu();
      });
    }
  }
}

function updateFloatingMenuPosition(menu, selectionRect, isEditingExisting) {
  const menuHeight = 48;
  const menuWidth = isEditingExisting ? 220 : 180;
  let top = selectionRect.top - menuHeight - 8;
  let left = selectionRect.left + (selectionRect.width / 2) - (menuWidth / 2);

  // Keep menu within viewport
  if (top < 10) {
    top = selectionRect.bottom + 8;
  }
  if (left < 10) left = 10;
  if (left + menuWidth > window.innerWidth - 10) {
    left = window.innerWidth - menuWidth - 10;
  }

  menu.style.top = `${top}px`;
  menu.style.left = `${left}px`;
}

function hideFloatingMenuIfOutside(event) {
  if (!floatingMenu) return;

  // ✅ CRITICAL: Don't hide if clicking inside menu
  if (event && floatingMenu.contains(event.target)) return;

  // ✅ CRITICAL: Don't hide if clicking inside .md-body (user might be selecting/extending text)
  const mdBody = document.querySelector('.md-body');
  if (event && mdBody && mdBody.contains(event.target)) return;

  // ✅ CRITICAL: Don't hide if there's an active selection (user might be extending it)
  const selection = window.getSelection();
  const selectedText = selection?.toString().trim();
  if (selectedText && selectedText.length > 0) return;

  // Only hide if clicking truly outside (not in menu, not in md-body, no active selection)
  hideFloatingMenu();
}

function hideFloatingMenu() {
  if (!floatingMenu) return;

  floatingMenu.remove();
  floatingMenu = null;
  currentSelection = null;
}

async function applyHighlight(color) {
  // ✅ CRITICAL FIX: Read selection directly from window instead of relying on cached currentSelection
  // This ensures we capture the LATEST selection, even if user extended it after debounce
  const selection = window.getSelection();

  if (!selection || selection.rangeCount === 0) {
    console.warn('No selection available');
    showToast('No hay texto seleccionado', 'error');
    return;
  }

  const range = selection.getRangeAt(0);
  const selectedText = selection.toString().trim();

  if (!selectedText || selectedText.length < 1) {
    console.warn('Selection is empty');
    showToast('No hay texto seleccionado', 'error');
    return;
  }

  // Verify selection is within .md-body
  const mdBody = document.querySelector('.md-body');
  const container = range.commonAncestorContainer;
  const isInMdBody = mdBody && (mdBody.contains(container) || container === mdBody);

  if (!isInMdBody) {
    console.warn('Selection is not within md-body');
    showToast('Selecciona texto dentro del documento', 'error');
    return;
  }

  try {
    // Extract contents and wrap in highlight span
    // This method works even with complex selections (multiple nodes, formatted text, etc.)
    const span = document.createElement('span');
    span.className = 'highlight';
    span.style.backgroundColor = color;
    span.style.borderRadius = '2px';
    span.style.padding = '1px 2px';
    span.style.cursor = 'pointer';
    span.title = 'Click para editar o mantén pulsado para eliminar';

    // Generate unique ID for this highlight element
    const highlightId = `hl-${Date.now()}`;
    span.dataset.highlightId = highlightId;

    // Extract the selected content (preserves formatting)
    const fragment = range.extractContents();
    span.appendChild(fragment);

    // Insert the wrapped content back
    range.insertNode(span);

    // Save highlight to file metadata
    const filePath = getCurrentFilePath();
    if (filePath) {
      const file = getFile(filePath);
      if (file) {
        const highlights = file.highlights || [];
        highlights.push({
          id: highlightId,
          text: selectedText,
          color: color,
          timestamp: new Date().toISOString()
        });

        await updateFileMetadata(filePath, { highlights });
        showToast('Texto subrayado', 'success');
      }
    }
  } catch (e) {
    console.error('Error highlighting text:', e);
    showToast('Error al subrayar: ' + e.message, 'error');
  }

  // Clear selection and hide menu
  selection.removeAllRanges();
  hideFloatingMenu();
}

// Change color of existing highlight
async function changeHighlightColor(highlightElement, newColor) {
  if (!highlightElement) return;

  const highlightId = highlightElement.dataset.highlightId;
  const text = highlightElement.textContent;

  // Update visual color
  highlightElement.style.backgroundColor = newColor;

  // Update metadata
  const filePath = getCurrentFilePath();
  if (filePath) {
    const file = getFile(filePath);
    if (file && file.highlights) {
      // Find and update the highlight in metadata (by ID or fallback to text)
      const highlightIndex = file.highlights.findIndex(h => {
        if (highlightId) {
          return h.id === highlightId;
        } else {
          return h.text === text;
        }
      });

      if (highlightIndex !== -1) {
        file.highlights[highlightIndex].color = newColor;
        file.highlights[highlightIndex].timestamp = new Date().toISOString();
        await updateFileMetadata(filePath, { highlights: file.highlights });
        showToast('Color cambiado', 'success');
      }
    }
  }

  hideFloatingMenu();
}

export async function clearAllHighlights(filePath) {
  await updateFileMetadata(filePath, { highlights: [] });

  // Remove visual highlights
  const highlights = document.querySelectorAll('.md-body .highlight');
  highlights.forEach(highlight => {
    const parent = highlight.parentNode;
    parent.replaceChild(document.createTextNode(highlight.textContent), highlight);
  });

  showToast('Todos los subrayados eliminados', 'success');
}


export async function removeHighlight(highlightElement) {
  const filePath = getCurrentFilePath();
  if (!filePath) return;

  const file = getFile(filePath);
  if (!file) return;

  // Get the highlight ID (unique identifier)
  const highlightId = highlightElement.dataset.highlightId;
  const text = highlightElement.textContent;

  // Remove from metadata
  if (file.highlights) {
    // Try to match by ID first, fallback to text if ID not found
    file.highlights = file.highlights.filter(h => {
      if (highlightId) {
        return h.id !== highlightId;
      } else {
        return h.text !== text;
      }
    });
    await updateFileMetadata(filePath, { highlights: file.highlights });
  }

  // Remove visual highlight (replace with text nodes, preserving formatting)
  const parent = highlightElement.parentNode;

  // Move all child nodes out of the highlight span
  while (highlightElement.firstChild) {
    parent.insertBefore(highlightElement.firstChild, highlightElement);
  }

  // Remove the now-empty highlight span
  parent.removeChild(highlightElement);

  showToast('Subrayado eliminado', 'success');
}

// Helper to get current file path from DOM
function getCurrentFilePath() {
  const activeTab = document.querySelector('.tab.active');
  return activeTab?.dataset?.path || null;
}

export function restoreHighlights(file) {
  if (!file.highlights || file.highlights.length === 0) return;

  const contentArea = document.querySelector('.md-body');
  if (!contentArea) return;

  // Note: This is a simple implementation
  // For better results, store DOM positions or line numbers
  for (const highlight of file.highlights) {
    const walker = document.createTreeWalker(
      contentArea,
      NodeFilter.SHOW_TEXT,
      null,
      false
    );

    let node;
    while (node = walker.nextNode()) {
      const index = node.textContent.indexOf(highlight.text);
      if (index !== -1) {
        try {
          const range = document.createRange();
          range.setStart(node, index);
          range.setEnd(node, index + highlight.text.length);

          const span = document.createElement('span');
          span.className = 'highlight';
          span.style.backgroundColor = highlight.color;
          span.style.borderRadius = '2px';
          span.style.padding = '1px 2px';
          span.style.cursor = 'pointer';
          span.title = 'Click para editar o mantén pulsado para eliminar';
          span.dataset.highlightId = highlight.id; // ✅ Important: Restore the ID

          // Extract and wrap content (better than surroundContents for complex selections)
          const fragment = range.extractContents();
          span.appendChild(fragment);
          range.insertNode(span);

          break; // Only highlight first occurrence
        } catch (e) {
          console.error('Error restoring highlight:', e);
        }
      }
    }
  }
}


// -- Star/Favorite System --

export async function toggleStarred(filePath) {
  const file = getFile(filePath);
  if (!file) return;

  file.starred = !file.starred;
  await updateFileMetadata(filePath, { starred: file.starred });

  // Update UI
  const btn = document.querySelector('.btn-starred');
  if (btn) {
    btn.textContent = file.starred ? '⭐' : '☆';
    btn.title = file.starred ? 'Quitar de favoritos' : 'Añadir a favoritos';
  }

  // Update sidebar
  const { renderTree } = await import('./render.js');
  await renderTree();

  showToast(file.starred ? 'Añadido a favoritos' : 'Quitado de favoritos', 'success');
}
