/**
 * ModuleTool
 * Everything for managing and declaring modules
 */
import I18n from 'i18n-js';
import * as React from 'react';
import type { ColorValue } from 'react-native';
import { NavigationRouteConfig } from 'react-navigation';
import type { NavigationParams, NavigationRoute, NavigationRouteConfigMap } from 'react-navigation';
import type { StackNavigationOptions, StackNavigationProp } from 'react-navigation-stack/lib/typescript/src/vendor/types';
import type { Reducer } from 'redux';

import { createMainTabNavOption } from '~/navigation/helpers/mainTabNavigator';

import { toSnakeCase } from './string';

// Module Config ==================================================================================

/**
 * Describes an app as it lives in Backend, on the platform.
 */
export interface IEntcoreApp {
  name: string;
  address: string;
  icon?: string;
  target?: string;
  displayName: string;
  display: boolean;
  prefix?: string; // Note : Connectors haven't a prefix, Applications do.
  casType?: string;
  isExternal?: boolean;
}

interface IModuleConfigBase<Name extends string> {
  // Module configured information
  name: Name; // Technical (and unique) name of the module. This module will be referenced by this name everywhere in the code.
  displayName: string; // I18n key of the module title displayed. Equals to `name` if not specified.

  // matchEntcoreApp: ((entcoreApp: IEntcoreApp) => boolean); // Function that tell if the module can be accessible by the user. If stirng is provided, compare to prefix.
  entcoreScope: string[]; // oAuth scope required for this module

  // Module computed information
  actionTypesPrefix: string; // Uppercase prefix used for action types. Computed from `name` if not specified.
  reducerName: string; // Name of the reducer. Computed from `name` if not specified.
  trackingName: string; // Name used for tracking category. Computed from `name` if not specified.

  // Module registration
  registerAs?: string; // In which global register to puy this module
  registerOrder?: number; // In which order

  // Additional keys
  [k: string]: any;
}

/**
 * An usable moduleConfig. A moduleConfig is importable within a module itself.
 * So use moduleConfig for module constants.
 */
export interface IModuleConfig<Name extends string, State> extends IModuleConfigBase<Name> {
  matchEntcoreApp: (entcoreApp: IEntcoreApp) => boolean; // Function that tell if the module can be accessible by the user. If stirng is provided, compare to prefix.
  getState: (globalState: any) => State;
  namespaceActionType: (actionType: string) => string;
}

export type IUnkownModuleConfig = IModuleConfig<string, unknown>;
export type IAnyModuleConfig = IModuleConfig<string, any>;

/**
 * An usable moduleConfig is build from its declaration with the `createModuleConfig` function.
 * This represents this sort of module config declaration.
 */
export interface IModuleConfigDeclaration<Name extends string> extends Partial<IModuleConfigBase<Name>> {
  name: Name;
  matchEntcoreApp?: string | ((entcoreApp: IEntcoreApp) => boolean);
}

/**
 * Creates an usable moduleConfig from its declaration.
 */
export const createModuleConfig: <Name extends string, State>(
  opts: IModuleConfigDeclaration<Name>,
) => IModuleConfig<Name, State> = opts => {
  const ret = {
    name: opts.name,
    displayName: opts.displayName || opts.name,
    matchEntcoreApp:
      (typeof opts.matchEntcoreApp === 'string'
        ? (entcoreApp: IEntcoreApp) => entcoreApp.address === opts.matchEntcoreApp
        : opts.matchEntcoreApp) || (() => true),
    entcoreScope: opts.entcoreScope || [],
    actionTypesPrefix: opts.actionTypesPrefix || toSnakeCase(opts.name).toUpperCase() + '_',
    reducerName: opts.reducerName || opts.name,
    trackingName: opts.trackingName || opts.name[0].toUpperCase() + opts.name.slice(1),
    registerAs: opts.registerAs,
    registerOrder: opts.registerOrder,
  };
  const otherOpts = Object.fromEntries(Object.entries(opts).filter(([k, v]) => !ret.hasOwnProperty(k)));
  return {
    ...ret,
    ...otherOpts,
    getState: globalState => globalState[ret.reducerName],
    namespaceActionType: actionType => ret.actionTypesPrefix + actionType,
  };
};

// Module =========================================================================================

export interface IModuleBase<Name extends string, ConfigType extends IModuleConfig<Name, State>, State> {
  config: ConfigType;
  reducer: Reducer<State>;
}

/**
 * all props passed to the Module constructor to create a Module.
 */
export interface IModuleDeclaration<Name extends string, ConfigType extends IModuleConfig<Name, State>, State, Root>
  extends IModuleBase<Name, ConfigType, State> {
  getRoot: () => Root /*(React.ComponentClass | React.FunctionComponent)*/;
}

