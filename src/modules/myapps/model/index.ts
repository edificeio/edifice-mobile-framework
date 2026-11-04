/**
 * Model of « Mes applis »: the apps of the ENT, the preferences of the user about them, and how an app opens.
 * It knows nothing of where they come from or where they are kept (API, store, storage), nor of the modules of the app: the rules
 * are given what they need. They are grouped by purpose: `display.ts`, `opening.ts`, `classification.ts` (categories, libraries,
 * filters), `favorites.ts`, `onboarding.ts`.
 *
 * Three independent data, never mixed: the apps, the preferences (favorites) and the modules available for the user. They are
 * combined when read (hooks, `filterApps`).
 */
import type { ThemeColorName } from '~/app/theme';

/** Categories of apps that the app knows. */
export const APP_CATEGORIES = ['communication', 'pedagogy', 'organisation'] as const;
export type KnownAppCategory = (typeof APP_CATEGORIES)[number];
/** Category of an app: one the app knows, or `other`. */
export type AppCategory = KnownAppCategory | 'other';

/**
 * An app of the ENT, built when received (see `service/adapter.ts`). It depends only on what the server sent (and on the language of
 * its label): neither the favorites nor the modules of the app are in it.
 */
export interface EntApp {
  /** Identifier (« Actualites »): what `matchEntcoreApp` of a module and the favorites refer to. */
  name: string;
  /** Name shown, translated by the server in the language of the request (`appName`). */
  label: string;
  /** Icon (see `display.ts`). */
  icon: string;
  /** A color of the palette (see `display.ts`). None: the default colors apply. */
  color?: ThemeColorName;
  category: AppCategory;
  /** See `classification.ts`. */
  isLibrary: boolean;
  /** Language → URL of the help. Empty without help. */
  helpUrls: Record<string, string>;
  /** Listed in « Mes applis ». The others are kept: other modules need them (theme, labels). */
  display: boolean;
  /** « /actualites », or an absolute URL. Opened through `/auth/redirect` when the app has no module (see `opening.ts`). */
  address: string;
}

/** Preferences of the user about the apps. */
export interface AppsPreferences {
  /** Given back as it is when the preferences are saved: the app doesn't use it. */
  applications: string[];
  /** Names of the favorite apps. */
  favorites: string[];
}

export const EMPTY_PREFERENCES: AppsPreferences = { applications: [], favorites: [] };

// # Rules (types of their parameters)

/** What an app takes from its config: its own, or that of `library-info` for a library. */
export interface AppConfig {
  category?: string;
  /** As the server names it: checked by `getAppColor`. */
  color?: string;
  helpUrls: Record<string, string>;
}

/** `other-services` lists the `isOtherService` apps: not the same as `category: 'other'`. */
export type MyAppsFilter =
  | { type: 'all' }
  | { type: 'favorites' }
  | { type: 'category'; value: KnownAppCategory }
  | { type: 'other-services' }
  | { type: 'libraries' }
  | { type: 'search'; value: string };

/** An app in the list of « Mes applis », with what the filters and the cards need to know of it (see `toListedApps`). */
export interface ListedApp {
  app: EntApp;
  isFavorite: boolean;
  /** Shown apart, at the bottom of the lists (see `isOtherService`). */
  isOtherService: boolean;
  /** A module of the app matches it, for the user: the app opens in the app, else in the browser (see `opening.ts`). */
  hasModule: boolean;
}
