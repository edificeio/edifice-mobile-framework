import { StackActions } from '@react-navigation/native';

import timelineModuleConfig from '~/framework/modules/timelinev2/moduleConfig';
import { navigate, navigationRef } from '~/framework/navigation/helper';
import { computeTabRouteName } from '~/framework/navigation/tabModules';
import { getAsResourceIdNotification } from '~/framework/util/notifications';
import { NotifHandlerThunkAction, registerNotifHandlers } from '~/framework/util/notifications/routing';

import homeworkDiarySelected from './actions/selectedDiary';
import { homeworkRouteNames } from './navigation';

const homeworkNotificationAction: NotifHandlerThunkAction = notification => async (dispatch, getState) => {
  const notif = getAsResourceIdNotification(notification);
  if (!notif) return { managed: 0 };

  const diaryId = notif.resource.id;
  dispatch(homeworkDiarySelected(diaryId));

  navigationRef.dispatch(StackActions.popToTop());
  navigate(computeTabRouteName(timelineModuleConfig.routeName), {
    initial: false,
    screen: homeworkRouteNames.homeworkTaskList,
    params: {},
  });

  return {
    managed: 1,
    trackInfo: { action: 'Homework', name: `${notification.type}.${notification['event-type']}` },
  };
};

export default () =>
  registerNotifHandlers([
    {
      type: 'HOMEWORKS',
      'event-type': ['SHARE', 'ENTRIES.MODIFIED'],
      notifHandlerAction: homeworkNotificationAction,
    },
  ]);
