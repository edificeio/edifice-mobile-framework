/**
 * How an app is shown: its icon, its color, its help. Its label is the one of the server (`appName`, see `service/adapter.ts`).
 */
import { isThemeColorName, type ThemeColorName } from '~/app/theme';
import { normalizeString } from '~/modules/myapps/util';

// # Icon
//
// Rule inherited from the old module (`aggregateApps`, `normalizeIconName`): the server names its icons its own way
// (« actualites-large »), and some apps have their icon under another name in the app. Three steps, in order.
// The server may also give the path or the URL of an image: it is kept as it is (steps 2 and 3 only apply to a name of icon).

/** Step 1: icons set by the name of the app, whatever the server sends. */
const ICON_OVERRIDES: Record<string, string> = {
  Directory: 'userbook',
};

/** Step 3: normalized icons of the server that the app has under another name. */
const ICON_RENAMES: Record<string, string> = {
  viescolaire: 'parametrage',
};

/** Step 2: icon of the server without its `-large` suffix (the app has one icon for both sizes), in lower case, without accents. */
export const normalizeIconName = (icon: string): string => normalizeString(icon.replace(/-large$/, ''));

/** The icon is a name of icon (« blog »), not the path or the URL of an image (`/workspace/…`, `https://…/icon.png`). */
export const isIconName = (icon: string): boolean => !icon.includes('/') && !icon.includes('.');

export const getAppIcon = (app: { name: string; icon?: string | null }): string => {
  const override = ICON_OVERRIDES[app.name];
  if (override !== undefined) return override;
  const icon = app.icon ?? '';
  // A path or a URL may be case-sensitive: not normalized
  if (!isIconName(icon)) return icon;
  const normalized = normalizeIconName(icon);
  return ICON_RENAMES[normalized] ?? normalized;
};

// # Color
//
// A color of the palette (`ThemeColorName`, « orange »). Rule inherited from the old module (`aggregateApps`). One case per branch,
// in order:
// 1. set by the name of the app, whatever the server sends (`COLOR_OVERRIDES`);
// 2. the color of its config, if the palette has it: its own, or that of `library-info` for a library (see `getAppConfig`,
//    `classification.ts`);
// 3. none (no color, or one the palette doesn't have): the default colors apply when the app is shown.

const COLOR_OVERRIDES: Record<string, ThemeColorName> = {
  Directory: 'green',
};

/** @param configColor the color of the config of the app, as the server names it (see `getAppConfig`). */
export const getAppColor = (appName: string, configColor: string | undefined): ThemeColorName | undefined => {
  // 1. Set by the name of the app
  const override = COLOR_OVERRIDES[appName];
  if (override !== undefined) return override;
  // 2. Color of its config, if the palette has it
  if (isThemeColorName(configColor)) return configColor;
  // 3. None
  return undefined;
};

// # Help
//
// A URL by language.

const HELP_FALLBACK_LANGUAGE = 'fr';

/** URL of the help in the language, else in its base language (`fr-FR` → `fr`), else in French. */
export const getHelpUrl = (helpUrls: Record<string, string>, language: string): string | undefined =>
  helpUrls[language] || helpUrls[language.split('-')[0]] || helpUrls[HELP_FALLBACK_LANGUAGE] || undefined;
