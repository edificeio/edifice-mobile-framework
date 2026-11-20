import { normalizeString } from './app-i18n';

const HTTPS_URL_REGEX = /^https:\/\//i;

/**
 * Normalize icon names by removing '-large' suffix
 * Reduces the number of images needed: uses the same icon for both -large and base variants
 */
export function normalizeIconName(iconName: string): string;
export function normalizeIconName(iconName: string | undefined): string | undefined;
export function normalizeIconName(iconName?: string): string | undefined {
  if (!iconName) return iconName;
  // External URLs are case-sensitive: lowercased, they point to another file.
  if (HTTPS_URL_REGEX.test(iconName)) return iconName;

  return normalizeString(iconName.replace(/-large$/, ''));
}
