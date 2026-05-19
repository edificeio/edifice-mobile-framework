/**
 * Module handler
 * Defines module logic & handle loading
 */

import React from 'react';

import { ParamListBase } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Action } from 'redux';

import { AuthActiveAccount } from '~/framework/modules/auth/model';
import { StorageTypeMap } from '~/framework/util/storage/types';

import { Modules } from './all';
import { AllModules, CoreModuleConfig, EntModuleConfig, EntTabModule, ModuleConfig, StrictNavigationParams } from './types';

export * from './types';

// ToDo: type Action

// ToDo: does the hasRight must check token scope too ?

export abstract class Module<
  Name extends string,
  NavigationParams extends ParamListBase & StrictNavigationParams<Name, NavigationParams> = {},
  ReduxState = undefined,
  ReduxAction extends Action = Action,
  StorageType extends StorageTypeMap = object,
  PreferencesType extends StorageTypeMap = object,
> implements ModuleConfig<Name, ReduxState, ReduxAction, StorageType, PreferencesType> {
  name: ModuleConfig<Name, ReduxState, ReduxAction, StorageType, PreferencesType>['name'];
  scope: ModuleConfig<Name, ReduxState, ReduxAction, StorageType, PreferencesType>['scope'];

  redux: ModuleConfig<Name, ReduxState, ReduxAction, StorageType, PreferencesType>['redux'];
  storage: ModuleConfig<Name, ReduxState, ReduxAction, StorageType, PreferencesType>['storage'];
  renderScreens?: (Stack: ReturnType<typeof createNativeStackNavigator<NavigationParams>>) => React.ReactElement;

  constructor(
    config: ModuleConfig<Name, ReduxState, ReduxAction, StorageType, PreferencesType>,
    screens?: (Stack: ReturnType<typeof createNativeStackNavigator<NavigationParams>>) => React.ReactElement,
  ) {
    this.name = config.name;
    this.scope = config.scope;
    this.redux = config.redux;
    this.storage = config.storage;
    this.renderScreens = screens;
  }
}

export class CoreModule<
  Name extends string,
  NavigationParams extends ParamListBase & StrictNavigationParams<Name, NavigationParams> = {},
  ReduxState = undefined,
  ReduxAction extends Action = Action,
  StorageType extends StorageTypeMap = object,
  PreferencesType extends StorageTypeMap = object,
>
  extends Module<Name, NavigationParams, ReduxState, ReduxAction, StorageType, PreferencesType>
  implements CoreModuleConfig<Name, ReduxState, ReduxAction, StorageType, PreferencesType> {}

export class EntModule<
  Name extends string,
  NavigationParams extends ParamListBase & StrictNavigationParams<Name, NavigationParams> = {},
  ReduxState = undefined,
  ReduxAction extends Action = Action,
  StorageType extends StorageTypeMap = object,
  PreferencesType extends StorageTypeMap = object,
>
  extends Module<Name, NavigationParams, ReduxState, ReduxAction, StorageType, PreferencesType>
  implements EntModuleConfig<Name, NavigationParams, ReduxState, ReduxAction, StorageType, PreferencesType>
{
  matchEntcoreApp: EntModuleConfig<
    Name,
    NavigationParams,
    ReduxState,
    ReduxAction,
    StorageType,
    PreferencesType
  >['matchEntcoreApp'];
  matchEntcoreWidget: EntModuleConfig<
    Name,
    NavigationParams,
    ReduxState,
    ReduxAction,
    StorageType,
    PreferencesType
  >['matchEntcoreWidget'];
  hasRight: EntModuleConfig<Name, NavigationParams, ReduxState, ReduxAction, StorageType, PreferencesType>['hasRight'];
  tab: EntModuleConfig<Name, NavigationParams, ReduxState, ReduxAction, StorageType, PreferencesType>['tab'];

  constructor(
    config: EntModuleConfig<Name, NavigationParams, ReduxState, ReduxAction, StorageType, PreferencesType>,
    screens?: (Stack: ReturnType<typeof createNativeStackNavigator<NavigationParams>>) => React.ReactElement,
  ) {
    super(config, screens);
    this.matchEntcoreApp = config.matchEntcoreApp;
    this.matchEntcoreWidget = config.matchEntcoreWidget;
    this.hasRight = config.hasRight;
    this.tab = config.tab;
  }

  static getAvailableForAccount(_session: AuthActiveAccount) {
    // ToDo: write predicate to filter with modules that are available to the user
    const predicate = () => true;
    return Modules.getAllOfType(EntModule).filter(predicate);
  }

  private static isTabModule<N extends string, Np extends ParamListBase & StrictNavigationParams<N, Np>>(
    m: ArrayElement<AllModules>,
  ) {
    return m instanceof EntModule && !!m.tab;
  }

  static filterTabModules(modules: ReturnType<typeof EntModule.getAvailableForAccount>) {
    const tabModules = modules.filter(EntModule.isTabModule);
    return tabModules.sort((a, b) => (a.tab?.order ?? 0) - (b.tab?.order ?? 0)) as EntTabModule<string>[];
  }
}
