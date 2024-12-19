import { CommonActions } from '@react-navigation/native';

import homeworkDiarySelected from './actions/selectedDiary';
import { homeworkRouteNames } from './navigation';

import timelineModuleConfig from '~/framework/modules/timeline/module-config';
import { computeTabRouteName } from '~/framework/navigation/tabModules';
import { getAsResourceUriNotification } from '~/framework/util/notifications';
import {
  handleNotificationNavigationAction,
  NotifHandlerThunkAction,
  registerNotifHandlers,
} from '~/framework/util/notifications/routing';

const homeworkNotificationAction: NotifHandlerThunkAction =
  (notification, trackCategory, navigation) => async (dispatch, getState) => {
    try {
      const notif = getAsResourceUriNotification(notification);
      if (!notif) return { managed: 0 };

      // We must extract resource id ourselves beacause backend don't return it :/
      const diaryUri = notif.resource.uri;
      const diaryId = diaryUri.split('/').pop();
      if (!diaryId) return { managed: 0 };

      // side-effect needed :/
      dispatch(homeworkDiarySelected(diaryId));

      const navAction = CommonActions.navigate({
        name: computeTabRouteName(timelineModuleConfig.routeName),
        params: {
          initial: false,
          params: {},
          screen: homeworkRouteNames.homeworkTaskList,
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
      'event-type': ['SHARE', 'ENTRIES.MODIFIED'],
      notifHandlerAction: homeworkNotificationAction,
      type: 'HOMEWORKS',
    },
  ]);
