/**
 * Pronote notif handler
 * @scaffolder Remove this file if your module handles no notification.
 *
 * The notifHandler registers some behaviours for given notif types and event-types.
 * It applicates to both timelineNotififation and pushNotifications.
 */
import { navigate } from '~/framework/navigation/helper';
import { NotifHandlerThunkAction, registerNotifHandlers } from '~/framework/util/notifications/routing';

import { PronoteNavigationParams, pronoteRouteNames } from './navigation';

const handleSomeNotificationAction: NotifHandlerThunkAction = notification => async (dispatch, getState) => {
  return { managed: 0 };
};

export default () =>
  registerNotifHandlers([
    // {
    //   type: 'SOME-TYPE', // Replace this with the backend notification type
    //   'event-type': 'SOME-EVENT-TYPE', // Replace this with the backend notification event-type
    //   notifHandlerAction: handleSomeNotificationAction,
    // },
  ]);
