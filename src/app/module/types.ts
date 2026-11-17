import type React from 'react';

import type { createNativeStackScreen } from '@react-navigation/native-stack';
import type { Action, Reducer } from 'redux';

import type importModules from '~/app/config/modules';
import type { ScreenComponent, ScreenTelemetryConfig } from '~/app/navigation-new/types';
import type { SvgIconName } from '~/framework/components/picture';
import type { IModuleFileManagerConfig } from '~/framework/util/fileHandler/types';
import type { StorageHandler } from '~/framework/util/storage/storage-handler';
import type { AuthActiveAccount, AuthLoggedAccount } from '~/modules/auth/model';

import { Module } from '.';

/**
 * Entcore data
 */

export namespace Entcore {
  export interface App {
    name: string;
  }

  export interface Connector {
    name: string;
  }

  export interface Widget {
    name: string;
  }
}

/**
 * Screens (or modals) of a module, indexed by route name.
 * Route names must be prefixed by the module name : keys that don't match are resolved to `never`.
 */
export type StrictModuleScreens<Name extends string, T> = {
  [K in keyof T]: K extends `${Name}` | `${Name}/${string}` ? T[K] : never;
};

/**
 * Navigation params of a screen, inferred from the props of its component.
 */
export type NavigationParamsOfScreen<C> = C extends React.ComponentType<{ route: { params: infer P } }> ? P : undefined;

/**
 * Navigation params of each route, inferred from the components given to the module.
 */
export type NavigationParamsOfScreens<Components> = {
  [RouteName in keyof Components]: NavigationParamsOfScreen<Components[RouteName]>;
};

/**
 * Routes of the screens that open without params: the ones a module can give in its `entries`.
 * An entry opens its screen with no params at all (`route.params` is `undefined`, not `{}`): `undefined` must be one of its params.
 * - `StaticScreenProps<undefined>`: qualifies.
 * - `StaticScreenProps<{ a?: string } | undefined>`: qualifies (optional params, read with `route.params?.a`).
 * - `StaticScreenProps<{ a?: string }>`: doesn't qualify, its params say there is always an object. Add `| undefined`.
 */
export type EntryRoute<Components> = {
  [RouteName in keyof Components]: undefined extends NavigationParamsOfScreen<Components[RouteName]> ? RouteName : never;
}[keyof Components];

/**
 * Config of each screen (or modal) given to a module : same as the config given to `createNativeStackScreen`.
 * `Components` (route name -> screen component) is inferred from it.
 */
export type ModuleScreensConfig<Components extends Record<string, ScreenComponent>> = {
  [RouteName in keyof Components]: Parameters<typeof createNativeStackScreen<Components[RouteName]>>[0] & ScreenTelemetryConfig;
};

/**
 * Screens (or modals) of a module as returned by `createNativeStackScreen`,
 * ready to be given to `createNativeStackNavigator({ screens })`.
 */
export type ModuleStaticScreens<Components extends Record<string, ScreenComponent>> = {
  [RouteName in keyof Components]: ReturnType<typeof createNativeStackScreen<Components[RouteName]>>;
};

/**
 * ModuleConfig
 */

export interface ConfigForRights {
  // Name that matches to an Entcore App `name` field.
  matchEntcoreApp?: string;

  // Name that matches to an Entcore Widget `name` field.
  matchEntcoreWidget?: string;

  // Additionnal verifications needed to consider have right to access this module.
  // This logic will be cumulated with the default one (based on matchEntcoreApp/Widget) and both needs to return true to show the module to the user.
  hasRight?: (session: AuthActiveAccount) => boolean;
}

/** Entry of a module in « Mes applis »: the module can be opened from elsewhere (`useOpenModule`). */
export interface ConfigForMyAppsEntry<Route extends PropertyKey> {
  // Route that opens the module: one of its screens, that needs no params.
  route: Route;
}

/** Entry of a module in the tab bar. */
export interface ConfigForTabEntry<Route extends PropertyKey> {
  // Route of the home of the tab: one of the screens of the module, that needs no params.
  route: Route;

  // Visible icon when the tab is not active
  iconInactive: SvgIconName;

  // Visible icon when the tab is active
  iconActive: SvgIconName;

  // Value to tell in which order the tabs must be displayed
  order?: number;

