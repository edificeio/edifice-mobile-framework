import { ParamListBase } from '@react-navigation/native';
import type { Action, Reducer } from 'redux';

import type modules from '~/app/config/modules';
import { SvgIconName } from '~/framework/components/picture';
import type { AuthActiveAccount } from '~/framework/modules/auth/model';
import type { StorageSlice } from '~/framework/util/storage/slice';
import type { StorageTypeMap } from '~/framework/util/storage/types';
import { EntModule, Module, RootModule } from '.';

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

export type StrictNavigationParams<Name extends string, T> = {
  [K in keyof T]: K extends `${Name}` | `${Name}/${string}` ? T[K] : never;
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

interface ConfigForStorage<ModuleStorageSliceTypeMap extends StorageTypeMap, ModulePreferencesSliceTypeMap extends StorageTypeMap> {
  // Prefix for all storage keys. Usually same as module name.
  namespace: string;

  // Instance of storage
  device?: StorageSlice<ModuleStorageSliceTypeMap>;

  // Instance of preferences storage for this account
  account?: StorageSlice<ModulePreferencesSliceTypeMap>;
}

interface ConfigForTab<
  Name extends string,
  NavigationParams extends ParamListBase & StrictNavigationParams<Name, NavigationParams>,
> {
  // Name of the route that goes to the tab home
  route: keyof NavigationParams;

  // Visible icon when the tab is not active
  iconInactive: SvgIconName;

  // Visible icon when the tab is active
  iconActive: SvgIconName;

  // Value to tell in which order the tabs must be displayed
  order?: number;

  // TestID of the tab bar button
  testId: string;
}

interface ConfigForRedux<State = never, ActionType extends Action = never> {
  // Reducer instance of this module
  reducer: Reducer<State, ActionType>;
}

export interface ModuleConfig<
  Name extends string,
  State = never,
  ActionType extends Action = never,
  ModuleStorageSliceTypeMap extends StorageTypeMap = never,
  ModulePreferencesSliceTypeMap extends StorageTypeMap = never,
> {
  // Technical name of this module. Needs to be the same as its folder name.
  name: Name;

  // Scope needed to use APIs in this modules.
  scope?: string[];

  // Redux configuration
  redux?: ConfigForRedux<State, ActionType>;

  // Storage configuration
  storage?: ConfigForStorage<ModuleStorageSliceTypeMap, ModulePreferencesSliceTypeMap>;
}

export interface RootModuleConfig<
  Name extends string,
  State = never,
  ActionType extends Action = never,
  ModuleStorageSliceTypeMap extends StorageTypeMap = never,
  ModulePreferencesSliceTypeMap extends StorageTypeMap = never,
> extends ModuleConfig<Name, State, ActionType, ModuleStorageSliceTypeMap, ModulePreferencesSliceTypeMap> {}

export interface EntModuleConfig<
  Name extends string,
  NavigationParams extends ParamListBase & StrictNavigationParams<Name, NavigationParams>,
  State = never,
  ActionType extends Action = never,
  ModuleStorageSliceTypeMap extends StorageTypeMap = never,
  ModulePreferencesSliceTypeMap extends StorageTypeMap = never,
>
  extends ModuleConfig<Name, State, ActionType, ModuleStorageSliceTypeMap, ModulePreferencesSliceTypeMap>, ConfigForRights {
  tab?: ConfigForTab<Name, NavigationParams>;
}

export type EntTabModule<
  Name extends string,
  NavigationParams extends ParamListBase & StrictNavigationParams<Name, NavigationParams> = {},
  ReduxState = undefined,
  ReduxAction extends Action = Action,
  StorageType extends StorageTypeMap = object,
  PreferencesType extends StorageTypeMap = object,
> = Omit<EntModule<Name, NavigationParams, ReduxState, ReduxAction, StorageType, PreferencesType>, 'tab'> & {
  tab: NonNullable<EntModule<Name, NavigationParams, ReduxState, ReduxAction, StorageType, PreferencesType>['tab']>;
};

/**
 * Module type utilities
 *
 * Note :
 * In the follow type definitions, `Name extends any` is an always-true condition and is used is used only to prevent the following linting error:
 * "'Name' is defined but never used."
 */

export type ModuleNavigationParams<T> = T extends
  | RootModule<infer Name, infer NavParams, any, any, any, any>
  | EntModule<infer Name, infer NavParams, any, any, any, any>
  ? Name extends any
    ? NavParams
    : never
  : never;

export type ModuleReduxReducer<T> = T extends
  | RootModule<infer Name, any, infer State, infer Action, any, any>
  | EntModule<infer Name, any, infer State, infer Action, any, any>
  ? Name extends any
    ? Reducer<State, Action>
    : never
  : never;

export type ModuleReduxState<T> = T extends
  | RootModule<infer Name, any, infer State, any, any, any>
  | EntModule<infer Name, any, infer State, any, any, any>
  ? Name extends any
    ? State
    : never
  : never;

/**
 * Static strongly-typed modules collection
 */

export type ResolvedModule<T> = T extends Promise<infer M> ? M : never;

export type AllModules = {
  [I in keyof typeof modules as I extends `${number}` ? I : never]: ResolvedModule<(typeof modules)[I]>['default'];
} & Omit<Array<ResolvedModule<(typeof modules)[keyof typeof modules]>['default']>, number>;

export type OneModule = AllModules[Extract<keyof AllModules, `${number}`>];

export type AllModulesNames = OneModule['name'];

export type AllModulesByName = {
  [name in AllModulesNames]: Extract<
    OneModule,
    RootModule<name, any, any, any, any, any> | EntModule<name, any, any, any, any, any>
  >;
};

export type AllModulesReducers = {
  [Name in AllModulesNames]: ModuleReduxReducer<AllModulesByName[Name]>;
};

export type AllModulesState = {
  [Name in AllModulesNames]: ModuleReduxState<AllModulesByName[Name]>;
};
