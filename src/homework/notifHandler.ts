import timelineConfig from '~/framework/modules/timelinev2/moduleConfig';
import { Trackers } from '~/framework/util/tracker';
import { NotificationHandlerFactory } from '~/infra/pushNotification';
import { mainNavNavigate } from '~/navigation/helpers/navHelper';

import homeworkDiarySelected from './actions/selectedDiary';
import moduleConfig from './config';

//TODO add types args
const homeworksNotificationHandlerFactory: NotificationHandlerFactory<any, any, any> =
  dispatch => async (notificationData, apps, trackCategory) => {
    if (!notificationData?.resourceUri?.startsWith('/homeworks')) {
      return false;
    }

    const split = notificationData.resourceUri.split('/');
    const diaryId = split[split.length - 1];

    dispatch(homeworkDiarySelected(diaryId));

    mainNavNavigate(`${timelineConfig.routeName}/${moduleConfig.name}/tasks`);

    trackCategory && Trackers.trackEvent(trackCategory, 'Homework', '/homeworks');

    return true;
  };
export default homeworksNotificationHandlerFactory;