  // TestID of the tab bar button
  testId: string;

  // Key (i18n) of the label of the tab. Without it, the label is the one of the app of the module (`appName`, loaded by `myapps`),
  // else the name of the module (see `getTabLabel`).
  labelI18n?: string;
}

/** Section of the home of the module `user` where a link of `entries.userMenu` is shown. */
export type UserMenuSection = 'configuration' | 'others';

/** A link that a module adds to the home of the module `user` (« Mon compte »), which knows nothing of the module. */
export interface ConfigForUserMenuEntry<Route extends PropertyKey> {
  // Route that the link opens: one of the screens of the module, that needs no params.
  route: Route;

  // Key (i18n) of the label of the link.
  labelI18n: string;

  // Icon shown before the label.
  icon: SvgIconName;

  // TestID of the link.
  testID: string;

  // Section of the home where the link is shown.
  section: UserMenuSection;

  // Order of the link in its section, among the links of all modules (ascending; links without one come last, in the order of the
  // modules). They are all shown before the own links of `user`.
  order?: number;
}

/**
 * Places where a module can be opened from. Each entry has a `route`: one of the screens of the module that needs no params
 * (`EntryRoute`). A module without any can only be reached by the navigation of other screens.
 */
export interface ConfigForEntries<Route extends PropertyKey> {
  // « Mes applis » (and `useOpenModule`: notifications, intents...).
  myApps?: ConfigForMyAppsEntry<Route>;

  // The tab bar. Opening the module (`useOpenModule`) jumps to its tab when it has one.
  tab?: ConfigForTabEntry<Route>;

  // Links in the home of the module `user` (« Mon compte »).
  userMenu?: readonly ConfigForUserMenuEntry<Route>[];
}

interface ConfigForRedux<State = undefined, ActionType extends Action = never> {
  // Reducer instance of this module
  reducer: Reducer<State, ActionType>;
}

export interface SessionHookOptions {
  signal: AbortSignal;
}

/** What `sessionSetup` gives back: `commit` writes what it loaded, once the session is created. */
export type SessionSetupResult = void | { commit: () => void };

/**
 * What a module can do when sessions start and end. A session starts when an account becomes usable (signed in, nothing left to
 * fulfil) and ends when it stops being (switch, logout, deletion, new requirement).
 */
export interface ConfigForSession {
  /**
   * Loads what the app can't show without, before the session is created (the sign-in waits for it). It runs on an account that
   * is not connected yet, maybe while the previous session still runs: write nothing, give the `commit` that writes it, which the
   * framework calls once the session exists (before `onSessionStart`). Use `accountFetch(session, …)`, not `sessionFetch`.
   * A failure makes the sign-in fail (`SessionSetupError`) and no `commit` is called, for any module. It has no delay of its own: the
   * timeout of each request applies.
   * Everything that can be shown while loading belongs in `onSessionStart`.
   */
  sessionSetup?: (session: AuthActiveAccount, options: SessionHookOptions) => SessionSetupResult | Promise<SessionSetupResult>;

  /**
   * Called when a session starts. Not awaited: modules are independent and
   * a failure is only logged. Not called at launch, nor when a restore fails.
   * Stop local work (timers, subscriptions) on `signal`, aborted when the session ends. It says nothing about what happens when the
   * app is killed: for what must be undone anyway (a registration on a server), use `onSessionRelease`.
   */
  onSessionStart?: (session: AuthActiveAccount, options: SessionHookOptions) => void | Promise<void>;

  /**
   * Undoes what the sessions of an account left durably (the pair of `onSessionStart`). Called by the framework when the session
   * of the account ends, when another session starts (for every other account with tokens: it catches up what was missed or failed),
   * and before an account with tokens is deleted. Never at launch. Must do nothing when there is nothing to undo.
   * The requests it makes with `accountFetch(account, …)` work although the session is over (the account given carries its tokens,
   * even if the store has dropped them), and are only limited by the timeout of a request. A release that fails is not retried
   * before the next session starts.
   */
  onSessionRelease?: (account: AuthLoggedAccount) => void | Promise<void>;
}

/** What the framework needs to know of a loaded module to run the sessions. */
export type ModuleWithSessionLifecycle = { name: string } & ConfigForSession;

