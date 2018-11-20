import I18n from "i18n-js";;
import { createMainTabNavOption } from "../navigation/helpers/mainTabNavigator";

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
  actionPrefix?: string;
  reducerName?: string;
  displayName?: string;
  iconName?: string;
}

export default class FunctionalModuleConfig implements IFunctionalConfig {
  public name: string;
  public actionPrefix: string;
  public reducerName: string;
  public displayName: string;
  public iconName: string;

  public constructor(opts: IFunctionalConfig) {
    this.name = opts.name;
    this.actionPrefix =
      opts.actionPrefix || toSnakeCase(this.name).toUpperCase() + "_";
    this.reducerName = opts.reducerName || this.name;
    this.displayName = opts.displayName || this.name;
    this.iconName = opts.iconName || this.name;
  }

  public getLocalState(globalState) {
    return globalState[this.reducerName];
  }

  public createActionType(type: string) {
    return this.actionPrefix + type;
  }

  public createRoute(comp: any) {
    return {
      screen: comp,

      navigationOptions: () =>
        createMainTabNavOption(I18n.t(this.displayName), this.iconName)
    };
  }
}

export interface IFunctionalModuleDefinition {
  config: FunctionalModuleConfig;
  module: any;
}

export function getReducersFromModuleDefinitions(
  defs: IFunctionalModuleDefinition[]
) {
  return defs.reduce(
    (acc, mod) => ({ ...acc, [mod.config.reducerName]: mod.module.reducer }),
    {}
  );
}

export function getRoutesFromModuleDefinitions(
  defs: IFunctionalModuleDefinition[]
) {
  return defs.reduce(
    (acc, mod) => ({ ...acc, [mod.config.name]: mod.module.route }),
    {}
  );
}