/**
 * Use this class constructor to init a module from its definition.
 * Note: before being intantiated, EVERY dependant module MUST have registered their things in its module map.
 * ToDo: make a resolution algorithm to make things easier ?
 */
export class Module<Name extends string, ConfigType extends IModuleConfig<Name, State>, State, Root>
  implements IModuleBase<Name, ConfigType, State>
{
  // Gathered from declaration
  config: ConfigType;
  reducer: Reducer<State>;
  _getRoot: () => Root;
  // Computed during initialization
  root?: Root; /* React.ComponentClass | React.FunctionComponent | undefined */

  constructor(moduleDeclaration: IModuleDeclaration<Name, ConfigType, State, Root>) {
    this.config = moduleDeclaration.config;
    this.reducer = moduleDeclaration.reducer;
    this._getRoot = moduleDeclaration.getRoot;
  }

  init() {
    if (!this.root) {
      this.root = this._getRoot();
    }
  }

  get() {
    if (!this.root) throw new Error(`Try to get non-initialized module '${this.config.name}'`);
    return this as Required<Module<Name, ConfigType, State, Root>>;
  }
}

export type UnknownModule = Module<string, IModuleConfig<string, unknown>, unknown, unknown>;
export type AnyModule = Module<string, IModuleConfig<string, any>, any, any>;

// Navigable Modules ==============================================================================

// ToDo : move this into the future Navigation Manager ?

interface INavigableModuleConfigBase {
  iconName: string; // Name of the icon in Icomoon font. Equals to `name` if not specified.
  iconColor?: ColorValue; // Color of the icon. Default color if not specified.
  routeName: string;
}
export interface INavigableModuleConfig<Name extends string, State>
  extends IModuleConfig<Name, State>,
    INavigableModuleConfigBase {}
export interface INavigableModuleConfigDeclaration<Name extends string>
  extends IModuleConfigDeclaration<Name>,
    Partial<INavigableModuleConfigBase> {}

export const createNavigableModuleConfig = <Name extends string, State>(opts: INavigableModuleConfigDeclaration<Name>) =>
  ({
    ...createModuleConfig(opts),
    iconName: opts.iconName || opts.name,
    iconColor: opts.iconColor,
    routeName: opts.routeName || opts.name,
  } as INavigableModuleConfig<Name, State>);

export interface INavigableModuleDeclaration<
  Name extends string,
  ConfigType extends INavigableModuleConfig<Name, State>,
  State,
  Root,
> extends IModuleDeclaration<Name, ConfigType, State, Root> {
  config: ConfigType;
}

export type IAnyNavigableModuleConfig = INavigableModuleConfig<string, any>;

export class NavigableModule<
  Name extends string,
  ConfigType extends INavigableModuleConfig<Name, State>,
  State,
  Root extends React.ComponentClass | React.FunctionComponent,
> extends Module<Name, ConfigType, State, Root> {
  config: ConfigType;
  // Computed during initialization
  route?: NavigationRouteConfig<any, any>;

  constructor(moduleDeclaration: INavigableModuleDeclaration<Name, ConfigType, State, Root>) {
    super(moduleDeclaration);
    this.config = moduleDeclaration.config;
  }

  init() {
    super.init();
    if (!this.route) this.route = this.createModuleRoute();
  }

  get() {
    if (!this.root || !this.route) throw new Error(`Try to get non-initialized module '${this.config.name}'`);
    return this as Required<NavigableModule<Name, ConfigType, State, Root>>;
  }

  createModuleRoute() {
    return {
      screen: this.root!,
      navigationOptions: createMainTabNavOption(I18n.t(this.config.displayName), this.config.iconName),
    };
  }
}

export type UnknownNavigableModule = NavigableModule<
  string,
  INavigableModuleConfig<string, unknown>,
  unknown,
  React.ComponentClass | React.FunctionComponent
>;
export type AnyNavigableModule = NavigableModule<
  string,
  INavigableModuleConfig<string, any>,
  any,
  React.ComponentClass | React.FunctionComponent
>;

export type RouteMap = NavigationRouteConfigMap<
  StackNavigationOptions,
  StackNavigationProp<NavigationRoute<NavigationParams>, NavigationParams>,
  unknown
>;

// Module Array ===================================================================================

// Modules included in the app as it appears in IncludedModules.tsx
// They may have a config override with the array-style syntax
export type ModuleInclusion<ModuleType extends UnknownModule> = [ModuleType, IUnkownModuleConfig?] | ModuleType;

/**
 * An set of loaded modules.
 * This class extends built-in Array object.
 */
