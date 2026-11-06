/**
 * How an app is shown: its label, its icon, its color, its help.
 */
import { isThemeColorName, type ThemeColorName } from '~/app/theme';
import type { EntApp, Translate } from '~/modules/myapps/model';
import { normalizeString } from '~/modules/myapps/util';

// # Label
//
// Rule inherited from the old module (`getAppName`): the server sends a key (`displayName`), not a label, and the app has its own
// translations of the apps (`myapps-app-*`). Several sources are tried in order: the first that gives a label wins.
//
// The label is computed when the apps are received, in the language of that moment (see `docs/migrations/later.md`, language).
// ToDo(myapps-migration): the label translated by the server (`appName`) could become the first source (`docs/migrations/later.md`).

/** What the label is computed from. */
interface LabelSourceData {
  name: string;
  /** « actualites »: a key, not a label. */
  displayName?: string | null;
  /** « /actualites ». */
  prefix?: string | null;
}

type LabelSource = (app: LabelSourceData, translate: Translate) => string | undefined;

/** The translation of a key, if it has one. */
const translateKey = (translate: Translate, key: string): string | undefined => {
  const translated = translate(key);
  return translated !== key ? translated : undefined;
};

/** The sources of the label, in order. */
const LABEL_SOURCES: LabelSource[] = [
  // 1. Translation of `myapps-app-<prefix without "/">`
  (app, translate) => (app.prefix ? translateKey(translate, `myapps-app-${app.prefix.substring(1)}`) : undefined),
  // 2. Translation of `myapps-app-<normalized displayName>`
  (app, translate) => (app.displayName ? translateKey(translate, `myapps-app-${normalizeString(app.displayName)}`) : undefined),
  // 3. `displayName` translated as a key, or as it is
  (app, translate) => (app.displayName ? translate(app.displayName) : undefined),
  // 4. The identifier
  app => app.name,
];

export const getAppLabel = (app: LabelSourceData, translate: Translate): string =>
  LABEL_SOURCES.reduce<string | undefined>((label, source) => label || source(app, translate), undefined) || app.name;

// # Icon
//
// Rule inherited from the old module (`aggregateApps`, `normalizeIconName`): the server names its icons its own way
// (« actualites-large »), and some apps have their icon under another name in the app. Three steps, in order.

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

export const getAppIcon = (app: { name: string; icon?: string | null }): string => {
  const override = ICON_OVERRIDES[app.name];
  if (override !== undefined) return override;
  const normalized = normalizeIconName(app.icon ?? '');
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

export const hasHelpUrl = (helpUrls: Record<string, string>): boolean => Object.values(helpUrls).some(url => !!url);

/** URL of the help in the language, else in its base language (`fr-FR` → `fr`), else in French. */
export const getHelpUrl = (helpUrls: Record<string, string>, language: string): string | undefined =>
  helpUrls[language] || helpUrls[language.split('-')[0]] || helpUrls[HELP_FALLBACK_LANGUAGE] || undefined;

// # Label of a module (tabs)
//
// Rule inherited from the old module (`getTabModuleDisplayName`): the label of the app of the module, else the translation
// `myapps-app-<…>` of its app name, of its own name, then of its aliases; else its name.

/** Other names of a module in the translations (`myapps` was the app `Portal`). */
const MODULE_LABEL_ALIASES: Record<string, string[]> = {
  myapps: ['portal'],
};

/** @param app the app of the module (`matchEntcoreApp`), if the user has it. */
export const getModuleLabel = (
  module: { name: string; matchEntcoreApp?: string },
  app: Pick<EntApp, 'label'> | undefined,
  translate: Translate,
): string => {
  if (app) return app.label;
  const values = [module.matchEntcoreApp, module.name, ...(MODULE_LABEL_ALIASES[module.name] ?? [])];
  return (
    values.reduce<string | undefined>(
      (label, value) => label || (value ? translateKey(translate, `myapps-app-${value}`) : undefined),
      undefined,
    ) || module.name
  );
};
