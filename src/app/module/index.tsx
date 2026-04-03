/**
 * Module handler
 * Defines module logic & handle loading
 */

import React from 'react';

import { ParamListBase } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Action } from 'redux';

import {
  AllModulesAsMap,
  AllModulesAsTuple,
  AllModulesReducers,
  ModuleConfig,
  ModuleConfigParameter,
  ModuleConfigStorage,
  ModuleConfigStorageParameter,
  ModuleConfigTab,
  ModuleConfigTabParameter,
  StrictNavigationParams,
  TabModule,
} from './types';
import moduleImports from '../config/modules';

import { AuthActiveAccount } from '~/framework/modules/auth/model';
import { StorageTypeMap } from '~/framework/util/storage/types';

// ToDo: type Action

export class Module<
  Name extends string,
  NavigationParams extends ParamListBase & StrictNavigationParams<Name, NavigationParams> = {},
  State = undefined,
  StorageType extends StorageTypeMap = object,
  PreferencesType extends StorageTypeMap = object,
> implements ModuleConfig<Name, NavigationParams, State, Action, StorageType, PreferencesType> {
  name: ModuleConfig<Name, NavigationParams, State, Action, StorageType, PreferencesType>['name'];
  apiPrefix: ModuleConfig<Name, NavigationParams, State, Action, StorageType, PreferencesType>['apiPrefix'];
  apiScope: ModuleConfig<Name, NavigationParams, State, Action, StorageType, PreferencesType>['apiScope'];
  storageName: ModuleConfig<Name, NavigationParams, State, Action, StorageType, PreferencesType>['storageName'];
  matchEntcoreApp: ModuleConfig<Name, NavigationParams, State, Action, StorageType, PreferencesType>['matchEntcoreApp'];
  matchEntcoreWidget: ModuleConfig<Name, NavigationParams, State, Action, StorageType, PreferencesType>['matchEntcoreWidget'];
  hasRight: ModuleConfig<Name, NavigationParams, State, Action, StorageType, PreferencesType>['hasRight'];

  renderScreens?: (Stack: ReturnType<typeof createNativeStackNavigator<NavigationParams>>) => React.ReactElement;
  reducer: ModuleConfig<Name, NavigationParams, State, Action, StorageType, PreferencesType>['reducer'];
  storage: ModuleConfig<Name, NavigationParams, State, Action, StorageType, PreferencesType>['storage'] = undefined;
  preferences: ModuleConfig<Name, NavigationParams, State, Action, StorageType, PreferencesType>['preferences'] = undefined;

  tabRoute: ModuleConfig<Name, NavigationParams, State, Action, StorageType, PreferencesType>['tabRoute'] = undefined;
  tabOrder: ModuleConfig<Name, NavigationParams, State, Action, StorageType, PreferencesType>['tabOrder'] = undefined;
  tabIconActive: ModuleConfig<Name, NavigationParams, State, Action, StorageType, PreferencesType>['tabIconActive'] = undefined;
  tabIconInactive: ModuleConfig<Name, NavigationParams, State, Action, StorageType, PreferencesType>['tabIconInactive'] = undefined;
  tabTestID: ModuleConfig<Name, NavigationParams, State, Action, StorageType, PreferencesType>['tabTestID'] = undefined;

  constructor(
    config: ModuleConfigParameter<Name, NavigationParams, State, Action, StorageType, PreferencesType>,
    screens?: (Stack: ReturnType<typeof createNativeStackNavigator<NavigationParams>>) => React.ReactElement,
  ) {
    this.name = config.name;
    this.apiPrefix = config.apiPrefix;
    this.apiScope = config.apiScope ?? [];
    this.matchEntcoreApp = config.matchEntcoreApp;
    this.matchEntcoreWidget = config.matchEntcoreWidget;
    this.hasRight = config.hasRight;

    this.renderScreens = screens;

    this.reducer = config.reducer;

    if (Module.configContainsStorage(config)) {
      this.storageName = config.storageName;
      this.storage = config.storage;
      this.preferences = config.preferences;
    }

    if (Module.configContainsTab(config)) {
      this.tabRoute = config.tabRoute;
      this.tabOrder = config.tabOrder;
      this.tabIconActive = config.tabIconActive;
      this.tabIconInactive = config.tabIconInactive;
      this.tabTestID = config.tabTestID;
    }
  }

  private static configContainsStorage<
    StorageType extends StorageTypeMap = object,
    PreferencesType extends StorageTypeMap = object,
  >(
    config: ModuleConfigStorageParameter<StorageType, PreferencesType>,
  ): config is ModuleConfigStorage<StorageType, PreferencesType> {
    return !!(config as ModuleConfigStorage<StorageType, PreferencesType>).storageName;
  }

  private static configContainsTab<
    Name extends string,
    NavigationParams extends ParamListBase & StrictNavigationParams<Name, NavigationParams>,
  >(config: ModuleConfigTabParameter<Name, NavigationParams>): config is ModuleConfigTab<Name, NavigationParams> {
    return (
      (config as ModuleConfigTab<Name, NavigationParams>).tabRoute !== undefined &&
      (config as ModuleConfigTab<Name, NavigationParams>).tabOrder !== undefined &&
      (config as ModuleConfigTab<Name, NavigationParams>).tabIconActive !== undefined &&
      (config as ModuleConfigTab<Name, NavigationParams>).tabIconInactive !== undefined &&
      (config as ModuleConfigTab<Name, NavigationParams>).tabTestID !== undefined
    );
  }

  private static isTabModule<
    N extends string,
    Np extends ParamListBase & StrictNavigationParams<N, Np>,
    S,
    St extends StorageTypeMap,
    Pt extends StorageTypeMap,
  >(m: Module<N, Np, S, St, Pt>): m is TabModule<N, Np, S, St, Pt> {
    return Module.configContainsTab(m as ModuleConfigTabParameter<N, Np>);
  }

  static _allModulesAsMap?: AllModulesAsMap = undefined;
  static _allModulesAsTuple?: AllModulesAsTuple = undefined;
  static async loadModules() {
    if (Module._allModulesAsMap) {
      console.warn('[Module] Module.loadModules: loadModules should be called only once. Check when this method is called.');
    }
    __DEV__ && console.info(`[Module] Loading ${moduleImports.length} modules...`);
    const loadedModules = (await Promise.all(moduleImports)).map(m => {
      __DEV__ && console.info(`[Module] Loaded module ${m.default.name}.`);
      return m.default;
    });
    // Compute once for all both variants of the modules list (map by name & tuple)
    Module._allModulesAsMap = Object.fromEntries(loadedModules.map(m => [m.name, m])) as AllModulesAsMap;
    Module._allModulesAsTuple = Object.values(Module._allModulesAsMap) as unknown as AllModulesAsTuple;
  }

  static get allModulesAsMap() {
    if (!Module._allModulesAsMap) throw new Error('[Module] Module.allModulesAsMap: modules are not loaded yet');
    return Module._allModulesAsMap as unknown as Readonly<AllModulesAsMap>;
  }

  static get allModulesAsTuple() {
    if (!Module._allModulesAsTuple) throw new Error('[Module] Module.allModulesAsTuple: modules are not loaded yet');
    return Module._allModulesAsTuple as unknown as Readonly<AllModulesAsTuple>;
  }

  static getAllModulesReducers() {
    return Object.fromEntries(Object.entries(Module.allModulesAsMap).map(([name, m]) => [name, m.reducer])) as AllModulesReducers;
  }

  static getAllModulesScopes() {
    return [...new Set(...Object.values(Module.allModulesAsMap).map(m => m.apiScope))];
  }

  static getAvailableModules(session: AuthActiveAccount): Partial<typeof Module._allModulesAsTuple> & Module<string>[] {
    // ToDo: filter with modules that are available to the user
    const predicate = () => true;
    return Object.values(Module.allModulesAsMap).filter(predicate) as Partial<typeof Module._allModulesAsTuple> & Module<string>[];
  }

  static filterTabModules(modules: ReturnType<typeof Module.getAvailableModules>): TabModule<string>[] {
    return (modules.filter(module => Module.isTabModule(module as Module<string>)) as TabModule<string>[]).sort(
      (a, b) => a.tabOrder - b.tabOrder,
    );
  }
}
