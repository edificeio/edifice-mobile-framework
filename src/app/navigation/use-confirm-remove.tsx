import React from 'react';
import { Alert } from 'react-native';

import { BottomTabNavigatorProps } from '@react-navigation/bottom-tabs';
import {
  NavigationAction,
  NavigationProp,
  NavigationState,
  ParamListBase,
  StackActions,
  TabActions,
  useNavigation,
  usePreventRemove,
} from '@react-navigation/native';

import { I18n } from '~/app/i18n';

export const ConfirmRemoveContext = React.createContext<React.RefObject<NavigationAction[]>>({ current: [] });

export function ConfirmRemoveProvider({ children }: React.PropsWithChildren) {
  const storedActionsRef = React.useRef<NavigationAction[]>([]);
  return <ConfirmRemoveContext value={storedActionsRef}>{children}</ConfirmRemoveContext>;
}

/**
 * Ask user a confirmation popup to remove the screen.
 * @param preventRemove boolean evaluated at each render to tell if the remove has to be prevented or not.
 * @param options texts for the alert and optional callbacks
 */
export function useConfirmRemove(
  preventRemove: Parameters<typeof usePreventRemove>[0],
  {
    onCancel,
    onConfirm,
    text,
    title,
  }: {
    title: string;
    text: string;
    onConfirm?: Parameters<typeof usePreventRemove>[1];
    onCancel?: Parameters<typeof usePreventRemove>[1];
  },
) {
  const navigation = useNavigation<NavigationProp<ParamListBase>>();
  const storedActionsRef = React.useContext(ConfirmRemoveContext);

  usePreventRemove(preventRemove, options => {
    storedActionsRef.current.push(options.data.action);
    Alert.alert(title, text, [
      {
        onPress: () => {
          onConfirm?.(options);
          console.info('STORED ACTIONS', storedActionsRef.current);
          storedActionsRef.current.forEach(navigation.dispatch);
          storedActionsRef.current.length = 0;
        },
        style: 'destructive',
        text: I18n.get('common-quit'),
      },
      {
        onPress: () => {
          onCancel?.(options);
          storedActionsRef.current.length = 0;
        },
        style: 'default',
        text: I18n.get('common-continue'),
      },
    ]);
  });
}

/**
 * Expose a navigation dispatch function that triggers any usePreventDefault in current screens, then dispatch the given action.
 */
export function useNavigationRedirectionDispatch<ParamList extends ParamListBase, State extends NavigationState = NavigationState>(
  navigation: NavigationProp<ParamList, keyof ParamList, string | undefined, State>,
): typeof navigation.dispatch {
  const storedActionsRef = React.useContext(ConfirmRemoveContext);
  return React.useCallback(
    (_action: NavigationAction) => {
      const previousNavState = navigation.getState(); // root nav state
      const action: NavigationAction = { ..._action, source: previousNavState.key };
      const previousActiveRootState = previousNavState.routes[previousNavState.index].state;
      const previousActiveTabState =
        previousActiveRootState && previousActiveRootState.index !== undefined
          ? previousActiveRootState.routes[previousActiveRootState.index].state
          : undefined;
      const previousRoute = previousNavState.routes[previousNavState.index];

      if (previousActiveTabState && previousActiveTabState.index && previousActiveTabState.index > 0) {
        // If not on the home screen of the tab stack, we try to popToTop to see if some usePreventRemove triggers
        navigation.dispatch({ ...StackActions.popToTop(), source: previousRoute.key, target: previousActiveTabState.key });
        const newNavState = navigation.getState();
        if (newNavState === previousNavState) /* same state -> usePreventRemove WAS triggered */ {
          storedActionsRef.current.push(action);
        } else /* different state -> usePreventRemove was NOT triggered */ {
          navigation.dispatch(action);
        }
      } else {
        navigation.dispatch(action);
      }
    },
    [navigation, storedActionsRef],
  );
}

/**
 * @todo factorise with useNavigationRedirectionDispatch
 */
export function useConfirmChangeTab() {
  const storedActionsRef = React.useContext(ConfirmRemoveContext);
  const tabListeners: NonNullable<BottomTabNavigatorProps['screenListeners']> = React.useCallback(
    ({ navigation, route: nextRoute }) => ({
      tabPress: ({ preventDefault }) => {
        const action = TabActions.jumpTo(nextRoute.name, nextRoute.params);
        // complex logic to handle usePreventRemove correctly when switching tabs
        const previousNavState = navigation.getState();
        const previousActiveTabState = previousNavState.routes[previousNavState.index].state;
        const previousRoute = previousNavState.routes[previousNavState.index];

        if (previousRoute.key !== nextRoute.key) /* if next tab is different than the current one */ {
          preventDefault(); // Action is canceled and be re-dispatched if usePreventRemove isn't triggered
          // Note: only tab-changing actions must be canceled to let scrollToTop be triggered when the active tab is pressed

          if (previousActiveTabState && previousActiveTabState.index && previousActiveTabState.index > 0) {
            // If not on the home screen of the tab stack, we try to popToTop to see if some usePreventRemove triggers
            navigation.dispatch({ ...StackActions.popToTop(), source: previousRoute.key, target: previousActiveTabState.key });
            const newNavState = navigation.getState();
            if (newNavState === previousNavState) /* same state -> usePreventRemove WAS triggered */ {
              storedActionsRef.current.push(action);
            } else /* different state -> usePreventRemove was NOT triggered */ {
              navigation.dispatch(action);
            }
          } else {
            navigation.dispatch(action);
          }
        }
      },
    }),
    [storedActionsRef],
  );
  return tabListeners;
}
