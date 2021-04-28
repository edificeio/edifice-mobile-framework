/**
 * ModuleTool
 * Everything for managing and declaring modules
 */

import { toSnakeCase } from "../utils/string";
import * as React from "react";
import { Reducer, AnyAction } from "redux";
import { ThunkAction } from "redux-thunk";
import { createMainTabNavOption } from "../navigation/helpers/mainTabNavigator";
import I18n from "i18n-js";
import { NavigationRouteConfig } from "react-navigation";

/**
 * Describes an app asit lives in Entcore, on the platform.
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
  iconName: string;          // Name of the icon in Icomoon font. Equals to `name` if not specified.
  iconColor?: string;        // Color of the icon. Default color if not specified.
  displayName: string;       // I18n key of the module title displayed. Equals to `name` if not specified.

  // matchEntcoreApp: ((entcoreApp: IEntcoreApp) => boolean); // Function that tell if the module can be accessible by the user. If stirng is provided, compare to prefix.
  entcoreScope: string[]     // oAuth scope required for this module

  // Module computed information
  actionTypesPrefix: string; // Uppercase prefix used for action types. Computed from `name` if not specified.
  reducerName: string;       // Name of the reducer. Computed from `name` if not specified.

  // Additional keys
  [k: string]: any;
}

export interface IModuleConfig<Name extends string, State> extends IModuleConfigBase<Name> {
  matchEntcoreApp: ((entcoreApp: IEntcoreApp) => boolean); // Function that tell if the module can be accessible by the user. If stirng is provided, compare to prefix.
  getState: (globalState: any) => State;
  namespaceActionType: (actionType: string) => string;
}

export interface IModuleConfigDeclaration<Name extends string> extends Partial<IModuleConfigBase<Name>> {
  name: Name;
  matchEntcoreApp?: string | ((entcoreApp: IEntcoreApp) => boolean);
};

export const createModuleConfig: <Name extends string, State>(opts: IModuleConfigDeclaration<Name>) => IModuleConfig<Name, State> = opts => {
  const ret = {
    name: opts.name,
    iconName: opts.iconName || opts.name,
    iconColor: opts.iconColor,
    displayName: opts.displayName || opts.name,
    matchEntcoreApp: (typeof opts.matchEntcoreApp === 'string'
      ? ((entcoreApp: IEntcoreApp) => entcoreApp.address === opts.matchEntcoreApp)
      : opts.matchEntcoreApp) || (() => true),
    entcoreScope: opts.entcoreScope || [],
    actionTypesPrefix: opts.actionTypesPrefix || toSnakeCase(opts.name).toUpperCase() + "_",
    reducerName: opts.reducerName || opts.name
  };
  const otherOpts = Object.fromEntries(Object.entries(opts).filter(([k, v]) => !ret.hasOwnProperty(k)));
  return { ...ret, ...otherOpts,
    getState: globalState => globalState[ret.reducerName],
    namespaceActionType: actionType => ret.actionTypesPrefix + actionType
  };
}

export interface IActionMap {
  [key: string]: ThunkAction<any, any, any, any> | AnyAction | IActionMap
}

export interface IModuleDeclaration<Name extends string, State, ActionMap extends IActionMap> {
  config: IModuleConfig<Name, State>,
  mainComp: React.ComponentClass | React.FunctionComponent,
  reducer: Reducer<State>
}
export interface IModule<Name extends string, State, ActionMap extends IActionMap> extends IModuleDeclaration<Name, State, ActionMap> {
  route: any,
}

/**
 * Use this class constructor to init a module from its definition.
 */
export class Module<Name extends string, State, ActionMap extends IActionMap>
  implements IModule<Name, State, ActionMap> {
  config: IModuleConfig<Name, State>;
  mainComp: React.ComponentClass | React.FunctionComponent;
  reducer: Reducer<State>;
  route: any;
  constructor(moduleDeclaration: IModuleDeclaration<Name, State, ActionMap>) {
    this.config = moduleDeclaration.config;
    this.mainComp = moduleDeclaration.mainComp;
    this.reducer = moduleDeclaration.reducer;
    this.route = this.createModuleRoute();
  }

  createModuleRoute() {
    return {
      screen: this.mainComp,
      navigationOptions: createMainTabNavOption(I18n.t(this.config.displayName), this.config.iconName)
    }
  }
}

