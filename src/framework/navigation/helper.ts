import { CommonActions, Route } from '@react-navigation/native';

import { navigationRef } from './RootNavigator';

export type RouteStack = Omit<Route<string>, 'key'>[];

export const resetNavigation = (routes: RouteStack, index?: number) => {
  return navigationRef.dispatch(
    CommonActions.reset({
      index: index ?? 0,
      routes,
    }),
  );
};
