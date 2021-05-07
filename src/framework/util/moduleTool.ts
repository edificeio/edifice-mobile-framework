/**
 * ModuleTool
 * Everything for managing and declaring modules
 */

import { toSnakeCase } from "../../utils/string";
import * as React from "react";
import { Reducer } from "redux";
import { createMainTabNavOption } from "../../navigation/helpers/mainTabNavigator";
import I18n from "i18n-js";
import { NavigationRouteConfig } from "react-navigation";

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
}

interface IModuleConfigBase<Name extends string> {
  // Module configured information
  name: Name;                // Technical (and unique) name of the module. This module will be referenced by this name everywhere in the code.
  displayName: string;       // I18n key of the module title displayed. Equals to `name` if not specified.

  // matchEntcoreApp: ((entcoreApp: IEntcoreApp) => boolean); // Function that tell if the module can be accessible by the user. If stirng is provided, compare to prefix.
  entcoreScope: string[]     // oAuth scope required for this module

  // Module computed information
  actionTypesPrefix: string; // Uppercase prefix used for action types. Computed from `name` if not specified.
  reducerName: string;       // Name of the reducer. Computed from `name` if not specified.

  // Additional keys
  [k: string]: any;
}

/**
 * An usable moduleConfig. A moduleConfig is importable within a module itself.
 * So use moduleConfig for module constants.
 */
export interface IModuleConfig<Name extends string, State> extends IModuleConfigBase<Name> {
  matchEntcoreApp: ((entcoreApp: IEntcoreApp) => boolean); // Function that tell if the module can be accessible by the user. If stirng is provided, compare to prefix.
  getState: (globalState: any) => State;
  namespaceActionType: (actionType: string) => string;
}

export type IAnyModuleConfig = IModuleConfig<string, any>;

/**
 * A living moduleConfig is build from its declaration with the `createModuleConfig` function.
 */
export interface IModuleConfigDeclaration<Name extends string> extends Partial<IModuleConfigBase<Name>> {
  name: Name;
  matchEntcoreApp?: string | ((entcoreApp: IEntcoreApp) => boolean);
};

/**
 * Creates a usable moduleConfig from its declaration.
 */
export const createModuleConfig: <Name extends string, State>(opts: IModuleConfigDeclaration<Name>) => IModuleConfig<Name, State> = opts => {
  const ret = {
    name: opts.name,
    displayName: opts.displayName || opts.name,
    matchEntcoreApp: (typeof opts.matchEntcoreApp === 'string'
      ? ((entcoreApp: IEntcoreApp) => entcoreApp.address === opts.matchEntcoreApp)
      : opts.matchEntcoreApp) || (() => true),
    entcoreScope: opts.entcoreScope || [],
    actionTypesPrefix: opts.actionTypesPrefix || toSnakeCase(opts.name).toUpperCase() + "_",
    reducerName: opts.reducerName || opts.name
  };
  const otherOpts = Object.fromEntries(Object.entries(opts).filter(([k, v]) => !ret.hasOwnProperty(k)));
  return {
    ...ret, ...otherOpts,
    getState: globalState => globalState[ret.reducerName],
    namespaceActionType: actionType => ret.actionTypesPrefix + actionType
  };
}

// Module =========================================================================================

export interface IModuleBase<Name extends string, State, Root> {
  config: IModuleConfig<Name, State>,
  reducer: Reducer<State>
}

/**
 * all props passed to the Module constructor to create a Module.
 */
export interface IModuleDeclaration<Name extends string, State, Root> extends IModuleBase<Name, State, Root> {
  getRoot: () => Root /*(React.ComponentClass | React.FunctionComponent)*/,
}

/**
 * Use this class constructor to init a module from its definition.
 * Note: before being intantiated, EVERY dependant module MUST have registered their things in its module map.
 * ToDo: make a resolution algorithm to make things easier ?
 */