export type AnyModule = IModule<string, any, IActionMap>;
export interface ModuleMap { [key: string]: IModule<typeof key, unknown, IActionMap> }
export interface ModuleConfigMap { [key: string]: IModuleConfig<typeof key, any> }

export const loadModuleMap: (modules: Array<IModule<string, unknown, IActionMap>>)
  => ModuleMap
  = modules => {
    const ret = {};
    for (const m of modules) {
      if (ret.hasOwnProperty(m.config.name)) {
        console.warn(`[ModuleTool] Duplicate module identifier "${m.config.name}".`);
      }
      ret[m.config.name] = m;
    }
    return ret;
  }

export const loadModuleConfigMap: (modules: Array<IModuleConfigDeclaration<string>>)
  => ModuleConfigMap
  = modules => {
    const ret = {};
    for (const c of modules) {
      if (ret.hasOwnProperty(c.name)) {
        console.warn(`[ModuleTool] Duplicate module config identifier "${c.name}".`);
      }
      ret[c.name] = createModuleConfig(c);
    }
    return ret;

    // ToDo extract here custom module config from appConf
  }

/** Get reducers map from given ModuleMap */
export const getModuleReducers: (modules: ModuleMap) => { [key: string]: Reducer } = modules => {
  return Object.fromEntries(Object.entries(modules).map(([k, v]) => [k, v.reducer]));
}

/** Get routes map from given ModuleMap */
export const getModuleRoutes: (modules: ModuleMap) => { [key: string]: NavigationRouteConfig<any, any, unknown> } = modules => {
  return Object.fromEntries(Object.entries(modules).map(([k, v]) => [k, v.route]));
}
/** Get routes map from a given array of modules */
export const getModuleRoutesByArray: (modules: AnyModule[]) => { [key: string]: NavigationRouteConfig<any, any, unknown> } = (modules) => {
  return Object.fromEntries(modules.map(m => [m.config.name, m.route]));
}

/** Get ModuleMap by filtering a given ModuleMap */
export const getModulesByFilter: (modules: ModuleMap, filterFunc: ((m: IModule<string, unknown, IActionMap>) => boolean)) => ModuleMap = (modules, filterFunc) => {
  return Object.fromEntries(Object.entries(modules).filter(([k, v]) => filterFunc(v)));
}

/** Get ModuleMap by filtering a given ModuleMap corresponding to user's available apps */
export const getAvailableModules: (modules: ModuleMap, availableApps: IEntcoreApp[]) => ModuleMap = (modules, availableApps) => {
  return Object.fromEntries(Object.entries(modules).filter(([k, v]) => availableApps.find(app => v.config.matchEntcoreApp(app))));
}

/** Get ModuleConfigMap by filtering a given ModuleConfigMap corresponding to user's available apps */
export const getAvailableModulesConfigs: (moduleConfigs: ModuleConfigMap, availableApps: IEntcoreApp[]) => ModuleConfigMap = (moduleConfigs, availableApps) => {
  return Object.fromEntries(Object.entries(moduleConfigs).filter(([k, v]) => availableApps.find(app => v.matchEntcoreApp(app))));
}

/** Get scope array from a given ModuleConfigMap */
export const getModulesScope: (moduleConfigs: ModuleConfigMap) => string[] = moduleConfigs => {
  return [...new Set(Object.values(moduleConfigs).map(c  => c.entcoreScope).flat())];
}

export type IRegisteredModule = AnyModule & { order: number }

/**
 * Create a registeredModules functions to get and register.
 * Use this in your module to create submodules.
 * @param registeredModules
 */
export const createGetRegisteredModules = (registeredModules: IRegisteredModule[]) => () => registeredModules.sort((a, b) => a.order - b.order);
export const createRegisterModule = (registeredModules: IRegisteredModule[]) =>
  (module: AnyModule, order?: number) => {
    registeredModules.push({ ...module, order: order || 0 });
    return module;
  }

/** This registeredModules is for tab modules.
 * ToDo: move this in the navigationModule (that does not exists for the moment.)
 */
const registeredTabModules: IRegisteredModule[] = [];
export const getRegisteredTabModules = createGetRegisteredModules(registeredTabModules);
export const registerTabModule = createRegisterModule(registeredTabModules);
