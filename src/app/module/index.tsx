/**
 * Module handler
 * Defines module logic & handle loading
 */

import React from 'react';

import { ParamListBase } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Action } from 'redux';

import { ModuleConfig, ModuleConfigParameter, ModuleConfigStorage, ModuleConfigStorageParameter } from './types';

import { StorageTypeMap } from '~/framework/util/storage/types';

function configContainsStorage<StorageType extends StorageTypeMap = object, PreferencesType extends StorageTypeMap = object>(
  config: ModuleConfigStorageParameter<StorageType, PreferencesType>,
): config is ModuleConfigStorage<StorageType, PreferencesType> {
  return !!(config as ModuleConfigStorage<StorageType, PreferencesType>).storageName;
}

export class Module<
  NavigationParams extends ParamListBase = {},
  State = undefined,
  StorageType extends StorageTypeMap = object,
  PreferencesType extends StorageTypeMap = object,
> implements ModuleConfig<State, Action, StorageType, PreferencesType> {
  name: ModuleConfig<State, Action, StorageType, PreferencesType>['name'];
  apiPrefix: ModuleConfig<State, Action, StorageType, PreferencesType>['apiPrefix'];
  apiScope: ModuleConfig<State, Action, StorageType, PreferencesType>['apiScope'];
  storageName: ModuleConfig<State, Action, StorageType, PreferencesType>['storageName'];
  matchEntcoreApp: ModuleConfig<State, Action, StorageType, PreferencesType>['matchEntcoreApp'];
  matchEntcoreWidget: ModuleConfig<State, Action, StorageType, PreferencesType>['matchEntcoreWidget'];
  hasRight: ModuleConfig<State, Action, StorageType, PreferencesType>['hasRight'];

  renderScreens: (Stack: ReturnType<typeof createNativeStackNavigator<NavigationParams>>) => React.ReactElement | null;
  reducer: ModuleConfig<State, Action, StorageType, PreferencesType>['reducer'];
  storage: ModuleConfig<State, Action, StorageType, PreferencesType>['storage'] = undefined;
  preferences: ModuleConfig<State, Action, StorageType, PreferencesType>['preferences'] = undefined;

  constructor(
    config: ModuleConfigParameter<State, Action, StorageType, PreferencesType>,
    screens?: (Stack: ReturnType<typeof createNativeStackNavigator<NavigationParams>>) => React.ReactElement,
  ) {
    this.name = config.name;
    this.apiPrefix = config.apiPrefix;
    this.apiScope = config.apiScope ?? [];
    this.matchEntcoreApp = config.matchEntcoreApp;
    this.matchEntcoreWidget = config.matchEntcoreWidget;
    this.hasRight = config.hasRight;

    this.renderScreens = (Stack: ReturnType<typeof createNativeStackNavigator<NavigationParams>>) =>
      screens ? screens(Stack) : null;
    this.reducer = config.reducer;

    if (configContainsStorage(config)) {
      this.storageName = config.storageName;
      this.storage = config.storage;
      this.preferences = config.preferences;
    }
  }
}
