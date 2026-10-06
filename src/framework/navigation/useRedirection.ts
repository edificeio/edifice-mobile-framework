import * as React from 'react';

import { NavigationAction, NavigationProp, ParamListBase } from '@react-navigation/native';

import { navigationRef } from '~/app/navigation';
import { useNavigationRedirectionDispatch } from '~/app/navigation/use-confirm-remove';
import { NAVIGATE_CLOSE_DELAY } from '~/framework/navigation/nextTabJump';
import { handleNotificationNavigationAction } from '~/framework/util/notifications/routing';

// A tab change while a native modal is open leaves the tab bar deaf, see the note in main-navigation.
// So the modal closes first, then the remaining actions build the stack we land in, one at a time.
export function useRedirection(navigation: NavigationProp<ParamListBase>) {
  const rootNavigation = navigationRef as unknown as NavigationProp<ParamListBase>;
  const redirectionDispatch = useNavigationRedirectionDispatch(rootNavigation);

  return React.useCallback(
    (actions: NavigationAction | NavigationAction[]) => {
      const [first, ...rest] = [actions].flat();
      handleNotificationNavigationAction(first, navigation, redirectionDispatch);
      rest.forEach((action, index) => setTimeout(() => rootNavigation.dispatch(action), NAVIGATE_CLOSE_DELAY * (index + 1)));
    },
    [navigation, redirectionDispatch, rootNavigation],
  );
}
