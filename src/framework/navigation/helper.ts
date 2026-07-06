/**
 * Navigation tools available everywhere.
 * Connected to the navigationRef, you can call these exported methods from everywhere you want.
 * In components, it is recommended to use navigation & route props & hooks instead of these helper functions.
 */
import {
  createNavigationContainerRef,
  NavigationAction,
  NavigationHelpers,
  NavigationProp,
  ParamListBase,
  Route,
} from '@react-navigation/native';

import { consumeConfirmQuitAction, consumeModalCloseAction, NAVIGATE_CLOSE_DELAY } from './nextTabJump';

export interface INavigationParams extends ParamListBase {}
export const navigationRef = createNavigationContainerRef<INavigationParams>();

export type RouteStack = Omit<Route<string>, 'key'>[];

/**
 * @deprecated
 * DO NOT use this. use the screen navigation prop.
 */
export const navigate = navigationRef.navigate;

export const handleRemoveConfirmNavigationEvent = (action: NavigationAction, navigation: NavigationProp<ParamListBase>) => {
  const [nextJumps, delayed] = consumeConfirmQuitAction();
  nextJumps.unshift(action);
  if (delayed) {
    const consumeOne = () => {
      setTimeout(() => {
        const next = nextJumps.shift();
        if (!next) return;
        navigation.dispatch(next);
        consumeOne();
      }, NAVIGATE_CLOSE_DELAY);
    };
    consumeOne();
  } else {
    nextJumps.forEach(next => {
      navigation.dispatch(next);
    });
  }
};

export const handleCloseModalActions = (navigation: NavigationHelpers<ParamListBase>) => {
  const [nextJumps, delayed] = consumeModalCloseAction();
  if (delayed) {
    const consumeOne = () => {
      setTimeout(() => {
        const next = nextJumps.shift();
        if (!next) return;
        navigation.dispatch(next);
        consumeOne();
      }, NAVIGATE_CLOSE_DELAY);
    };
    consumeOne();
  } else {
    nextJumps.forEach(next => {
      navigation.dispatch(next);
    });
  }
};

export const clearConfirmNavigationEvent = () => {
  consumeConfirmQuitAction();
};