export class Module<Name extends string, State, Root> implements IModuleBase<Name, State, Root>{
  // Gathered from declaration
  config: IModuleConfig<Name, State>;
  reducer: Reducer<State>;
  _getRoot: () => Root;
  // Computed during initialization
  root?: Root;/* React.ComponentClass | React.FunctionComponent | undefined */;

  constructor(moduleDeclaration: IModuleDeclaration<Name, State, Root>) {
    this.config = moduleDeclaration.config;
    this.reducer = moduleDeclaration.reducer;
    this._getRoot = moduleDeclaration.getRoot;
  }

  init() {
    // console.log("[ModuleTool] init module " + this.config.name);
    if (!this.root) this.root = this._getRoot();
  }

  get() {
    // if (!this.root) throw new Error(`Try to get non-initialized module '${this.config.name}'`);
    return this as Required<Module<Name, State, Root>>;
  }
}

export type AnyModule = Module<string, any, any>;

export const initModules = <ModuleType extends AnyModule = AnyModule>(modules: ModuleType[]) => {
  modules.forEach(m => m.init());
  return modules; // allow chaining
};

// Navigable Modules ==============================================================================

// ToDo : move this into the future Navigation Manager ?

interface INavigableModuleConfigBase {
  iconName: string;          // Name of the icon in Icomoon font. Equals to `name` if not specified.
  iconColor?: string;        // Color of the icon. Default color if not specified.
  routeName: string;
}
export interface INavigableModuleConfig<Name extends string, State>
  extends IModuleConfig<Name, State>, INavigableModuleConfigBase { };
export interface INavigableModuleConfigDeclaration<Name extends string>
  extends IModuleConfigDeclaration<Name>, Partial<INavigableModuleConfigBase> { };

export const createNavigableModuleConfig =
  <Name extends string, State>(opts: INavigableModuleConfigDeclaration<Name>) => ({
    ...createModuleConfig(opts),
    iconName: opts.iconName || opts.name,
    iconColor: opts.iconColor,
    routeName: opts.routeName || opts.name
  } as INavigableModuleConfig<Name, State>);

export interface INavigableModuleDeclaration<Name extends string, State, Root> extends IModuleDeclaration<Name, State, Root> {
  config: INavigableModuleConfig<Name, State>
};

export class NavigableModule
  <Name extends string, State, Root extends React.ComponentClass | React.FunctionComponent>
  extends Module<Name, State, Root>{
  config: INavigableModuleConfig<Name, State>;
  // Computed during initialization
  route?: NavigationRouteConfig<any, any>

  constructor(moduleDeclaration: INavigableModuleDeclaration<Name, State, Root>) {
    super(moduleDeclaration);
    this.config = moduleDeclaration.config;
  }

  init() {
    super.init();
    // console.log("[ModuleTool] init navigable module " + this.config.name);
    if (!this.route) this.route = this.createModuleRoute();
  }

  get() {
    if (!this.root || !this.route) throw new Error(`Try to get non-initialized module '${this.config.name}'`);
    return this as Required<NavigableModule<Name, State, Root>>;
  }

  createModuleRoute() {
    return {
      screen: this.root!,
      navigationOptions: createMainTabNavOption(I18n.t(this.config.displayName), this.config.iconName)
    }
  }
}

export type AnyNavigableModule = NavigableModule<string, any, React.ComponentClass | React.FunctionComponent>;

// Module Map =====================================================================================

export interface ModuleConfigMap { [key: string]: IModuleConfig<typeof key, unknown> }
export type ModuleMap<Root, ModuleConstructor extends Module<string, any, Root> = Module<string, any, Root>> = { [key: string]: ModuleConstructor };
export type AnyModuleMap<ModuleConstructor extends Module<string, any, any> = Module<string, any, any>> = { [key: string]: ModuleConstructor };

/**
 * Rearange given modules as array in a ModuleMap.
 * @param modules
 * @returns
 */
