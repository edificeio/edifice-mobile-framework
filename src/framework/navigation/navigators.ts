/**
 * navigators
 * These navigators are in their proper modules to make them callable everywhere as singleton objects.
 * Since their Params types is dynamic, you'll need to type them when importing.
 */
import { ParamListBase, StackNavigationState } from '@react-navigation/native';
import {
  createNativeStackNavigator,
  NativeStackNavigationEventMap,
  NativeStackNavigationOptions,
} from '@react-navigation/native-stack';
import { NativeStackNavigatorProps } from '@react-navigation/native-stack/lib/typescript/src/types';

const RootStack = createNativeStackNavigator<ParamListBase>();
export type TypedNativeStackNavigator<ParamList extends ParamListBase> = import('@react-navigation/native').TypedNavigator<
  ParamList,
  StackNavigationState<ParamListBase>,
  NativeStackNavigationOptions,
  NativeStackNavigationEventMap,
  ({ children, id, initialRouteName, screenListeners, screenOptions, ...rest }: NativeStackNavigatorProps) => JSX.Element
>;
export function getTypedRootStack<T extends ParamListBase>() {
  return RootStack as TypedNativeStackNavigator<T>;
}

// export const RootStack = getTypedRootStack();
