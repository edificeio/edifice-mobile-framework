/**
 * ModuleTool
 * Everything for managing and declaring modules
 */
import I18n from 'i18n-js';
import { NavigationComponent, NavigationRouteConfig } from 'react-navigation';
import type { NavigationParams, NavigationRoute, NavigationRouteConfigMap } from 'react-navigation';
import type { StackNavigationOptions, StackNavigationProp } from 'react-navigation-stack/lib/typescript/src/vendor/types';
import type { Reducer } from 'redux';



import { IGlobalState } from '~/AppStore';
import { createMainTabNavOption } from '~/navigation/helpers/mainTabNavigator';



import { PictureProps } from '../components/picture';
import { toSnakeCase } from './string';


//  8888888888          888                                              d8888
//  888                 888                                             d88888
//  888                 888                                            d88P888
//  8888888    88888b.  888888  .d8888b  .d88b.  888d888  .d88b.      d88P 888 88888b.  88888b.
//  888        888 "88b 888    d88P"    d88""88b 888P"   d8P  Y8b    d88P  888 888 "88b 888 "88b
//  888        888  888 888    888      888  888 888     88888888   d88P   888 888  888 888  888
//  888        888  888 Y88b.  Y88b.    Y88..88P 888     Y8b.      d8888888888 888 d88P 888 d88P
//  8888888888 888  888  "Y888  "Y8888P  "Y88P"  888      "Y8888  d88P     888 88888P"  88888P"
//                                                                             888      888
//                                                                             888      888
//                                                                             888      888

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

//  888b     d888               888          888           .d8888b.                     .d888 d8b
//  8888b   d8888               888          888          d88P  Y88b                   d88P"  Y8P
//  88888b.d88888               888          888          888    888                   888
//  888Y88888P888  .d88b.   .d88888 888  888 888  .d88b.  888         .d88b.  88888b.  888888 888  .d88b.
//  888 Y888P 888 d88""88b d88" 888 888  888 888 d8P  Y8b 888        d88""88b 888 "88b 888    888 d88P"88b
//  888  Y8P  888 888  888 888  888 888  888 888 88888888 888    888 888  888 888  888 888    888 888  888
//  888   "   888 Y88..88P Y88b 888 Y88b 888 888 Y8b.     Y88b  d88P Y88..88P 888  888 888    888 Y88b 888
//  888       888  "Y88P"   "Y88888  "Y88888 888  "Y8888   "Y8888P"   "Y88P"  888  888 888    888  "Y88888
//                                                                                                     888
//                                                                                                Y8b d88P
//                                                                                                 "Y88P"

interface IModuleConfig_Base<Name extends string> {
  name: Name; // Unique identifier of this module. Use the same as its folder name.
  entcoreScope: string[];
}
interface IModuleConfig_Rights {
  matchEntcoreApp: (entcoreApp: IEntcoreApp, allEntcoreApps: IEntcoreApp[]) => boolean;
}
interface IModuleConfigDeclaration_Rights {
  matchEntcoreApp: IModuleConfig_Rights['matchEntcoreApp'] | string;
}
interface IModuleConfigDeclaration_Redux {
  actionTypesPrefix: string; // Uppercase prefix used for action types. Computed from `name` if not specified.
  reducerName: string; // Name of the reducer. Computed from `name` if not specified.
}
interface IModuleConfig_Redux<State> extends IModuleConfigDeclaration_Redux {
  namespaceActionType: (actionType: string) => string;
  getState: (globalState: IGlobalState) => State;
}
interface IModuleConfig_Tracking {
  trackingName: string; // Name used for tracking category. Computed from `name` if not specified.
}
// All information config available about a module
export type IModuleConfig<Name extends string, State> = IModuleConfig_Base<Name> &
  IModuleConfig_Rights &
  IModuleConfig_Redux<State> &
  IModuleConfig_Tracking & {
    init: (matchingApps: IEntcoreApp[], allEntcoreApps: IEntcoreApp[]) => void;
    isReady: boolean;
  };
// All information config as needed to be declared.
export type IModuleConfigDeclaration<Name extends string> = IModuleConfig_Base<Name> &
  IModuleConfigDeclaration_Rights &
  Partial<IModuleConfigDeclaration_Redux> &
  Partial<IModuleConfig_Tracking>;
export type IUnkownModuleConfig = IModuleConfig<string, unknown>;
export type IAnyModuleConfig = IModuleConfig<string, any>;

