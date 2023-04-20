import { CommonActions } from '@react-navigation/native';

import timelineModuleConfig from '~/framework/modules/timelinev2/moduleConfig';
import { computeTabRouteName } from '~/framework/navigation/tabModules';
import { getAsResourceIdNotification } from '~/framework/util/notifications';
import {
  NotifHandlerThunkAction,
  handleNotificationNavigationAction,
  registerNotifHandlers,
} from '~/framework/util/notifications/routing';

import homeworkDiarySelected from './actions/selectedDiary';
import { homeworkRouteNames } from './navigation';

const homeworkNotificationAction: NotifHandlerThunkAction =
  (notification, trackCategory, navigation) => async (dispatch, getState) => {
    try {
      const notif = getAsResourceIdNotification(notification);
      if (!notif) return { managed: 0 };

      // side-effect needed :/
      const diaryId = notif.resource.id;
      dispatch(homeworkDiarySelected(diaryId));

      const navAction = CommonActions.navigate({
        name: computeTabRouteName(timelineModuleConfig.routeName),
        params: {
          initial: false,
          screen: homeworkRouteNames.homeworkTaskList,
          params: {},
        },
      });

      handleNotificationNavigationAction(navAction);

      return {
        managed: 1,
        trackInfo: { action: 'Homework', name: `${notification.type}.${notification['event-type']}` },
      };
    } catch {
      return { managed: 0 };
    }
  };

export default () =>
  registerNotifHandlers([
    {
      type: 'HOMEWORKS',
      'event-type': ['SHARE', 'ENTRIES.MODIFIED'],
      notifHandlerAction: homeworkNotificationAction,
    },
  ]);