export interface ModuleConfig<
  Name extends string,
  Screens extends Record<string, ScreenComponent> & StrictModuleScreens<Name, Screens> = {},
  Modals extends Record<string, ScreenComponent> & StrictModuleScreens<Name, Modals> = {},
  ReduxState = undefined,
  ReduxAction extends Action = never,
  Entries extends ConfigForEntries<EntryRoute<Screens>> = {},
  Scope extends string = never,
> extends ConfigForSession {
  // Technical name of this module. Needs to be the same as its folder name.
  name: Name;

  // Scopes of the OAuth2 token that the APIs of this module need (`timeline`, `userbook`...): the token asks for those of every module.
  // A scope is most often the first segment of the paths it covers (`/timeline/...`): `getModuleTransport` relies on it.
  scope?: readonly Scope[];

  // Where the module can be opened from: « Mes applis » (`myApps`), the tab bar (`tab`), the home of `user` (`userMenu`). Without
  // `myApps`, the module can't be opened from elsewhere (`useOpenModule`: « Mes applis », notifications...).
  entries?: Entries;

  // Screens and Modals, each one configured like with `createNativeStackScreen`.
  screens?: ModuleScreensConfig<Screens>;
  modals?: ModuleScreensConfig<Modals>;

  // Redux configuration
  redux?: ConfigForRedux<ReduxState, ReduxAction>;

  // The storages of this module that have migrations (given to `Storage.device` / `Storage.account`). They must be declared here:
  // the migrations run at the app startup for the declared ones, and a storage with migrations that is not declared throws when used.
  storages?: readonly StorageHandler<any>[];

  // What the user can pick (camera, gallery, documents...) in this module, by use case: `FileManager.pick({ module, usecase })` reads it.
  fileManager?: IModuleFileManagerConfig;
}

export interface CoreModuleConfig<
  Name extends string,
  Screens extends Record<string, ScreenComponent> & StrictModuleScreens<Name, Screens> = {},
  Modals extends Record<string, ScreenComponent> & StrictModuleScreens<Name, Modals> = {},
  ReduxState = undefined,
  ReduxAction extends Action = never,
  Entries extends ConfigForEntries<EntryRoute<Screens>> = {},
  Scope extends string = never,
> extends ModuleConfig<Name, Screens, Modals, ReduxState, ReduxAction, Entries, Scope> {}

export interface EntModuleConfig<
  Name extends string,
  Screens extends Record<string, ScreenComponent> & StrictModuleScreens<Name, Screens> = {},
  Modals extends Record<string, ScreenComponent> & StrictModuleScreens<Name, Modals> = {},
  ReduxState = undefined,
  ReduxAction extends Action = never,
  Entries extends ConfigForEntries<EntryRoute<Screens>> = {},
  Scope extends string = never,
>
  extends ModuleConfig<Name, Screens, Modals, ReduxState, ReduxAction, Entries, Scope>, ConfigForRights {
  entTrackingName?: string;
}

export type TabModule<
  Name extends string,
  Screens extends Record<string, ScreenComponent> & StrictModuleScreens<Name, Screens> = {},
  Modals extends Record<string, ScreenComponent> & StrictModuleScreens<Name, Modals> = {},
  ReduxState = undefined,
  ReduxAction extends Action = never,
  Entries extends ConfigForEntries<EntryRoute<Screens>> = {},
  Scope extends string = never,
> = Omit<Module<Name, Screens, Modals, ReduxState, ReduxAction, Entries, Scope>, 'entries'> & {
  entries: Module<Name, Screens, Modals, ReduxState, ReduxAction, Entries, Scope>['entries'] & {
    tab: NonNullable<Module<Name, Screens, Modals, ReduxState, ReduxAction, Entries, Scope>['entries']['tab']>;
  };
};

export type ModuleScreens<T> =
  T extends Module<infer _Name, infer Screens, infer _Modals, infer _State, infer _Action, any, any> ? Screens : never;

export type ModuleModals<T> =
  T extends Module<infer _Name, infer _Screens, infer Modals, infer _State, infer _Action, any, any> ? Modals : never;

export type ModuleReduxReducer<T> =
  T extends Module<infer Name, any, any, infer State, infer A, any, any> ? (Name extends any ? Reducer<State, A> : never) : never;

