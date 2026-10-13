/**
 * Module handler
 * Defines module logic & handle loading
 */

import { createNativeStackScreen } from '@react-navigation/native-stack';
import type { Action } from 'redux';

import type { ScreenComponent } from '~/app/navigation-new';

import {
  AnyModule,
  CoreModuleConfig,
  EntModuleConfig,
  ModuleConfig,
  ModuleScreensConfig,
  ModuleStaticScreens,
  StrictModuleScreens,
} from './types';

export * from './types';
export * from './hooks';
export * from './loader';

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
  storages: NonNullable<ModuleConfig<Name, Screens, Modals, ReduxState, ReduxAction>['storages']>;
  onSessionRelease: ModuleConfig<Name, Screens, Modals, ReduxState, ReduxAction>['onSessionRelease'];
  onSessionStart: ModuleConfig<Name, Screens, Modals, ReduxState, ReduxAction>['onSessionStart'];
  sessionSetup: ModuleConfig<Name, Screens, Modals, ReduxState, ReduxAction>['sessionSetup'];
  screens: ModuleStaticScreens<Screens>;
  modals: ModuleStaticScreens<Modals>;
  /** Routes (screens and modals) that only host another navigation container, which tracks them itself (`delegatesTelemetry`). */
  telemetryDelegatedRoutes: ReadonlySet<string>;

  constructor(opts: ModuleConfig<Name, Screens, Modals, ReduxState, ReduxAction>) {
    this.name = opts.name;
    this.scope = opts.scope;
    this.redux = opts.redux;
    this.storages = opts.storages ?? [];
    this.screens = Module.createScreens(opts.screens);
    this.modals = Module.createScreens(opts.modals);
    this.telemetryDelegatedRoutes = new Set([
      ...Module.getDelegatedRoutes(opts.screens),
      ...Module.getDelegatedRoutes(opts.modals),
    ]);
    this.onSessionRelease = opts.onSessionRelease;
    this.onSessionStart = opts.onSessionStart;
    this.sessionSetup = opts.sessionSetup;
  }

  // Screens and modals will always be added to a native stack navigator.
  // `delegatesTelemetry` is for the app only: the navigator doesn't get it.
  private static createScreens<Components extends Record<string, ScreenComponent>>(
    configs: ModuleScreensConfig<Components> | undefined,
  ) {
    return Object.fromEntries(
      Object.entries(configs ?? {}).map(([route, config]) => {
        const { delegatesTelemetry: _delegatesTelemetry, ...navigatorConfig } = config;
        return [route, createNativeStackScreen(navigatorConfig)];
      }),
    ) as ModuleStaticScreens<Components>;
  }

  private static getDelegatedRoutes<Components extends Record<string, ScreenComponent>>(
    configs: ModuleScreensConfig<Components> | undefined,
  ) {
    return Object.entries(configs ?? {})
      .filter(([, config]) => config.delegatesTelemetry)
      .map(([route]) => route);
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
