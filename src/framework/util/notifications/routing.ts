/**
 * Notification routing
 * Router operations on opeening a notification
 */
import { NavigationAction, NavigationProp, ParamListBase, StackActions } from '@react-navigation/native';
import { Action, AnyAction } from 'redux';
import { ThunkAction, ThunkDispatch } from 'redux-thunk';

import timelineModuleConfig from '~/framework/modules/timeline/module-config';
import { timelineRouteNames } from '~/framework/modules/timeline/navigation';
import { navigate, navigationRef } from '~/framework/navigation/helper';
import { isModalModeOnThisRoute } from '~/framework/navigation/hideTabBarAndroid';
import { setConfirmQuitAction, setModalCloseAction } from '~/framework/navigation/nextTabJump';
import { computeTabRouteName } from '~/framework/navigation/tabModules';
import { openUrl } from '~/framework/util/linking';
import { Trackers } from '~/framework/util/tracker';

import { IAbstractNotification, getAsResourceUriNotification } from '.';

// Module Map

export interface INotifHandlerTrackInfo {
  action: string;
  value?: number;
}
export interface INotifHandlerReturnType {
  managed: number;
  trackInfo?: INotifHandlerTrackInfo;
}

export type NotifHandlerThunk = ThunkAction<Promise<INotifHandlerReturnType>, any, void, AnyAction>;
export type NotifHandlerThunkAction<NotifType extends IAbstractNotification = IAbstractNotification> = (
  notification: NotifType,
  trackCategory: false | string,
  navigation: NavigationProp<ParamListBase>,
  allowSwitchTab?: boolean,
) => NotifHandlerThunk;

export interface INotifHandlerDefinition<NotifType extends IAbstractNotification = IAbstractNotification> {
  type: string;
  'event-type'?: string | string[];
  notifHandlerAction: NotifHandlerThunkAction<NotifType>;
}

export type IAnyNotification = IAbstractNotification & any;

const registeredNotifHandlers: INotifHandlerDefinition[] = [];
export const registerNotifHandler = (def: INotifHandlerDefinition<IAnyNotification>) => {
  registeredNotifHandlers.push(def);
  return def;
};
export const registerNotifHandlers = (def: INotifHandlerDefinition<IAnyNotification>[]) => {
  return def.map(d => registerNotifHandler(d));
};
export const getRegisteredNotifHandlers = () => registeredNotifHandlers;

// Notif Handler Action

const defaultNotificationActions: { [k: string]: NotifHandlerThunkAction } = {
  // Check for all module notif-handler that are registered.
  moduleRedirection: (n, trackCategory, navigation, allowSwitchTab) => async (dispatch, getState) => {
    const rets = await Promise.all(
      registeredNotifHandlers.map(async def => {
        if (n.type !== def.type) return false;
        const eventTypeArray = typeof def['event-type'] === 'string' ? [def['event-type']] : def['event-type'];
        if (eventTypeArray !== undefined && !eventTypeArray.includes(n['event-type'])) return false;
        const thunkAction = def.notifHandlerAction(n, trackCategory, navigation, allowSwitchTab);
        const ret = await (dispatch(thunkAction) as unknown as Promise<INotifHandlerReturnType>); // TS BUG ThunkDispatch is treated like a regular Dispatch
        if (trackCategory && ret.trackInfo)
          Trackers.trackEvent(trackCategory, ret.trackInfo.action, `${n.type}.${n['event-type']}`, ret.trackInfo.value);
        return ret;
      }),
    );
    return {
      managed: rets.reduce((total, ret) => total + (ret ? ret.managed : 0), 0),
    };
  },

  // Redirect the user to the timeline + go to native browser
  webRedirection: (n, trackCategory) => async (dispatch, getState) => {
    const notifWithUri = getAsResourceUriNotification(n);
    if (!notifWithUri) {
      return { managed: 0 };
    }
    if (trackCategory) Trackers.trackEvent(trackCategory, 'Browser', `${n.type}.${n['event-type']}`);
    // We want to navigate on timeline even if this is a web redirection.
    navigate(computeTabRouteName(timelineModuleConfig.routeName), {
      initial: true,
      screen: timelineRouteNames.Home,
      params: {
        notification: n,
      },
    });
    openUrl(notifWithUri.resource.uri);
    return { managed: 1 };
  },

  // Only redirect to the timeline
  timelineRedirection: (n, trackCategory) => async (dispatch, getState) => {
    if (trackCategory) Trackers.trackEvent(trackCategory, 'Timeline', `${n.type}.${n['event-type']}`);
    navigate(computeTabRouteName(timelineModuleConfig.routeName), {
      initial: true,
      screen: timelineRouteNames.Home,
      params: {
        notification: n,
      },
    });
    return { managed: 1 };
  },
};