export const createModuleMap = <Root>(modules: Array<Module<string, unknown, Root>>) => {
  const ret = {};
  for (const m of modules) {
    if (ret.hasOwnProperty(m.config.name)) {
      console.warn(`[ModuleTool] Duplicate module identifier "${m.config.name}".`);
    }
    ret[m.config.name] = m;
  }
  return ret as AnyModuleMap;
}

export const createModuleConfigMap = (moduleConfigs: Array<IModuleConfig<string, unknown>>) => {
  const ret = {};
  for (const mc of moduleConfigs) {
    if (ret.hasOwnProperty(mc.name)) {
      console.warn(`[ModuleTool] Duplicate module config identifier "${mc.name}".`);
    }
    ret[mc.name] = mc;
  }
  return ret as ModuleConfigMap;
}

// Module Map operations ==========================================================================

/** Get ModuleMap by filtering a given ModuleMap */
export const filterModuleMap = (moduleMap: AnyModuleMap, filterFunc: ((m: AnyModule) => boolean)) => {
  return Object.fromEntries(Object.entries(moduleMap).filter(([k, v]) => filterFunc(v))) as AnyModuleMap;
}

/** Get ModuleConfigMap by filtering a given ModuleConfigMap */
export const filterModuleConfigMap = (moduleMap: ModuleConfigMap, filterFunc: ((m: IAnyModuleConfig) => boolean)) => {
  return Object.fromEntries(Object.entries(moduleMap).filter(([k, v]) => filterFunc(v))) as ModuleConfigMap;
}

/** Get reducers map from given ModuleMap */
export const getModuleReducers = (moduleMap: AnyModuleMap) => {
  return Object.fromEntries(Object.entries(moduleMap).map(([k, v]) => [k, v.reducer]));
}

/** Get scope array from a given ModuleConfigMap */
export const getModulesScope = (moduleConfigMap: ModuleConfigMap) => {
  return [...new Set(Object.values(moduleConfigMap).map(c => c.entcoreScope).flat())];
}

/** Get ModuleMap by filtering a given ModuleMap corresponding to user's available apps */
export const getAvailableModules = <Module extends AnyModule = AnyModule>(modules: Module[], availableApps: IEntcoreApp[]) => {
  return modules.filter(m => availableApps.find(app => m.config.matchEntcoreApp(app)));
}

/** Get routes array from an NavigableModule array */
export const getModuleRoutes = (modules: AnyNavigableModule[]) => {
  return Object.fromEntries(modules.map(m => [m.config.routeName, m.get().route]));
}

// Module subsription =============================================================================

/**
 * Create a custom subscription functions to get and register.
 * Use this in your module to create register effects.
 * @param registeredModules
 */
export const createCustomSubscription = <Sub>(transform?: (subs: Sub[]) => Sub[]) => {
  const subs = [] as Array<Sub>;
  return {
    register: (s: Sub) => { subs.push(s); return s;},
    get: () => transform ? transform(subs) : subs
  };
};

/**
 * Create a registeredModules functions to get and register.
 * Use this in your module to create submodules.
 * @param registeredModules
 */
export const createModuleSubscription =
  <Module extends AnyModule = AnyModule>(transform?: (subs: Module[]) => Module[]) => {
    const i = (subs: Module[]) => initModules(subs);
    return createCustomSubscription<Module>(subs => transform ? transform(i(subs)) : i(subs));
  }

/**
 * Create a registeredModules functions to get and register and sort by order.
 * Use this in your module to create submodules.
 * @param registeredModules
 */
export const createModuleOrderedSubscription = <Module extends AnyModule = AnyModule>() => {
  const subs = [] as Array<{ v: Module, order: number }>;
  return {
    register: (v: Module, order: number) => { subs.push({ v, order }); return v; },
    get: () => subs.sort((a, b) => a.order - b.order).map(s => s.v)
  };
};

// Tab modules subsription ========================================================================

// ToDo : move this into the future Navigation Manager ?

export const tabModules = createModuleOrderedSubscription<AnyNavigableModule>();
