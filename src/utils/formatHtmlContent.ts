/**
 * Normalize and clean legacy HTML content before rendering in the RichEditor.
 * - Fixes deprecated or malformed tags
 * - Removes redundant/empty elements
 * - Normalizes entities and spacing
 * - Ensures valid structure for modern HTML rendering
 */
export const formatLegacyHtmlContent = (html?: string): string => {
  if (!html) return '';

  const log = (...args: any[]) => {
    if (__DEV__) console.debug('[🧩 formatLegacyHtmlContent]', ...args);
  };

  let formatted = html;
  log('🧾 Original HTML (excerpt):', formatted.slice(0, 120), '...');

  // === Basic cleanup ===
  formatted = formatted
    .replace(/&nbsp;/g, ' ')
    .replace(/&apos;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&');
  log('✅ Entities normalized');

  formatted = formatted.replace(/<p>(\s|<br\s*\/?>|​)*<\/p>/gi, '').replace(/<div>(\s|<br\s*\/?>|​)*<\/div>/gi, '');
  log('🧹 Empty elements removed');

  // === Deprecated tag conversion ===
  formatted = formatted
    .replace(/<b\b[^>]*>(.*?)<\/b>/gi, '<strong>$1</strong>')
    .replace(/<i\b[^>]*>(.*?)<\/i>/gi, '<em>$1</em>')
    .replace(/<u\b[^>]*>(.*?)<\/u>/gi, '<span style="text-decoration:underline;">$1</span>')
    .replace(/<strike\b[^>]*>(.*?)<\/strike>/gi, '<del>$1</del>')
    .replace(/<center\b[^>]*>(.*?)<\/center>/gi, '<p style="text-align:center;">$1</p>');
  log('🔄 Deprecated tags converted');

  // === Cleanup of redundant elements ===
  formatted = formatted.replace(/<\/?(font)[^>]*>/gi, '');
  formatted = formatted.replace(/\s?(align|bgcolor|valign|width|height)="[^"]*"/gi, '');
  log('🚫 Redundant tags & attributes removed');

  // === Visual normalization ===
  formatted = formatted.replace(/(<br\s*\/?>\s*){2,}/gi, '<br/>').trim();
  log('✨ Visual cleanup done');

  // === Final wrapping ===
  if (!/^<\s*(html|body|div|p|section)/i.test(formatted)) {
    formatted = `<div>${formatted}</div>`;
    log('📦 Wrapped inside <div>');
  } else {
    log('✅ Already wrapped correctly');
  }

  log('✅ Final formatted HTML (excerpt):', formatted.slice(0, 120), '...');
  return formatted;
};
