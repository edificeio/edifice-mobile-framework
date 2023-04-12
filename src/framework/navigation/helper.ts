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

export const navigate = navigationRef.navigate;
export const reset = navigationRef.reset;

// === Initialize React Navigation Flipper Plugin ===
export const useNavigationDevPlugins = () => {
  // It is safe to use hooks as __DEV__ will not change over time.
  if (__DEV__) {
    const rnDevTools = require('@react-navigation/devtools');
    rnDevTools?.useFlipper(navigationRef);
    rnDevTools?.useReduxDevToolsExtension(navigationRef);
  }
};
