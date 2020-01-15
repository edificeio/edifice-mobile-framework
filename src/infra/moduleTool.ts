import I18n from "i18n-js";
import { createMainTabNavOption } from "../navigation/helpers/mainTabNavigator";
import { NotificationHandlerFactory } from "./pushNotification";
import { Reducer } from "redux";
import { NavigationScreenConfig, NavigationScreenOptions, NavigationComponent } from "react-navigation";
import { CommonStyles } from "../styles/common/styles";

/**
 * All specs to define functional module
 */

export function toSnakeCase(camelCase: string) {
  const upperChars = camelCase.match(/([A-Z])/g);
  if (!upperChars) {
    return camelCase;
  }

  let str = camelCase;
  for (let i = 0, n = upperChars.length; i < n; i++) {
    str = str.replace(
      new RegExp(upperChars[i]),
      "_" + upperChars[i].toLowerCase()
    );
  }

  if (str.slice(0, 1) === "_") {
    str = str.slice(1);
  }

  return str;
}

export interface IFunctionalConfig {
  name: string;
  apiName: string; // name in list of avaible apps received from the backend
  actionPrefix?: string;
  reducerName?: string;
  displayName: string;
  iconName: string;
  iconColor?: string;
  group?: boolean;
  notifHandlerFactory?: () => Promise<NotificationHandlerFactory>;
  hasRight?: (apps: any[]) => boolean;
}

export interface IAppModule {
  config: IFunctionalConfig;
  module: {
    reducer: Reducer<any>;
    root: React.ComponentClass<any>;
    route: any;
    getRoute: Function;
  };
}
export type navOptionsBuilder = (arg: FunctionalModuleConfig) => NavigationScreenConfig<NavigationScreenOptions>;

export default class FunctionalModuleConfig implements IFunctionalConfig {
  public name: string;
  public apiName: string;
  public actionPrefix: string;
  public reducerName: string;
  public displayName: string;
  public iconName: string;
  public iconColor: string;
  public group: boolean;
  public notifHandlerFactory: () => Promise<NotificationHandlerFactory>;
  public hasRight: (apps: any[]) => boolean; 

  public constructor(opts: IFunctionalConfig) {
    this.name = opts.name;
    this.apiName = opts.apiName || this.name;
    this.actionPrefix =
      opts.actionPrefix || toSnakeCase(this.name).toUpperCase() + "_";
    this.reducerName = opts.reducerName || this.name;
    this.displayName = opts.displayName || this.name;
    this.iconName = opts.iconName || this.name;
    this.group = opts.group === undefined ? false : opts.group;
    this.iconColor = opts.iconColor || CommonStyles.actionColor;
    this.notifHandlerFactory = opts.notifHandlerFactory;
    this.hasRight = opts.hasRight || (apps => apps.some(app => app.name == this.apiName))
  }

  public getLocalState(globalState: any) {
    return globalState[this.reducerName];
  }

  public createActionType(type: string) {
    return this.actionPrefix + type;
  }

  public createRoute(comp: any) {
    return {
      screen: comp,

      navigationOptions: () =>
        this.group ? { header: null } : createMainTabNavOption(I18n.t(this.displayName), this.iconName),
    };
  }

  public createFunctionRoute(comp: any) {
    return (args?: any) =>
      this.createRoute(comp(args))
  }
}

export function getReducersFromModuleDefinitions(
  defs: IAppModule[]
) {
  return defs.reduce(
    (acc, mod) => ({ ...acc, [mod.config.reducerName]: mod.module.reducer }),
    {}
  );
}

export function getRoutesFromModuleDefinitions(defs: IAppModule[], args?: any) {
  const getModuleRoute = (mod: IAppModule) =>
    !mod.module.route && !!mod.module.getRoute ? mod.module.getRoute(args) : mod.module.route;

  return defs.reduce(
    (acc, mod) => ({ ...acc, [mod.config.name]: getModuleRoute(mod) }),
    {}
  );
}
