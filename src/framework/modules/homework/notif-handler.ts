import { navigate } from '~/framework/navigation/helper';
import { getAsResourceIdNotification } from '~/framework/util/notifications';
import { NotifHandlerThunkAction, registerNotifHandlers } from '~/framework/util/notifications/routing';

import homeworkDiarySelected from './actions/selectedDiary';
import { HomeworkNavigationParams, homeworkRouteNames } from './navigation';

const homeworkNotificationAction: NotifHandlerThunkAction = notification => async (dispatch, getState) => {
  const notif = getAsResourceIdNotification(notification);
  if (!notif) return { managed: 0 };

  const diaryId = notif.resource.id;
  dispatch(homeworkDiarySelected(diaryId));

  navigate<HomeworkNavigationParams, typeof homeworkRouteNames.homeworkTaskList>(homeworkRouteNames.homeworkTaskList, {});

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
