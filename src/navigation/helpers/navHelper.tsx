import { NavigationAction, NavigationActions, NavigationNavigateAction, StackActions } from 'react-navigation';

import { rootNavigatorRef } from '~/AppScreen';
import NavigationService from '~/navigation/NavigationService';

/**
 * Use the Root Navigator to go on another page.
 * CAUTION : Do NOT use this if you want navigate inside a module, instead, use the navigation prop.
 * @param route route to go
 * @param params additional parameters to pass to navigation state
 */
export const navigate = (route, params = {}) => {
  return rootNavigatorRef.dispatch(NavigationActions.navigate({ routeName: route, params }));
};
export const resetNavigation = (actions: NavigationNavigateAction[], index?: number) => {
  return rootNavigatorRef.dispatch(
    StackActions.reset({
      index: index ?? 0,
      actions,
    }),
  );
};

export const getRootNavState = () => {
  return rootNavigatorRef.state;
};

/**
 * Use the Root Navigator to go on another page.
 * CAUTION : Do NOT use this if you want navigate inside a module, instead, use the navigation prop.
 * @param route route to go
 * @param params additional parameters to pass to navigation state
 */
export const reset = (stack: NavigationNavigateAction[]) => {
  return rootNavigatorRef.dispatch(StackActions.reset({ index: stack.length - 1, actions: stack }));
};

/**
 * Use the Root Navigator to go on another page.
 * CAUTION : Do NOT use this if you want navigate inside a module, instead, use the navigation prop.
 * @param route route to go
 * @param params additional parameters to pass to navigation state
 */
export const mainNavNavigate = (route, params = {}) => {
  return NavigationService.navigate(route, params);
};