export const defaultNotificationActionStack = [
  defaultNotificationActions.moduleRedirection,
  defaultNotificationActions.webRedirection,
  defaultNotificationActions.timelineRedirection,
];

export const handleNotificationAction =
  (
    notification: IAbstractNotification,
    actionStack: NotifHandlerThunkAction[],
    navigation: NavigationProp<ParamListBase>,
    trackCategory: false | string = false,
    allowSwitchTab?: boolean,
  ) =>
  async (dispatch: ThunkDispatch<any, any, any>, getState: () => any) => {
    let manageCount = 0;
    for (const action of actionStack) {
      if (manageCount) return;
      const ret = (await dispatch(
        action(notification, trackCategory, navigation, allowSwitchTab),
      )) as unknown as INotifHandlerReturnType;
      manageCount += ret.managed;
      if (ret.trackInfo && trackCategory)
        Trackers.trackEvent(trackCategory, ret.trackInfo.action, 'Post-routing', ret.trackInfo.value);
    }
  };

export interface NotificationData {
  resourceUri: string;
}
export interface NotificationHandler {
  (notificationData: NotificationData, apps: string[], trackCategory: string | false): Promise<boolean>;
}
export interface NotificationHandlerFactory<S, E, A extends Action> {
  (dispatch: ThunkDispatch<S, E, A>, getState: () => S): NotificationHandler;
}

let notificationThrotlingEvent = false;
const NOTIFICATION_THROTLE_DELAY = 250;

/**
 * Handles every action that must be dispatched, then dispatch the given navigation action.
 * Manage dispatch schedule if necessary.
 * @param navAction the navigation action to dispatch in fine
 */
export const handleNotificationNavigationAction = (navAction: NavigationAction) => {
  // 1. Pop to top current stack. This allow to close open modals & trigger preventRemove handlers.
  if (notificationThrotlingEvent) return;
  notificationThrotlingEvent = true;
  let preventMove = false;
  const navState = navigationRef.getRootState();
  let leafState: Pick<typeof navState, 'index' | 'routes'> = navState;
  while (leafState.routes[leafState.index].state !== undefined) {
    leafState = leafState.routes[leafState.index].state as Pick<typeof navState, 'index' | 'routes'>;
  }
  // We try popToTop only if the user is not at the root of its stack.
  if (leafState.index !== undefined && leafState.index !== 0) {
    navigationRef.dispatch(StackActions.popToTop());
    const newState = navigationRef.getRootState();
    preventMove = JSON.stringify(navState) === JSON.stringify(newState); // It's ugly but the two states are not the same object even when the content is the same. :/
  }

  // 2. Call / schedule given nav action. If there was preventRemove, we must include popToTop again in the scheduled actions to close the modal.
  if (preventMove) {
    // We set the `delayed` argument to true to ensure native modals are closed before triggering any other action.
    // This seems to be an issue of React Navigation 6 at this time. In the future, we can test with `false` to not use setTimeout to delay each nav action.
    setConfirmQuitAction([StackActions.popToTop(), navAction], true);
    notificationThrotlingEvent = false;
  } else {
    // If current route is modal, we'll need to wait until it closes.
    if (isModalModeOnThisRoute(leafState.routes[leafState.index].name)) {
      setModalCloseAction([navAction], true);
      notificationThrotlingEvent = false;
    } else {
      // We use setTimeout here to ensure native modals are closed before triggering any other action.
      // This seems to be an issue of React Navigation 6 at this time. In the future, we can test by calling directly dispatch function.
      setTimeout(() => {
        navigationRef.dispatch(navAction);
        setTimeout(() => {
          notificationThrotlingEvent = false;
        }, NOTIFICATION_THROTLE_DELAY);
      });
    }
  }
};
