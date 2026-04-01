import type { Action, Reducer } from 'redux';

import type { Module } from '.';

import type { AuthActiveAccount } from '~/framework/modules/auth/model';
import type { StorageSlice } from '~/framework/util/storage/slice';
import type { StorageTypeMap } from '~/framework/util/storage/types';

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

export interface ModuleConfigBase<Name extends string, State = never, ActionType extends Action = never> {
  /**
   * Technical name of this module. Needs to be the same as its folder name.
   */
  name: Name;

  /**
   * Scope needed to this module to consume apis. Scopes will be used when login in.
   */
  apiScope?: string[];

  /**
   * Prefix of APIs which this module consumes.
   * Usually, the apiPrefix in included in apiScope.
   */
  apiPrefix?: string;

  /**
   * Name that matches to an Entcore App `name` field.
   */
  matchEntcoreApp?: string;

  /**
   * Name that matches to an Entcore Widget `name` field.
   */
  matchEntcoreWidget?: string;

  /**
   * Additional `hasRight` logic to apply.
   * This logic is cumulative to the default one (both have to return true to make this module accessible).
   * @param session
   * @returns true if this module should is accessible to the user, false otherwise.
   */
  hasRight?: (session: AuthActiveAccount) => boolean;

  /**
   * Reducer
   */
  reducer?: Reducer<State, ActionType>;
}

export interface ModuleConfigStorage<
  ModuleStorageSliceTypeMap extends StorageTypeMap,
  ModulePreferencesSliceTypeMap extends StorageTypeMap,
> {
  /**
   * Prefix for storage items.
   * Mandatory if storage or preferences are specified.
   */
  storageName: string;

  /**
   * Storage (for all accounts)
   * `storageName` must be specified along with `storage`.
   */
  storage?: StorageSlice<ModuleStorageSliceTypeMap>;

  /**
   * Preference (storage by account)
   * `storageName` must be specified along with `preferences`.
   */
  preferences?: StorageSlice<ModulePreferencesSliceTypeMap>;
}

export type ModuleConfigStorageParameter<S extends StorageTypeMap, P extends StorageTypeMap> =
  | { [k in keyof ModuleConfigStorage<S, P>]?: never }
  | ModuleConfigStorage<S, P>;

export type ModuleConfigParameter<
  Name extends string,
  State,
  ActionType extends Action,
  ModuleStorageSliceTypeMap extends StorageTypeMap,
  ModulePreferencesSliceTypeMap extends StorageTypeMap,
> = ModuleConfigBase<Name, State, ActionType> &
  ModuleConfigStorageParameter<ModuleStorageSliceTypeMap, ModulePreferencesSliceTypeMap>;

export type ModuleConfig<
  Name extends string,
  S,
  A extends Action,
  Sg extends StorageTypeMap,
  Sp extends StorageTypeMap,
> = ModuleConfigBase<Name, S, A> & Partial<ModuleConfigStorage<Sg, Sp>>;

export type ModuleNavigationParams<T> = T extends Module<infer Name, infer NavParams, any, any> ? NavParams : never;
