import { fetchHomeworkDiaryList } from './actions/diaryList';
import homeworkDiarySelected from './actions/selectedDiary';

import { Trackers } from '~/framework/util/tracker';
import { NotificationHandlerFactory } from '~/infra/pushNotification';
import { mainNavNavigate } from '~/navigation/helpers/navHelper';

//TODO add types args
const homeworksNotificationHandlerFactory: NotificationHandlerFactory<any, any, any> =
  dispatch => async (notificationData, apps, trackCategory) => {
    if (!notificationData?.resourceUri?.startsWith('/homeworks')) {
      return false;
    }
    // console.log("notifData", notificationData);

    await dispatch(fetchHomeworkDiaryList());

    const split = notificationData.resourceUri.split('/');
    const diaryId = split[split.length - 1];

    // console.log("diaryId", diaryId);

    dispatch(homeworkDiarySelected(diaryId));

    // console.log("go to homework");
    mainNavNavigate('Homework');

    trackCategory && Trackers.trackEvent(trackCategory, 'Homework', '/homeworks');

    return true;
  };
export default homeworksNotificationHandlerFactory;
