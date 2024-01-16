/**
 * ModuleScreens is a collection used to register screens that are rendered in the main StackNavigator.
 */
import type { ParamListBase } from '@react-navigation/native';
import * as React from 'react';

import { TypedNativeStackNavigator, getTypedRootStack } from './navigators';

export class ModuleScreens {
  static $items: { [key: string]: React.ReactNode } = {};

  static register(name: string, item: React.ReactNode) {
    this.$items[name] = item;
    return item; // Allow chaining
  }

  static get(name: string) {
    if (Object.prototype.hasOwnProperty.call(this.$items, name)) {
      return this.$items[name];
    } else {
      throw new Error(`[ModuleScreens] No reducer of name ${name} has been registred.`);
    }
  }

  static get all() {
    return Object.values(this.$items) as React.ReactNode[];
  }

  static clear() {
    this.$items = {};
  }
}

/**
 * Register rendered screens into the stack screens. They will be included in each tab.
 *
 * @param moduleName got from moduleConfig, it's the name of the homescreen of the module.
 * @param renderScreens Function that takes the navigator utility as a parameter and reders every screen or group
 * @returns
 */

export function createModuleNavigator<ParamList extends ParamListBase>(
  moduleName: string,
  renderScreens: (Stack: TypedNativeStackNavigator<ParamList>) => React.ReactNode,
) {
  const TypedRootStack = getTypedRootStack<ParamList>();
  if (renderScreens) {
    const screens = <TypedRootStack.Group key={moduleName}>{renderScreens(TypedRootStack)}</TypedRootStack.Group>;
    ModuleScreens.register(moduleName, screens);
    return screens;
  }
  return <></>;
}
