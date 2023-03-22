/**
 * User notif handler
 *
 * The notifHandler registers some behaviours for given notif types and event-types.
 * It applicates to both timelineNotififation and pushNotifications.
 */
import { NotifHandlerThunkAction, registerNotifHandlers } from '~/framework/util/notifications/routing';

// const handleSomeNotificationAction: NotifHandlerThunkAction = notification => async (dispatch, getState) => {
//   return {
//     managed: 0,
//   };
// };

export default () => registerNotifHandlers([]);
