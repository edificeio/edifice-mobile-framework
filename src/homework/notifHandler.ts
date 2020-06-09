import { mainNavNavigate } from "../navigation/helpers/navHelper";
import { fetchHomeworkDiaryList } from "./actions/diaryList";
import homeworkDiarySelected from "./actions/selectedDiary";
import { NotificationHandlerFactory } from "../infra/pushNotification";
import { Trackers } from "../infra/tracker";

//TODO add types args
const homeworksNotificationHandlerFactory:NotificationHandlerFactory<any,any,any> = dispatch => async (notificationData, apps, doTrack) => {
  if (!notificationData.resourceUri.startsWith("/homeworks")) {
    return false;
  }
  // console.log("notifData", notificationData);

  await dispatch(fetchHomeworkDiaryList());

  const split = notificationData.resourceUri.split("/");
  const diaryId = split[split.length - 1];

  // console.log("diaryId", diaryId);

  dispatch(homeworkDiarySelected(diaryId));

  // console.log("go to homework");
  mainNavNavigate("Homework");

  /*
  const split = notificationData.resourceUri.split("/");
  const messageId = split[split.length - 1];
  if (!Conf.currentPlatform) throw new Error("must specify a platform");
  const response = await signedFetch(
    `${Conf.currentPlatform.url}/conversation/message/${messageId}`,
    {}
  );
  const message = await response.json();
  try {
    try {
      await dispatch(await resetConversationThreadList());
    } catch (e) {
      if (!(e.type && e.type === "ALREADY_FETCHED")) {
        throw e;
      } else {
        // console.log("threads page already fetched, pass");
      }
    }
    await dispatch(await conversationThreadSelected(message.thread_id));
    await dispatch(
      await fetchConversationThreadResetMessages(message.thread_id)
    );
    mainNavNavigate("thread");
  } catch (e) {
    console.warn(e);
    mainNavNavigate("listThreads");
  }
  */

  doTrack && Trackers.trackEvent(doTrack, "Homework", "/homeworks");

 return true;
};
export default homeworksNotificationHandlerFactory;
