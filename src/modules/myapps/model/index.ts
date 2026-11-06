/**
 * Model of « Mes applis »: the apps of the ENT, the preferences of the user about them, and how an app opens.
 * It knows nothing of where they come from or where they are kept (API, store, storage), nor of the modules of the app: the rules
 * are given what they need. They are grouped by purpose: `display.ts`, `opening.ts`, `classification.ts` (categories, libraries,
 * filters), `favorites.ts`, `onboarding.ts`.
 *
 * Three independent data, never mixed: the apps, the preferences (favorites) and the modules available for the user. They are
 * combined when read (hooks, `filterApps`).
 */

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
  /** Name shown (see `display.ts`). */
  label: string;
  /** Icon (see `display.ts`). */
  icon: string;
  /** Key of `theme.palette.complementary` (see `display.ts`). None: the default theme applies. */
  color?: string;
  category: AppCategory;
  /** See `classification.ts`. */
  isLibrary: boolean;
  /** Language → URL of the help. Empty without help. */
  helpUrls: Record<string, string>;
  /** Listed in « Mes applis ». The others are kept: other modules need them (theme, labels). */
  display: boolean;
  /** « /actualites », or an absolute URL. */
  address: string;
  /** Its address can only be opened through `/auth/redirect`, whatever the modules of the app (see `opening.ts`). */
  isConnector: boolean;
}

/** Preferences of the user about the apps. */
export interface AppsPreferences {
  /** Given back as it is when the preferences are saved. When not empty, it restricts the favorites (see `favorites.ts`). */
  applications: string[];
  /** Names of the favorite apps. */
  favorites: string[];
}

export const EMPTY_PREFERENCES: AppsPreferences = { applications: [], favorites: [] };

/** What « Mes applis » knows of the module of an app: plain data, not the module itself. */
export interface AppModule {
  name: string;
  /** Its entry route: without one, the module can't be opened (see `useOpenModule`). */
  entry?: string;
}

/**
 * How an app opens. It depends on the modules available for the user: computed when read, never kept (see `opening.ts`).
 * - `module`: a module of the app, opened with `useOpenModule`;
 * - `web`: its address, in the browser;
 * - `connector`: its address through `/auth/redirect`, in the browser.
 */
export type AppOpeningStrategy =
  { kind: 'module'; moduleName: string } | { kind: 'web'; url: string } | { kind: 'connector'; url: string };
