/**
 * Module handler
 * Defines module logic & handle loading
 */

import { createNativeStackScreen } from '@react-navigation/native-stack';
import { Action } from 'redux';

import {
  AnyModule,
  CoreModuleConfig,
  EntModuleConfig,
  ModuleConfig,
  ModuleScreensConfig,
  ModuleStaticScreens,
  ScreenComponent,
  StrictModuleScreens,
} from './types';

export * from './types';

// ToDo: does the hasRight must check token scope too ?

export abstract class Module<
  Name extends string,
  Screens extends Record<string, ScreenComponent> & StrictModuleScreens<Name, Screens> = {},
  Modals extends Record<string, ScreenComponent> & StrictModuleScreens<Name, Modals> = {},
  ReduxState = undefined,
  ReduxAction extends Action = never,
> {
  name: ModuleConfig<Name, Screens, Modals, ReduxState, ReduxAction>['name'];
  scope: ModuleConfig<Name, Screens, Modals, ReduxState, ReduxAction>['scope'];
  redux: ModuleConfig<Name, Screens, Modals, ReduxState, ReduxAction>['redux'];
  screens: ModuleStaticScreens<Screens>;
  modals: ModuleStaticScreens<Modals>;

  constructor({ modals, name, redux, scope, screens }: ModuleConfig<Name, Screens, Modals, ReduxState, ReduxAction>) {
    this.name = name;
    this.scope = scope;
    this.redux = redux;
    this.screens = Module.createScreens(screens);
    this.modals = Module.createScreens(modals);
  }

  // Screens and modals will always be added to a native stack navigator.
  private static createScreens<Components extends Record<string, ScreenComponent>>(
    configs: ModuleScreensConfig<Components> | undefined,
  ) {
    return Object.fromEntries(
      Object.entries(configs ?? {}).map(([route, config]) => [route, createNativeStackScreen(config)]),
    ) as ModuleStaticScreens<Components>;
  }
}

export class CoreModule<
  Name extends string,
  Screens extends Record<string, ScreenComponent> & StrictModuleScreens<Name, Screens> = {},
  Modals extends Record<string, ScreenComponent> & StrictModuleScreens<Name, Modals> = {},
  ReduxState = undefined,
  ReduxAction extends Action = never,
>
  extends Module<Name, Screens, Modals, ReduxState, ReduxAction>
  implements Omit<CoreModuleConfig<Name, Screens, Modals, ReduxState, ReduxAction>, 'screens' | 'modals'> {}

export class EntModule<
  Name extends string,
  Screens extends Record<string, ScreenComponent> & StrictModuleScreens<Name, Screens> = {},
  Modals extends Record<string, ScreenComponent> & StrictModuleScreens<Name, Modals> = {},
  ReduxState = undefined,
  ReduxAction extends Action = never,
>
  extends Module<Name, Screens, Modals, ReduxState, ReduxAction>
  implements Omit<EntModuleConfig<Name, Screens, Modals, ReduxState, ReduxAction>, 'screens' | 'modals'>
{
  matchEntcoreApp: EntModuleConfig<Name, Screens, Modals, ReduxState, ReduxAction>['matchEntcoreApp'];
  matchEntcoreWidget: EntModuleConfig<Name, Screens, Modals, ReduxState, ReduxAction>['matchEntcoreWidget'];
  hasRight: EntModuleConfig<Name, Screens, Modals, ReduxState, ReduxAction>['hasRight'];
  tab: EntModuleConfig<Name, Screens, Modals, ReduxState, ReduxAction>['tab'];
  entTrackingName: EntModuleConfig<Name, Screens, Modals, ReduxState, ReduxAction>['entTrackingName'];

  constructor(config: EntModuleConfig<Name, Screens, Modals, ReduxState, ReduxAction>) {
    super(config);
    this.matchEntcoreApp = config.matchEntcoreApp;
    this.matchEntcoreWidget = config.matchEntcoreWidget;
    this.hasRight = config.hasRight;
    this.tab = config.tab;
    this.entTrackingName = config.entTrackingName;
  }

  private static isTabModule(m: AnyModule) {
    return m instanceof EntModule && !!m.tab;
  }
}
