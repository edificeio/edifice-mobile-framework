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
import { IAppConf, IPlatformConf } from "../infra/appConf";

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

export enum ModuleGroup {
  NO_GROUP,
  TAB_MODULE,
  MYAPPS_MODULE,
  TIMELINE_MODULE
}

interface IModuleConfigBase<Name extends string> {
  // Module configured information
  name: Name;                // Technical (and unique) name of the module. This module will be referenced by this name everywhere in the code.
  iconName: string;          // Name of the icon in Icomoon font. Equals to `name` if not specified.
  iconColor?: string;         // Color of the icon. Default color if not specified.
  displayName: string;       // I18n key of the module title displayed. Equals to `name` if not specified.
  group: ModuleGroup;        // Name the navigation group where the module will be accessible. If no group specified, the module will be included but not accessible.
  order: number;
  // Grouping is based on Array.filter. Mismatches leads to a non-visible module in any navigator.
  // Note : Modules can have their own custom navigation groups.

  // matchEntcoreApp: ((entcoreApp: IEntcoreApp) => boolean); // Function that tell if the module can be accessible by the user. If stirng is provided, compare to prefix.
  entcoreScope: string[]     // oAuth scope required for this module

  // Module computed information
  actionTypesPrefix: string; // Uppercase prefix used for action types. Computed from `name` if not specified.
  reducerName: string;       // Name of the reducer. Computed from `name` if not specified.

  // Additional keys
  [k: string]: any;
}

export interface IModuleConfig<Name extends string> extends IModuleConfigBase<Name> {
  matchEntcoreApp: ((entcoreApp: IEntcoreApp) => boolean); // Function that tell if the module can be accessible by the user. If stirng is provided, compare to prefix.
}

export interface IModuleConfigDeclaration<Name extends string> extends Partial<IModuleConfigBase<Name>> {
  name: Name;
  matchEntcoreApp?: string | ((entcoreApp: IEntcoreApp) => boolean);
};

export const createModuleConfig: <Name extends string>(opts: IModuleConfigDeclaration<Name>) => IModuleConfig<Name> = opts => {
  const ret = {
    name: opts.name,
    iconName: opts.iconName || opts.name,
    iconColor: opts.iconColor,
    displayName: opts.displayName || opts.name,
    group: opts.group || ModuleGroup.NO_GROUP,
    order: opts.order || 0,
    matchEntcoreApp: (typeof opts.matchEntcoreApp === 'string'
      ? ((entcoreApp: IEntcoreApp) => entcoreApp.address === opts.matchEntcoreApp)
      : opts.matchEntcoreApp) || (() => true),
    entcoreScope: opts.entcoreScope || [],
    actionTypesPrefix: opts.actionTypesPrefix || toSnakeCase(opts.name).toUpperCase() + "_",
    reducerName: opts.reducerName || opts.name
  };
  const otherOpts = Object.fromEntries(Object.entries(opts).filter(([k, v]) => !ret.hasOwnProperty(k)));
  return { ...ret, ...otherOpts };
}

export interface IActionMap {
  [key: string]: ThunkAction<any, any, any, any> | AnyAction | IActionMap
}

export interface IModuleDeclaration<Name extends string, State, ActionMap extends IActionMap> {
  config: IModuleConfig<Name>,
  mainComp: React.ComponentClass | React.FunctionComponent,
  reducer: Reducer<State>,
  actions: ActionMap
}
export interface IModule<Name extends string, State, ActionMap extends IActionMap> extends IModuleDeclaration<Name, State, ActionMap> {
  route: any,
}

/**
 * Use this class constructor to init a module from its definition.
 */
export class Module<Name extends string, State, ActionMap extends IActionMap>
  implements IModule<Name, State, ActionMap> {
  config: IModuleConfig<Name>;
  mainComp: React.ComponentClass | React.FunctionComponent;
  reducer: Reducer<State>;
  actions: ActionMap;
  route: any;
  constructor(moduleDeclaration: IModuleDeclaration<Name, State, ActionMap>) {
    this.config = moduleDeclaration.config;
    this.mainComp = moduleDeclaration.mainComp;
    this.reducer = moduleDeclaration.reducer;
    this.actions = moduleDeclaration.actions;
    this.route = this.createModuleRoute();
  }

  createModuleRoute() {
    return {
      screen: this.mainComp,
      navigationOptions: (() => {
        switch (this.config.group) {
          case ModuleGroup.NO_GROUP: return {};
          case ModuleGroup.TAB_MODULE: return createMainTabNavOption(I18n.t(this.config.displayName), this.config.iconName);
          case ModuleGroup.MYAPPS_MODULE: return {};
          case ModuleGroup.TIMELINE_MODULE: return {};
        }
      })()
    }
  }
}

export interface ModuleMap { [key: string]: IModule<typeof key, unknown, IActionMap> }
export interface ModuleConfigMap { [key: string]: IModuleConfig<typeof key> }

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

export const getModuleReducers: (modules: ModuleMap) => { [key: string]: Reducer } = modules => {
  return Object.fromEntries(Object.entries(modules).map(([k, v]) => [k, v.reducer]));
}

export const getModuleRoutes: (modules: ModuleMap) => { [key: string]: Reducer } = modules => {
  return Object.fromEntries(Object.entries(modules).map(([k, v]) => [k, v.route]));
}

export const getModulesByFilter: (modules: ModuleMap, filterFunc: ((m: IModule<string, unknown, IActionMap>) => boolean)) => ModuleMap = (modules, filterFunc) => {
  return Object.fromEntries(Object.entries(modules).filter(([k, v]) => filterFunc(v)));
}

export const getAvailableModules: (modules: ModuleMap, availableApps: IEntcoreApp[]) => ModuleMap = (modules, availableApps) => {
  return Object.fromEntries(Object.entries(modules).filter(([k, v]) => availableApps.find(app => v.config.matchEntcoreApp(app))));
}

export const getAvailableModulesConfigs: (moduleConfigs: ModuleConfigMap, availableApps: IEntcoreApp[]) => ModuleConfigMap = (moduleConfigs, availableApps) => {
  return Object.fromEntries(Object.entries(moduleConfigs).filter(([k, v]) => availableApps.find(app => v.matchEntcoreApp(app))));
}

export const getModulesScope: (moduleConfigs: ModuleConfigMap) => string[] = moduleConfigs => {
  return [...new Set(Object.values(moduleConfigs).map(c  => c.entcoreScope).flat())];
}