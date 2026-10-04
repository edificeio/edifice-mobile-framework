import type React from 'react';

import type { createNativeStackScreen } from '@react-navigation/native-stack';
import type { Action, Reducer } from 'redux';

import type importModules from '~/app/config/modules';
import { SvgIconName } from '~/framework/components/picture';
import type { AuthActiveAccount } from '~/framework/modules/auth/model';

import { EntModule, Module } from '.';

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
 * Navigation related types
 */

/**
 * Component rendered by a screen (or a modal).
 */
export type ScreenComponent = React.ComponentType<any>;

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
 * Config of each screen (or modal) given to a module : same as the config given to `createNativeStackScreen`.
 * `Components` (route name -> screen component) is inferred from it.
 */
export type ModuleScreensConfig<Components extends Record<string, ScreenComponent>> = {
  [RouteName in keyof Components]: Parameters<typeof createNativeStackScreen<Components[RouteName]>>[0];
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

interface ConfigForRights {
  // Name that matches to an Entcore App `name` field.
  matchEntcoreApp?: string;

  // Name that matches to an Entcore Widget `name` field.
  matchEntcoreWidget?: string;

  // Additionnal verifications needed to consider have right to access this module.
  // This logic will be cumulated with the default one (based on matchEntcoreApp/Widget) and both needs to return true to show the module to the user.
  hasRight?: (session: AuthActiveAccount) => boolean;
}

interface ConfigForTab<Route extends PropertyKey> {
  // Name of the route that goes to the tab home
  route: Route;

  // Visible icon when the tab is not active
  iconInactive: SvgIconName;

  // Visible icon when the tab is active
  iconActive: SvgIconName;

  // Value to tell in which order the tabs must be displayed
  order?: number;

  // TestID of the tab bar button
  testId: string;
}

interface ConfigForRedux<State = undefined, ActionType extends Action = never> {
  // Reducer instance of this module
  reducer: Reducer<State, ActionType>;
}

export interface ModuleConfig<
  Name extends string,
  Screens extends Record<string, ScreenComponent> & StrictModuleScreens<Name, Screens> = {},
  Modals extends Record<string, ScreenComponent> & StrictModuleScreens<Name, Modals> = {},
  ReduxState = undefined,
  ReduxAction extends Action = never,
> {
  // Technical name of this module. Needs to be the same as its folder name.
  name: Name;

  // Scope needed to use APIs in this modules.
  scope?: string[];

  // Screens and Modals, each one configured like with `createNativeStackScreen`.
  screens?: ModuleScreensConfig<Screens>;
  modals?: ModuleScreensConfig<Modals>;

  // Redux configuration
  redux?: ConfigForRedux<ReduxState, ReduxAction>;
}

export interface CoreModuleConfig<
  Name extends string,
  Screens extends Record<string, ScreenComponent> & StrictModuleScreens<Name, Screens> = {},
  Modals extends Record<string, ScreenComponent> & StrictModuleScreens<Name, Modals> = {},
  ReduxState = undefined,
  ReduxAction extends Action = never,
> extends ModuleConfig<Name, Screens, Modals, ReduxState, ReduxAction> {}

export interface EntModuleConfig<
  Name extends string,
  Screens extends Record<string, ScreenComponent> & StrictModuleScreens<Name, Screens> = {},
  Modals extends Record<string, ScreenComponent> & StrictModuleScreens<Name, Modals> = {},
  ReduxState = undefined,
  ReduxAction extends Action = never,
>
  extends ModuleConfig<Name, Screens, Modals, ReduxState, ReduxAction>, ConfigForRights {
  tab?: ConfigForTab<keyof Screens | keyof Modals>;
  entTrackingName?: string;
}

export type EntTabModule<
  Name extends string,
  Screens extends Record<string, ScreenComponent> & StrictModuleScreens<Name, Screens> = {},
  Modals extends Record<string, ScreenComponent> & StrictModuleScreens<Name, Modals> = {},
  ReduxState = undefined,
  ReduxAction extends Action = never,
> = Omit<EntModule<Name, Screens, Modals, ReduxState, ReduxAction>, 'tab'> & {
  tab: NonNullable<EntModule<Name, Screens, Modals, ReduxState, ReduxAction>['tab']>;
};

export type ModuleScreens<T> =
  T extends Module<infer _Name, infer Screens, infer _Modals, infer _State, infer _Action> ? Screens : never;

export type ModuleModals<T> =
  T extends Module<infer _Name, infer _Screens, infer Modals, infer _State, infer _Action> ? Modals : never;

export type ModuleReduxReducer<T> =
  T extends Module<infer Name, any, any, infer State, infer A> ? (Name extends any ? Reducer<State, A> : never) : never;

export type ModuleReduxState<T> =
  T extends Module<infer Name, any, any, infer State, any> ? (Name extends any ? State : never) : never;

export type ModuleReduxAction<T> =
  T extends Module<infer Name, any, any, any, infer ReduxAction> ? (Name extends any ? ReduxAction : never) : never;

/**
 * Static strongly-typed modules collection
 */

type AllModulesImports = Awaited<ArrayElement<typeof importModules>>[];
export type AllModulesArray = ArrayElement<AllModulesImports>['default'][];
export type AnyModule = ArrayElement<AllModulesArray>;
export type AllModulesNames = AnyModule['name'];

export type AllModulesMap = {
  [name in AllModulesNames]: Extract<AnyModule, { name: name }>;
};

// Names of the modules that provide a redux configuration (a module without it has `undefined` as state).
export type AllModulesWithReduxNames = {
  [Name in AllModulesNames]: [ModuleReduxState<AllModulesMap[Name]>] extends [undefined] ? never : Name;
}[AllModulesNames];

export type AllModulesReducers = {
  [Name in AllModulesWithReduxNames]: ModuleReduxReducer<AllModulesMap[Name]>;
};

export type AllModulesState = {
  [Name in AllModulesWithReduxNames]: ModuleReduxState<AllModulesMap[Name]>;
};

export type AllModulesActions = {
  [Name in AllModulesNames]: ModuleReduxAction<AllModulesMap[Name]>;
}[AllModulesNames];

type UnionToIntersection<U> = (U extends unknown ? (k: U) => void : never) extends (k: infer I) => void ? I : never;

export type AllModulesScreensParams = UnionToIntersection<
  {
    [Name in AllModulesNames]: NavigationParamsOfScreens<ModuleScreens<AllModulesMap[Name]>>;
  }[AllModulesNames]
>;

export type AllModulesModalsParams = UnionToIntersection<
  {
    [Name in AllModulesNames]: NavigationParamsOfScreens<ModuleModals<AllModulesMap[Name]>>;
  }[AllModulesNames]
>;

// Within a module, screens and modals are merged (`&`).
// Across modules, the param lists are merged too (`&`, not `|`) so that every route of every module is a valid route key.
// Route names are prefixed by the module name (see `StrictNavigationParams`) so there can't be any conflict.

export type AllModulesNavigationParams = UnionToIntersection<
  {
    [Name in AllModulesNames]: NavigationParamsOfScreens<ModuleModals<AllModulesMap[Name]> & ModuleScreens<AllModulesMap[Name]>>;
  }[AllModulesNames]
>;

// Screens and modals of all modules, as returned by `createNativeStackScreen`, ready to be given to `createNativeStackNavigator({ screens })`.
export type AllModulesStaticScreens = UnionToIntersection<
  {
    [Name in AllModulesNames]: ModuleStaticScreens<ModuleScreens<AllModulesMap[Name]>> &
      ModuleStaticScreens<ModuleModals<AllModulesMap[Name]>>;
  }[AllModulesNames]
>;