export class ModuleArray<ModuleType extends UnknownModule = UnknownModule> extends Array<ModuleType> {
  constructor(...items) {
    super(...items);
    Object.setPrototypeOf(this, ModuleArray.prototype); // See https://github.com/Microsoft/TypeScript-wiki/blob/main/Breaking-Changes.md#extending-built-ins-like-error-array-and-map-may-no-longer-work
  }
  filterAvailables(availableApps: IEntcoreApp[]) {
    return new ModuleArray<ModuleType>(...this.filter(m => !!availableApps.find(app => m.config.matchEntcoreApp(app))));
  }
  getReducers() {
    return this.reduce((acc, m) => {
      acc[m.config.reducerName] = m.reducer;
      return acc;
    }, {} as { [key: string]: Reducer<unknown> });
  }
  getScopes() {
    const scopes = [] as string[];
    for (const m of this) {
      scopes.push(...m.config.entcoreScope);
    }
    return scopes;
  }
  initModules() {
    this.forEach(m => m.init());
    return this;
  }
}
export class NavigableModuleArray<
  ModuleType extends UnknownNavigableModule = UnknownNavigableModule,
> extends ModuleArray<ModuleType> {
  constructor(...items) {
    super(...items);
    Object.setPrototypeOf(this, NavigableModuleArray.prototype); // See https://github.com/Microsoft/TypeScript-wiki/blob/main/Breaking-Changes.md#extending-built-ins-like-error-array-and-map-may-no-longer-work
  }
  filterAvailables(availableApps: IEntcoreApp[]) {
    return new NavigableModuleArray<ModuleType>(...this.filter(m => !!availableApps.find(app => m.config.matchEntcoreApp(app))));
  }
  getRoutes() {
    const routes = {} as { [k: string]: NavigationRouteConfig<any, any, unknown> };
    for (const m of this) {
      routes[m.config.routeName] = m.get().route;
    }
    return routes;
  }
}

/**
 * load a Array of modules with an option custom configuration
 * @param moduleInclusions Array of module require()s and their optional custom config.
 * @returns
 */
export const loadModules = <ModuleType extends UnknownModule = UnknownModule>(moduleInclusions: ModuleInclusion<ModuleType>[]) => {
  const moduleMap: { [key: string]: ModuleType } = {};
  moduleInclusions.forEach(moduleInc => {
    // 1. Load module in the map
    const module = Array.isArray(moduleInc) ? moduleInc[0] : moduleInc;
    if (moduleMap.hasOwnProperty(module.config.name)) {
      console.debug(`[ModuleTool] Duplicate module identifier "${module.config.name}".`);
    }
    moduleMap[module.config.name] = module;
    // 2. Load custom configuration if provided
    if (Array.isArray(moduleInc) && moduleInc[1]) {
      Object.assign(module.config, moduleInc[1]); // Also MUTATES the config imported from moduleConfig.ts
    }
  });
  return new ModuleArray(...Object.values(moduleMap));
};

// Module registers ===============================================================================

/**
 * Create a register to store module dependencies and links.
 */
export class CustomRegister<ItemType, FormattedRegisterType> {
  items: { item: ItemType; order: number }[];
  formater: (items: ItemType[]) => FormattedRegisterType;
  constructor(formater: (items: ItemType[]) => FormattedRegisterType) {
    this.items = [];
    this.formater = formater;
  }
  register(item: ItemType, order?: number) {
    this.items.push({ item, order: order ?? 0 });
    return item; // Allow chaining
  }
  get() {
    return this.formater(this.items.sort((a, b) => a.order - b.order).map(i => i.item));
  }
}

export class ModuleRegister<ModuleType extends UnknownModule> extends CustomRegister<ModuleType, ModuleArray<ModuleType>> {
  constructor() {
    super(modules => new ModuleArray(...modules));
  }
}

const globalRegisters: { [key: string]: CustomRegister<any, any> } = {};
export const setGlobalRegister = (name: string, register: CustomRegister<any, any>) => {
  globalRegisters[name] = register;
};
export const getGlobalRegister = <RegisterType extends CustomRegister<unknown, unknown>>(name?: string) => {
  return name ? (globalRegisters[name] as RegisterType | undefined) : undefined;
};

/**
 * Registers given modules in the right global register depending on its moduleConfig.
 * @param modules
 * @returns
 */
export const dynamiclyRegisterModules = <ModuleType extends AnyModule = AnyModule>(modules: ModuleArray<ModuleType>) => {
  modules.forEach(module => {
    const register = getGlobalRegister(module.config.registerAs);
    register && register.register(module, module.config.registerOrder);
  });
  return modules; // Allow chaining
};

// Tab modules register ===========================================================================

// ToDo : move this into the future Navigation Manager ?

export const tabModules = new ModuleRegister<AnyNavigableModule>();
setGlobalRegister('tabModule', tabModules);
