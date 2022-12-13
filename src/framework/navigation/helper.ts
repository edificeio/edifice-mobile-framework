/**
 * Navigation tools available everywhere.
 * Connected to the navigationRef, you can call these exported methods from everywhere you want.
 * In components, it is recommended to use navigation & route props & hooks instead of these helper functions.
 */
import { CommonActions, ParamListBase, Route, createNavigationContainerRef } from '@react-navigation/native';

export interface INavigationParams extends ParamListBase {}
export const navigationRef = createNavigationContainerRef<INavigationParams>();

export type RouteStack = Omit<Route<string>, 'key'>[];

export const resetNavigation = (routes: RouteStack, index?: number) => {
  return navigationRef.dispatch(
    CommonActions.reset({
      index: index ?? 0,
      routes,
    }),
  );
};

export function navigate<ParamList extends ParamListBase, RouteName extends keyof ParamList>(
  ...args: RouteName extends unknown
    ? undefined extends ParamList[RouteName]
      ? [screen: RouteName] | [screen: RouteName, params: ParamList[RouteName]]
      : [screen: RouteName, params: ParamList[RouteName]]
    : never
) {
  return navigationRef.navigate(...(args as [any, any])); // Just type enforcement... I give up !
}
