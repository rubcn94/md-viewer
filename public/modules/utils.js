// ── Utility Functions ──────────────────────────────────

export function base64ToUtf8(base64) {
  const binaryString = atob(base64);

  try {
    const bytes = Uint8Array.from(binaryString, c => c.charCodeAt(0));
    return new TextDecoder('utf-8', { fatal: true }).decode(bytes);
  } catch (e) {
    try {
      const bytes = Uint8Array.from(binaryString, c => c.charCodeAt(0));
      return new TextDecoder('iso-8859-1').decode(bytes);
    } catch (e2) {
      return binaryString;
    }
  }
}

export function fixEncoding(text) {
  return text
    .replace(/Ã¡/g, 'á')
    .replace(/Ã©/g, 'é')
    .replace(/Ã­/g, 'í')
    .replace(/Ã³/g, 'ó')
    .replace(/Ãº/g, 'ú')
    .replace(/Ã±/g, 'ñ')
    .replace(/Ã/g, 'Á')
    .replace(/Ã‰/g, 'É')
    .replace(/Ã/g, 'Í')
    .replace(/Ã"/g, 'Ó')
    .replace(/Ãš/g, 'Ú')
    .replace(/Ã'/g, 'Ñ')
    .replace(/Ã¼/g, 'ü')
    .replace(/Ãœ/g, 'Ü')
    .replace(/Ã€/g, 'À')
    .replace(/Ã¨/g, 'è')
    .replace(/Ã¬/g, 'ì')
    .replace(/Ã²/g, 'ò')
    .replace(/Ã¹/g, 'ù')
    .replace(/Â¿/g, '¿')
    .replace(/Â¡/g, '¡');
}

export function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

export function escapeAttr(text) {
  return text.replace(/'/g, "\\'").replace(/"/g, '&quot;');
}
