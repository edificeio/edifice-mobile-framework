/**
 * All specs to define functional module
 */

import I18n from "react-native-i18n";
import { tabRootOptions } from "../utils/navHelper";

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

export default class FunctionalModule {
  public name: string;
  public actionPrefix: string;
  public reducerName: string;
  public mainComp: React.ComponentType;
  public displayName: string;
  public iconName: string;

  public get route() {
    return {
      [this.name]: {
        screen: this.mainComp,

        navigationOptions: () => tabRootOptions(this.displayName, this.iconName)
      }
    };
  }

  public constructor(name: string, mainComp: React.ComponentType) {
    this.name = name;
    this.actionPrefix = toSnakeCase(name).toUpperCase();
    this.reducerName = name;
    this.mainComp = mainComp;
    this.displayName = I18n.t(name);
    this.iconName = name;
  }

  public getLocalState(globalState) {
    return globalState[this.reducerName];
  }

  public createActionType(type: string) {
    return this.actionPrefix + "_" + type;
  }
}