/**
 * Instancies a usable module config from its declaration.
 */
export class ModuleConfig<Name extends string, State> implements IModuleConfig<Name, State> {
  name: IModuleConfig<Name, State>['name'];
  entcoreScope: IModuleConfig<Name, State>['entcoreScope'];
  matchEntcoreApp: IModuleConfig<Name, State>['matchEntcoreApp'];
  actionTypesPrefix: IModuleConfig<Name, State>['actionTypesPrefix'];
  reducerName: IModuleConfig<Name, State>['reducerName'];
  namespaceActionType: IModuleConfig<Name, State>['namespaceActionType'];
  getState: IModuleConfig<Name, State>['getState'];
  trackingName: IModuleConfig<Name, State>['trackingName'];

  constructor(decl: IModuleConfigDeclaration<Name>) {
    const { name, entcoreScope, matchEntcoreApp, actionTypesPrefix, reducerName, trackingName, ...rest } = decl;
    // Base
    this.name = name;
    this.entcoreScope = entcoreScope;
    // Rights
    this.matchEntcoreApp =
      (typeof matchEntcoreApp === 'string'
        ? (entcoreApp: IEntcoreApp) => entcoreApp.address === matchEntcoreApp
        : matchEntcoreApp) || (() => true);
    // Redux
    this.actionTypesPrefix = actionTypesPrefix ?? toSnakeCase(this.name).toUpperCase() + '_';
    this.reducerName = reducerName ?? this.name;
    this.namespaceActionType = actionType => this.actionTypesPrefix + actionType;
    this.getState = (globalState: IGlobalState) => globalState[this.reducerName];
    // Tracking
    this.trackingName = trackingName ?? this.name;
    // Rest
    Object.assign(this, rest);
  }

  isReady: boolean = false;
  init(matchingApps: IEntcoreApp[], allEntcoreApps: IEntcoreApp[]) {
    this.handleInit(matchingApps, allEntcoreApps);
    this.isReady = true;
  }
  handleInit(matchingApps: IEntcoreApp[], allEntcoreApps: IEntcoreApp[]) {}
}

//  888b     d888               888          888
//  8888b   d8888               888          888
//  88888b.d88888               888          888
//  888Y88888P888  .d88b.   .d88888 888  888 888  .d88b.
//  888 Y888P 888 d88""88b d88" 888 888  888 888 d8P  Y8b
//  888  Y8P  888 888  888 888  888 888  888 888 88888888
//  888   "   888 Y88..88P Y88b 888 Y88b 888 888 Y8b.
//  888       888  "Y88P"   "Y88888  "Y88888 888  "Y8888

export interface IModule_Base<Name extends string, ConfigType extends IModuleConfig<Name, State>, State> {
  config: ConfigType;
}
export interface IModule_Redux<State> {
  reducer: Reducer<State>;
}
export interface IModule<Name extends string, ConfigType extends IModuleConfig<Name, State>, State>
  extends IModule_Base<Name, ConfigType, State>,
    IModule_Redux<State> {
  // ToDo add Module methods here
}

export interface IModuleDeclaration<Name extends string, ConfigType extends IModuleConfig<Name, State>, State>
  extends IModule_Base<Name, ConfigType, State>,
    IModule_Redux<State> {}

/**
 * Use this class constructor to init a module from its definition.
 * Note: before being intantiated, EVERY dependant module MUST have registered their things in its module map.
 * ToDo: make a resolution algorithm to make things easier ?
 */
export class Module<Name extends string, ConfigType extends IModuleConfig<Name, State>, State>
  implements IModule<Name, ConfigType, State>
{
  // Gathered from declaration
  config: ConfigType;
  reducer: Reducer<State>;

  constructor(moduleDeclaration: IModuleDeclaration<Name, ConfigType, State>) {
    this.config = moduleDeclaration.config;
    this.reducer = moduleDeclaration.reducer;
  }

  init(matchingApps: IEntcoreApp[], allEntcoreApps: IEntcoreApp[]) {
    if (!this.config.isReady) throw new Error(`Try to init module with non-initialized config '${this.config.name}'`);
    this.handleInit(matchingApps, allEntcoreApps)
  }
  handleInit(matchingApps: IEntcoreApp[], allEntcoreApps: IEntcoreApp[]) {}

  get isReady() { return true; }

  get() {
    if (!this.isReady) throw new Error(`Try to get non-initialized module '${this.config.name}'`);
    return this as Required<Module<Name, ConfigType, State>>;
  }
}

