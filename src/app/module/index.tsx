/**
 * Module handler
 * Defines module logic & handle loading
 */

import { createNativeStackScreen } from '@react-navigation/native-stack';
import type { Action } from 'redux';

import type { ScreenComponent } from '~/app/navigation-new';

import {
  ConfigForTab,
  CoreModuleConfig,
  EntModuleConfig,
  EntryRoute,
  ModuleConfig,
  ModuleScreensConfig,
  ModuleStaticScreens,
  ModuleTab,
  StrictModuleScreens,
} from './types';

export * from './types';
export * from './hooks';
export * from './loader';
export * from './rights';

// ToDo: does the hasRight must check token scope too ?

export abstract class Module<
  Name extends string,
  Screens extends Record<string, ScreenComponent> & StrictModuleScreens<Name, Screens> = {},
  Modals extends Record<string, ScreenComponent> & StrictModuleScreens<Name, Modals> = {},
  ReduxState = undefined,
  ReduxAction extends Action = never,
  Entry extends EntryRoute<Screens> | undefined = undefined,
> {
  name: ModuleConfig<Name, Screens, Modals, ReduxState, ReduxAction, Entry>['name'];
  scope: ModuleConfig<Name, Screens, Modals, ReduxState, ReduxAction, Entry>['scope'];
  entry: Entry;
  tab: ModuleTab<keyof Screens> | undefined;
  redux: ModuleConfig<Name, Screens, Modals, ReduxState, ReduxAction, Entry>['redux'];
  storages: NonNullable<ModuleConfig<Name, Screens, Modals, ReduxState, ReduxAction, Entry>['storages']>;
  onSessionRelease: ModuleConfig<Name, Screens, Modals, ReduxState, ReduxAction, Entry>['onSessionRelease'];
  onSessionStart: ModuleConfig<Name, Screens, Modals, ReduxState, ReduxAction, Entry>['onSessionStart'];
  sessionSetup: ModuleConfig<Name, Screens, Modals, ReduxState, ReduxAction, Entry>['sessionSetup'];
  screens: ModuleStaticScreens<Screens>;
  modals: ModuleStaticScreens<Modals>;
  /** Routes (screens and modals) that only host another navigation container, which tracks them itself (`delegatesTelemetry`). */
  telemetryDelegatedRoutes: ReadonlySet<string>;

  constructor(opts: ModuleConfig<Name, Screens, Modals, ReduxState, ReduxAction, Entry>) {
    this.name = opts.name;
    this.scope = opts.scope;
    this.entry = opts.entry as Entry;
    this.tab = Module.createTab<keyof Screens>(opts);
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

  // The tab opens on its own route, or else on the entry of the module.
  private static createTab<Route extends PropertyKey>(opts: {
    entry?: Route;
    name: string;
    tab?: ConfigForTab<Route>;
  }): ModuleTab<Route> | undefined {
    if (opts.tab === undefined) return undefined;
    const route = opts.tab.route ?? opts.entry;
    if (route === undefined) {
      throw new Error(`[Module] The tab of "${opts.name}" has no route: give the module an \`entry\`, or its tab a \`route\`.`);
    }
    return { ...opts.tab, route };
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
  Entry extends EntryRoute<Screens> | undefined = undefined,
>
  extends Module<Name, Screens, Modals, ReduxState, ReduxAction, Entry>
  implements Omit<CoreModuleConfig<Name, Screens, Modals, ReduxState, ReduxAction, Entry>, 'screens' | 'modals'> {}

export class EntModule<
  Name extends string,
  Screens extends Record<string, ScreenComponent> & StrictModuleScreens<Name, Screens> = {},
  Modals extends Record<string, ScreenComponent> & StrictModuleScreens<Name, Modals> = {},
  ReduxState = undefined,
  ReduxAction extends Action = never,
  Entry extends EntryRoute<Screens> | undefined = undefined,
>
  extends Module<Name, Screens, Modals, ReduxState, ReduxAction, Entry>
  implements Omit<EntModuleConfig<Name, Screens, Modals, ReduxState, ReduxAction, Entry>, 'screens' | 'modals'>
{
  matchEntcoreApp: EntModuleConfig<Name, Screens, Modals, ReduxState, ReduxAction, Entry>['matchEntcoreApp'];
  matchEntcoreWidget: EntModuleConfig<Name, Screens, Modals, ReduxState, ReduxAction, Entry>['matchEntcoreWidget'];
  hasRight: EntModuleConfig<Name, Screens, Modals, ReduxState, ReduxAction, Entry>['hasRight'];
  entTrackingName: EntModuleConfig<Name, Screens, Modals, ReduxState, ReduxAction, Entry>['entTrackingName'];

  constructor(config: EntModuleConfig<Name, Screens, Modals, ReduxState, ReduxAction, Entry>) {
    super(config);
    this.matchEntcoreApp = config.matchEntcoreApp;
    this.matchEntcoreWidget = config.matchEntcoreWidget;
    this.hasRight = config.hasRight;
    this.entTrackingName = config.entTrackingName;
  }
}
