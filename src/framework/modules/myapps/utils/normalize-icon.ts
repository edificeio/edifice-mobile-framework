import { normalizeString } from './app-i18n';

/**
 * Normalize icon names by removing '-large' suffix
 * Reduces the number of images needed: uses the same icon for both -large and base variants
 */
export function normalizeIconName(iconName: string): string;
export function normalizeIconName(iconName: string | undefined): string | undefined;
export function normalizeIconName(iconName?: string): string | undefined {
  if (!iconName) return iconName;

  return normalizeString(iconName.replace(/-large$/, ''));
}