export type ModuleReduxState<T> =
  T extends Module<infer Name, any, any, infer State, any, any, any> ? (Name extends any ? State : never) : never;

export type ModuleReduxAction<T> =
  T extends Module<infer Name, any, any, any, infer ReduxAction, any, any> ? (Name extends any ? ReduxAction : never) : never;

/** The entries of a module, as it reads them: each key it was given is required, the other ones optional. */
export type ModuleEntries<T> = T extends { entries: infer Entries } ? Entries : never;

/** Scopes declared by a module (`never` without any). */
export type ModuleScope<T> = T extends { scope?: readonly (infer Scope extends string)[] } ? Scope : never;

/**
 * Static strongly-typed modules collection
 */

type AllModulesImports = Awaited<ArrayElement<typeof importModules>>[];
export type AllModulesArray = ArrayElement<AllModulesImports>['default'][];
export type AnyModule = ArrayElement<AllModulesArray>;
export type AllModulesNames = AnyModule['name'];

// Modules of the collection, typed as modules that have a tab (a module that has no tab is filtered at runtime).
export type AnyTabModule = AnyModule extends infer M
  ? M extends Module<infer Name, infer Screens, infer Modals, infer State, infer ReduxAction, infer Entries, infer Scope>
    ? TabModule<Name, Screens, Modals, State, ReduxAction, Entries, Scope>
    : never
  : never;

/** Each module of the app, by its name: the type of the object given by `useModulesRecord`. */
export type AllModulesRecord = {
  [name in AllModulesNames]: Extract<AnyModule, { name: name }>;
};

// Names of the modules that have an entry in « Mes applis » (`entries.myApps`): the ones `useOpenModule` can open.
export type AllModulesWithMyAppsEntryNames = {
  [Name in AllModulesNames]: ModuleEntries<AllModulesRecord[Name]> extends { myApps: object } ? Name : never;
}[AllModulesNames];

// Names of the modules that provide a redux configuration (a module without it has `undefined` as state).
export type AllModulesWithReduxNames = {
  [Name in AllModulesNames]: [ModuleReduxState<AllModulesRecord[Name]>] extends [undefined] ? never : Name;
}[AllModulesNames];

export type AllModulesReducers = {
  [Name in AllModulesWithReduxNames]: ModuleReduxReducer<AllModulesRecord[Name]>;
};

export type AllModulesState = {
  [Name in AllModulesWithReduxNames]: ModuleReduxState<AllModulesRecord[Name]>;
};

export type AllModulesActions = {
  [Name in AllModulesNames]: ModuleReduxAction<AllModulesRecord[Name]>;
}[AllModulesNames];

type UnionToIntersection<U> = (U extends unknown ? (k: U) => void : never) extends (k: infer I) => void ? I : never;

export type AllModulesScreensParams = UnionToIntersection<
  {
    [Name in AllModulesNames]: NavigationParamsOfScreens<ModuleScreens<AllModulesRecord[Name]>>;
  }[AllModulesNames]
>;

export type AllModulesModalsParams = UnionToIntersection<
  {
    [Name in AllModulesNames]: NavigationParamsOfScreens<ModuleModals<AllModulesRecord[Name]>>;
  }[AllModulesNames]
>;

// Across modules, the lists are merged (`&`, not `|`) so that every route of every module is a valid route key.
// Route names are prefixed by the module name (see `StrictModuleScreens`) so there can't be any conflict.
// Screens and modals are kept in separate types.

// Screens and modals of all modules, as returned by `createNativeStackScreen`, ready to be given to `createNativeStackNavigator({ screens })`.
export type AllModulesStaticScreens = UnionToIntersection<
  {
    [Name in AllModulesNames]: ModuleStaticScreens<ModuleScreens<AllModulesRecord[Name]>>;
  }[AllModulesNames]
>;

export type AllModulesStaticModals = UnionToIntersection<
  {
    [Name in AllModulesNames]: ModuleStaticScreens<ModuleModals<AllModulesRecord[Name]>>;
  }[AllModulesNames]
>;

// Navigation params of all routes (screens and modals) : only used to type the global navigation.
export type AllModulesNavigationParams = AllModulesScreensParams & AllModulesModalsParams;
