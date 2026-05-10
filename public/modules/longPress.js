// ── Long Press Detection ──────────────────────────────

let pressTimer = null;
const LONG_PRESS_DURATION = 500; // milliseconds

export function initLongPress() {
  // Setup listeners immediately if DOM is ready, otherwise wait
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupLongPressListeners, { once: true });
  } else {
    setupLongPressListeners();
  }
}

function setupLongPressListeners() {
  const fileTree = document.getElementById('fileTree');
  if (!fileTree) return;

  // Use event delegation for dynamically created elements
  fileTree.addEventListener('touchstart', handleTouchStart, { passive: true });
  fileTree.addEventListener('touchend', handleTouchEnd);
  fileTree.addEventListener('touchmove', handleTouchMove);
  fileTree.addEventListener('contextmenu', handleContextMenu);

  // Also support mouse long-press for desktop
  fileTree.addEventListener('mousedown', handleMouseDown);
  fileTree.addEventListener('mouseup', handleMouseUp);
  fileTree.addEventListener('mouseleave', cancelLongPress);
}

function handleTouchStart(event) {
  const target = findFileOrFolderTarget(event.target);
  if (!target) return;

  pressTimer = setTimeout(() => {
    showDeleteMenu(target, event.touches[0].clientX, event.touches[0].clientY);
  }, LONG_PRESS_DURATION);
}

function handleTouchEnd(event) {
  cancelLongPress();
}

function handleTouchMove(event) {
  cancelLongPress();
}

function handleMouseDown(event) {
  // Only trigger on primary button
  if (event.button !== 0) return;

  const target = findFileOrFolderTarget(event.target);
  if (!target) return;

  pressTimer = setTimeout(() => {
    showDeleteMenu(target, event.clientX, event.clientY);
  }, LONG_PRESS_DURATION);
}

function handleMouseUp(event) {
  cancelLongPress();
}

function handleContextMenu(event) {
  const target = findFileOrFolderTarget(event.target);
  if (target) {
    event.preventDefault();
    showDeleteMenu(target, event.clientX, event.clientY);
  }
}

function cancelLongPress() {
  if (pressTimer) {
    clearTimeout(pressTimer);
    pressTimer = null;
  }
}

function findFileOrFolderTarget(element) {
  // Find closest file-item or folder-item
  const fileItem = element.closest('.file-item');
  const folderItem = element.closest('.folder-item');

  if (fileItem) {
    return { type: 'file', element: fileItem, path: fileItem.dataset.path };
  } else if (folderItem) {
    return { type: 'folder', element: folderItem, path: folderItem.dataset.folder };
  }

  return null;
}

function showDeleteMenu(target, x, y) {
  // Remove existing menu if any
  const existingMenu = document.getElementById('contextMenu');
  if (existingMenu) {
    existingMenu.remove();
  }

  const menu = document.createElement('div');
  menu.id = 'contextMenu';
  menu.className = 'context-menu';
  menu.style.position = 'fixed';
  menu.style.left = `${x}px`;
  menu.style.top = `${y}px`;

  const itemName = target.type === 'file'
    ? target.element.querySelector('.file-name')?.textContent
    : target.element.querySelector('.folder-name')?.textContent;

  menu.innerHTML = `
    <div class="context-menu-item context-menu-delete" data-action="delete">
      <span style="color: var(--red);">🗑️</span>
      <span>Eliminar ${target.type === 'file' ? 'archivo' : 'carpeta'}</span>
    </div>
    <div class="context-menu-item" data-action="cancel">
      <span>✕</span>
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
  menu.addEventListener('click', (e) => {
    const action = e.target.closest('[data-action]')?.dataset.action;

    if (action === 'delete') {
      if (target.type === 'file') {
        window.removeFile(target.path);
      } else {
        window.removeFolder(target.path);
      }
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