export type UnknownModule = Module<string, IModuleConfig<string, unknown>, unknown>;
export type AnyModule = Module<string, IModuleConfig<string, any>, any>;

//  888b    888                   d8b                   888      888          888b     d888               888          888           .d8888b.                     .d888 d8b
//  8888b   888                   Y8P                   888      888          8888b   d8888               888          888          d88P  Y88b                   d88P"  Y8P
//  88888b  888                                         888      888          88888b.d88888               888          888          888    888                   888
//  888Y88b 888  8888b.  888  888 888  .d88b.   8888b.  88888b.  888  .d88b.  888Y88888P888  .d88b.   .d88888 888  888 888  .d88b.  888         .d88b.  88888b.  888888 888  .d88b.
//  888 Y88b888     "88b 888  888 888 d88P"88b     "88b 888 "88b 888 d8P  Y8b 888 Y888P 888 d88""88b d88" 888 888  888 888 d8P  Y8b 888        d88""88b 888 "88b 888    888 d88P"88b
//  888  Y88888 .d888888 Y88  88P 888 888  888 .d888888 888  888 888 88888888 888  Y8P  888 888  888 888  888 888  888 888 88888888 888    888 888  888 888  888 888    888 888  888
//  888   Y8888 888  888  Y8bd8P  888 Y88b 888 888  888 888 d88P 888 Y8b.     888   "   888 Y88..88P Y88b 888 Y88b 888 888 Y8b.     Y88b  d88P Y88..88P 888  888 888    888 Y88b 888
//  888    Y888 "Y888888   Y88P   888  "Y88888 "Y888888 88888P"  888  "Y8888  888       888  "Y88P"   "Y88888  "Y88888 888  "Y8888   "Y8888P"   "Y88P"  888  888 888    888  "Y88888
//                                         888                                                                                                                                   888
//                                    Y8b d88P                                                                                                                              Y8b d88P
//                                     "Y88P"                                                                                                                                "Y88P"

interface INavigableModuleConfig_Display {
  displayI18n: string; // I18n key of the module title displayed.
  displayAs?: string; // In which global register to put this module
  displayOrder: number; // In which order
  displayPicture?: PictureProps; // Picture used to show the module acces link/button
  displayPictureFocus?: PictureProps; // Picture used to show the modulle acces link/button when its active
  routeName: string; // Technical route name of the module. Must be unique (by default, same as the module name).
}
interface IModuleConfigDeclaration_Display {
  displayI18n:
    | INavigableModuleConfig_Display['displayI18n']
    | ((matchingApps: IEntcoreApp[], allEntcoreApps: IEntcoreApp[]) => INavigableModuleConfig_Display['displayI18n']);
  displayAs?:
    | INavigableModuleConfig_Display['displayAs']
    | ((matchingApps: IEntcoreApp[], allEntcoreApps: IEntcoreApp[]) => INavigableModuleConfig_Display['displayAs']);
  displayOrder?:
    | INavigableModuleConfig_Display['displayOrder']
    | ((matchingApps: IEntcoreApp[], allEntcoreApps: IEntcoreApp[]) => INavigableModuleConfig_Display['displayOrder']);
  displayPicture?:
    | INavigableModuleConfig_Display['displayPicture']
    | ((matchingApps: IEntcoreApp[], allEntcoreApps: IEntcoreApp[]) => INavigableModuleConfig_Display['displayPicture']);
  displayPictureFocus?:
    | INavigableModuleConfig_Display['displayPictureFocus']
    | ((matchingApps: IEntcoreApp[], allEntcoreApps: IEntcoreApp[]) => INavigableModuleConfig_Display['displayPictureFocus']);
  routeName?: INavigableModuleConfig_Display['routeName'];
}

// All information config available about a navigable module
export type INavigableModuleConfig<Name extends string, State> = IModuleConfig<Name, State> & INavigableModuleConfig_Display;
// All information config as needed to be declared.
export type INavigableModuleConfigDeclaration<Name extends string> = IModuleConfigDeclaration<Name> &
  IModuleConfigDeclaration_Display;
export type UnkownNavigableModuleConfig = INavigableModuleConfig<string, unknown>;
export type AnyNavigableModuleConfig = INavigableModuleConfig<string, any>;

