import * as React from 'react';

import { NavigationAction, NavigationProp, ParamListBase } from '@react-navigation/native';

import { navigationRef } from '~/app/navigation';
import { useNavigationRedirectionDispatch } from '~/app/navigation/use-confirm-remove';
import { NAVIGATE_CLOSE_DELAY } from '~/framework/navigation/nextTabJump';
import { handleNotificationNavigationAction } from '~/framework/util/notifications/routing';

const SCREEN_LAYOUT_DELAY = 48;

const actionDelay = (index: number) => NAVIGATE_CLOSE_DELAY + SCREEN_LAYOUT_DELAY * index;

// A tab change while a native modal is open leaves the tab bar deaf, see the note in main-navigation.
// close the modal first, then build the destination stack one action at a time,
// since the redirect already waits for the modal to close.
export function useRedirectActionOnSuccess(navigation: NavigationProp<ParamListBase>) {
  const rootNavigation = navigationRef as unknown as NavigationProp<ParamListBase>;
  const redirectionDispatch = useNavigationRedirectionDispatch(rootNavigation);

  return React.useCallback(
    (actions: NavigationAction | NavigationAction[]) => {
      const [first, ...rest] = [actions].flat();
      handleNotificationNavigationAction(first, navigation, redirectionDispatch);
      rest.forEach((action, index) => setTimeout(() => rootNavigation.dispatch(action), actionDelay(index + 1)));
    },
    [navigation, redirectionDispatch, rootNavigation],
  );
}
