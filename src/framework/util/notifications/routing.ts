/**
 * Notification routing
 * Router operations on opeening a notification
 */
import { NavigationState } from '@react-navigation/native';
import { Action, AnyAction } from 'redux';
import { ThunkAction, ThunkDispatch } from 'redux-thunk';

import legacyModuleDefinitions from '~/AppModules';
import timelineModuleConfig from '~/framework/modules/timelinev2/moduleConfig';
import { timelineRouteNames } from '~/framework/modules/timelinev2/navigation';
import { navigate } from '~/framework/navigation/helper';
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
  navState?: NavigationState | string,
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
  moduleRedirection: (n, trackCategory, navState) => async (dispatch, getState) => {
    const rets = await Promise.all(
      registeredNotifHandlers.map(async def => {
        if (n.type !== def.type) return false;
        const eventTypeArray = typeof def['event-type'] === 'string' ? [def['event-type']] : def['event-type'];
        if (eventTypeArray !== undefined && !eventTypeArray.includes(n['event-type'])) return false;
        const thunkAction = def.notifHandlerAction(n, trackCategory, navState);
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
  webRedirection: (n, trackCategory, navState) => async (dispatch, getState) => {
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
  timelineRedirection: (n, trackCategory, navState) => async (dispatch, getState) => {
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
  defaultNotificationActions.legacyRedirection,
  defaultNotificationActions.webRedirection,
  defaultNotificationActions.timelineRedirection,
];

export const handleNotificationAction =
  (
    notification: IAbstractNotification,
    actionStack: NotifHandlerThunkAction[],
    trackCategory: false | string = false,
    navState?: NavigationState | string,
  ) =>
  async (dispatch: ThunkDispatch<any, any, any>, getState: () => any) => {
    let manageCount = 0;
    for (const action of actionStack) {
      if (manageCount) return;
      const ret = (await dispatch(action(notification, trackCategory, navState))) as unknown as INotifHandlerReturnType;
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

export const legacyHandleNotificationAction =
  (data: NotificationData, apps: string[], trackCategory: false | string = 'Push Notification') =>
  async (dispatch: ThunkDispatch<any, any, any>, getState: () => any) => {
    // function for calling handlerfactory
    let manageCount = 0;
    const call = async (notifHandlerFactory: NotificationHandlerFactory<any, any, any>) => {
      try {
        const managed = await notifHandlerFactory(dispatch, getState)(data, apps, trackCategory);
        if (managed) {
          manageCount++;
        }
      } catch {
        //TODO: Manage error
      }
    };
    // timeline is not a functional module
    // await call(legacyTimelineHandlerFactory); This is commented becasue timeline v2 developpement.
    // notify functionnal module
    for (const handler of legacyModuleDefinitions) {
      if (handler && handler.config && handler.config.notifHandlerFactory) {
        const func = await handler.config.notifHandlerFactory();
        await call(func);
      }
    }

    return manageCount;
  };

// END LEGACY ZONE