export class NavigableModuleConfig<Name extends string, State>
  extends ModuleConfig<Name, State>
  implements INavigableModuleConfig<Name, State>
{
  // gathered from declaration
  routeName: INavigableModuleConfig<Name, State>['routeName'];

  // declaration backup for computing
  #_displayI18n: INavigableModuleConfigDeclaration<Name>['displayI18n'];
  #_displayAs: INavigableModuleConfigDeclaration<Name>['displayAs'];
  #_displayOrder: INavigableModuleConfigDeclaration<Name>['displayOrder'];
  #_displayPicture: INavigableModuleConfigDeclaration<Name>['displayPicture'];
  #_displayPictureFocus: INavigableModuleConfigDeclaration<Name>['displayPictureFocus'];

  // computed values after init
  #displayI18n?: INavigableModuleConfig<Name, State>['displayI18n'];
  #displayAs?: INavigableModuleConfig<Name, State>['displayAs'];
  #displayOrder?: INavigableModuleConfig<Name, State>['displayOrder'];
  #displayPicture?: INavigableModuleConfig<Name, State>['displayPicture'];
  #displayPictureFocus?: INavigableModuleConfig<Name, State>['displayPictureFocus'];

  constructor(decl: INavigableModuleConfigDeclaration<Name>) {
    const { displayI18n, displayAs, displayOrder, displayPicture, displayPictureFocus, routeName, ...rest } = decl;
    super(rest);
    this.#_displayI18n = displayI18n;
    this.#_displayAs = displayAs;
    this.#_displayOrder = displayOrder ?? 0;
    this.#_displayPicture = displayPicture;
    this.#_displayPictureFocus = displayPictureFocus ?? displayPicture;
    this.routeName = routeName ?? this.name;
  }

  handleInit(matchingApps: IEntcoreApp[], allEntcoreApps: IEntcoreApp[]) {
    this.#displayI18n = typeof this.#_displayI18n === 'function' ? this.#_displayI18n(matchingApps, allEntcoreApps) : this.#_displayI18n;
    this.#displayAs = typeof this.#_displayAs === 'function' ? this.#_displayAs(matchingApps, allEntcoreApps) : this.#_displayAs;
    this.#displayOrder = typeof this.#_displayOrder === 'function' ? this.#_displayOrder(matchingApps, allEntcoreApps) : this.#_displayOrder;
    this.#displayPicture =
      typeof this.#_displayPicture === 'function' ? this.#_displayPicture(matchingApps, allEntcoreApps) : this.#_displayPicture;
    this.#displayPictureFocus =
      typeof this.#_displayPictureFocus === 'function' ? this.#_displayPictureFocus(matchingApps, allEntcoreApps) : this.#_displayPictureFocus;
  }

  get displayI18n() {
    if (!this.isReady || this.#displayI18n === undefined)
      throw new Error(`Try to get display info of non-initialized module '${this.name}'`);
    return this.#displayI18n;
  }
  get displayAs() {
    if (!this.isReady) throw new Error(`Try to get display info of non-initialized module '${this.name}'`);
    return this.#displayAs;
  }
  get displayOrder() {
    if (!this.isReady || this.#displayOrder === undefined)
      throw new Error(`Try to get display info of non-initialized module '${this.name}'`);
    return this.#displayOrder;
  }
  get displayPicture() {
    if (!this.isReady) throw new Error(`Try to get display info of non-initialized module '${this.name}'`);
    return this.#displayPicture;
  }
  get displayPictureFocus() {
    if (!this.isReady) throw new Error(`Try to get display info of non-initialized module '${this.name}'`);
    return this.#displayPictureFocus;
  }
}

//  888b    888                   d8b                   888      888          888b     d888               888          888
//  8888b   888                   Y8P                   888      888          8888b   d8888               888          888
//  88888b  888                                         888      888          88888b.d88888               888          888
//  888Y88b 888  8888b.  888  888 888  .d88b.   8888b.  88888b.  888  .d88b.  888Y88888P888  .d88b.   .d88888 888  888 888  .d88b.
//  888 Y88b888     "88b 888  888 888 d88P"88b     "88b 888 "88b 888 d8P  Y8b 888 Y888P 888 d88""88b d88" 888 888  888 888 d8P  Y8b
//  888  Y88888 .d888888 Y88  88P 888 888  888 .d888888 888  888 888 88888888 888  Y8P  888 888  888 888  888 888  888 888 88888888
//  888   Y8888 888  888  Y8bd8P  888 Y88b 888 888  888 888 d88P 888 Y8b.     888   "   888 Y88..88P Y88b 888 Y88b 888 888 Y8b.
//  888    Y888 "Y888888   Y88P   888  "Y88888 "Y888888 88888P"  888  "Y8888  888       888  "Y88P"   "Y88888  "Y88888 888  "Y8888
//                                         888
//                                    Y8b d88P
//                                     "Y88P"

export interface INavigableModule_Base<
  Name extends string,
  ConfigType extends IModuleConfig<Name, State>,
  State,
  Root extends NavigationComponent<any, any>,
> extends IModule<Name, ConfigType, State> {
  getRoot(matchingApps: IEntcoreApp[], allEntcoreApps: IEntcoreApp[]): Root;
}
export interface INavigableModule<
  Name extends string,
  ConfigType extends IModuleConfig<Name, State>,
  State,
  Root extends NavigationComponent<any, any>,
> extends INavigableModule_Base<Name, ConfigType, State, Root> {
  // ToDo add Module methods here
}

export interface INavigableModuleDeclaration<
  Name extends string,
  ConfigType extends IModuleConfig<Name, State>,
  State,
  Root extends NavigationComponent<any, any>,
> extends INavigableModule_Base<Name, ConfigType, State, Root>,
    IModule_Redux<State> {}

export class NavigableModule<
    Name extends string,
    ConfigType extends INavigableModuleConfig<Name, State>,
    State,
    Root extends NavigationComponent<any, any>,
  >
  extends Module<Name, ConfigType, State>
  implements IModule<Name, ConfigType, State>
{
  // Gathered from declaration
  getRoot: INavigableModule<Name, ConfigType, State, Root>['getRoot'];
  // Self-managed
  #root?: Root;
  #route?: NavigationRouteConfig<any, any>;

  constructor(moduleDeclaration: INavigableModuleDeclaration<Name, ConfigType, State, Root>) {
    const { getRoot } = moduleDeclaration;
    super(moduleDeclaration);
    this.getRoot = getRoot;
  }

  handleInit(matchingApps: IEntcoreApp[], allEntcoreApps: IEntcoreApp[]) {
    super.handleInit(matchingApps, allEntcoreApps);
    this.#root = this.getRoot(matchingApps, allEntcoreApps);
    this.#route = this.createModuleRoute(matchingApps, allEntcoreApps);
  }

  get isReady() {
    return super.isReady && !!this.#root && !!this.#route;
  }

  get root() {
    if (!this.#root) throw new Error(`Try to get root of non-initialized module '${this.config.name}'`);
    return this.#root;
  }
  get route() {
    if (!this.#route) throw new Error(`Try to get route of non-initialized module '${this.config.name}'`);
    return this.#route;
  }

  createModuleRoute(matchingApps: IEntcoreApp[], allEntcoreApps: IEntcoreApp[]) {
    return {
      screen: this.root,
      navigationOptions: createMainTabNavOption(
        I18n.t(this.config.displayI18n),
        this.config.displayPicture,
        this.config.displayPictureFocus,
      ),
    };
  }

  get() {
    return super.get() as Required<NavigableModule<Name, ConfigType, State, Root>>;
  }
}

export type UnknownNavigableModule = NavigableModule<
  string,
  INavigableModuleConfig<string, unknown>,
  unknown,
  NavigationComponent<any, any>
>;
export type AnyNavigableModule = NavigableModule<string, INavigableModuleConfig<string, any>, any, NavigationComponent<any, any>>;

export type RouteMap = NavigationRouteConfigMap<
  StackNavigationOptions,
  StackNavigationProp<NavigationRoute<NavigationParams>, NavigationParams>,
  unknown
>;

//  888b     d888               888          888                 d8888
//  8888b   d8888               888          888                d88888
//  88888b.d88888               888          888               d88P888
//  888Y88888P888  .d88b.   .d88888 888  888 888  .d88b.      d88P 888 888d888 888d888  8888b.  888  888
//  888 Y888P 888 d88""88b d88" 888 888  888 888 d8P  Y8b    d88P  888 888P"   888P"       "88b 888  888
//  888  Y8P  888 888  888 888  888 888  888 888 88888888   d88P   888 888     888     .d888888 888  888
//  888   "   888 Y88..88P Y88b 888 Y88b 888 888 Y8b.      d8888888888 888     888     888  888 Y88b 888
//  888       888  "Y88P"   "Y88888  "Y88888 888  "Y8888  d88P     888 888     888     "Y888888  "Y88888
//                                                                                                   888
//                                                                                              Y8b d88P
//                                                                                               "Y88P"

// Modules included in the app as it appears in IncludedModules.tsx
// They may have a config override with the array-style syntax
export type ModuleInclusion<ModuleType extends UnknownModule> = [ModuleType, IUnkownModuleConfig?] | ModuleType;

/**
 * An set of loaded modules.
 * This class extends built-in Array object.
 */
export class ModuleArray<ModuleType extends UnknownModule = UnknownModule> extends Array<ModuleType> {
  constructor(...items: Array<ModuleType>) {
    super(...items);
    Object.setPrototypeOf(this, ModuleArray.prototype); // See https://github.com/Microsoft/TypeScript-wiki/blob/main/Breaking-Changes.md#extending-built-ins-like-error-array-and-map-may-no-longer-work
  }
  filterAvailables(availableApps: IEntcoreApp[]) {
    return new ModuleArray<ModuleType>(
      ...this.filter(m => !!availableApps.find(app => m.config.matchEntcoreApp(app, availableApps))),
    );
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
  initModules(allEntcoreApps: IEntcoreApp[]) {
    this.forEach(m => {
      const matchingApps = allEntcoreApps.filter(app => m.config.matchEntcoreApp(app, allEntcoreApps));
      m.init(matchingApps, allEntcoreApps);
    });
    return this;
  }
  initModuleConfigs(allEntcoreApps: IEntcoreApp[]) {
    this.forEach(m => {
      const matchingApps = allEntcoreApps.filter(app => m.config.matchEntcoreApp(app, allEntcoreApps));
      m.config.init(matchingApps, allEntcoreApps);
    });
    return this;
  }
}

export class NavigableModuleArray<
  ModuleType extends UnknownNavigableModule = UnknownNavigableModule,
> extends ModuleArray<ModuleType> {
  constructor(...items: Array<ModuleType>) {
    super(...items);
    Object.setPrototypeOf(this, NavigableModuleArray.prototype); // See https://github.com/Microsoft/TypeScript-wiki/blob/main/Breaking-Changes.md#extending-built-ins-like-error-array-and-map-may-no-longer-work
  }
  filterAvailables(availableApps: IEntcoreApp[]) {
    return new NavigableModuleArray<ModuleType>(
      ...this.filter(m => !!availableApps.find(app => m.config.matchEntcoreApp(app, availableApps))),
    );
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

//  888b     d888               888          888          8888888b.                    d8b          888
//  8888b   d8888               888          888          888   Y88b                   Y8P          888
//  88888b.d88888               888          888          888    888                                888
//  888Y88888P888  .d88b.   .d88888 888  888 888  .d88b.  888   d88P  .d88b.   .d88b.  888 .d8888b  888888  .d88b.  888d888 .d8888b
//  888 Y888P 888 d88""88b d88" 888 888  888 888 d8P  Y8b 8888888P"  d8P  Y8b d88P"88b 888 88K      888    d8P  Y8b 888P"   88K
//  888  Y8P  888 888  888 888  888 888  888 888 88888888 888 T88b   88888888 888  888 888 "Y8888b. 888    88888888 888     "Y8888b.
//  888   "   888 Y88..88P Y88b 888 Y88b 888 888 Y8b.     888  T88b  Y8b.     Y88b 888 888      X88 Y88b.  Y8b.     888          X88
//  888       888  "Y88P"   "Y88888  "Y88888 888  "Y8888  888   T88b  "Y8888   "Y88888 888  88888P'  "Y888  "Y8888  888      88888P'
//                                                                                 888
//                                                                            Y8b d88P
//                                                                             "Y88P"

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
export const dynamiclyRegisterModules = <ModuleType extends AnyNavigableModule = AnyNavigableModule>(
  modules: ModuleArray<ModuleType>,
) => {
  modules.forEach(module => {
    if (module.config.displayAs) {
      const register = getGlobalRegister(module.config.displayAs);
      register && register.register(module, module.config.displayOrder);
    }
  });
  return modules; // Allow chaining
};

// Tab modules register ===========================================================================

// ToDo : move this into the future Navigation Manager ?

export const tabModules = new ModuleRegister<AnyNavigableModule>();
setGlobalRegister('tabModule', tabModules);