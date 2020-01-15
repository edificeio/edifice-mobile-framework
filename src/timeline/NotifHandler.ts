import { mainNavNavigate } from "../navigation/helpers/navHelper";
import Tracking from "../tracking/TrackingManager";
import { listTimeline } from "./actions/list";
import { storedFilters, } from "./actions/storedFilters";
import { loadSchoolbooks, resetLoadingState } from "./actions/dataTypes";
import { NotificationHandlerFactory } from "../infra/pushNotification";

const openNotif = {
  "/schoolbook": async (data, latestNews) => {
    // console.log("notif schoolbook", data, latestNews);
    if (!data.resourceUri || data.resourceUri.indexOf("word") === -1) {
      mainNavNavigate("notifications");
      return;
    }
    const wordId = data.resourceUri.split("word/")[1];
    // console.log("GOT WORD", wordId);
    return latestNews.find(
      n => n.resourceUri === data.resourceUri && n.application === "schoolbook"
    );
  },

  "/actualites": async (data, latestNews) => {
    if (data.resourceUri.indexOf("/info") === -1) {
      mainNavNavigate("notifications");
      return;
    }

    const split = data.resourceUri.split("/");
    const infoId = split[split.length - 1];
    return latestNews.find(
      n => n.resourceUri === data.resourceUri && n.application === "news"
    );
  },

  "/blog": async (data, latestNews) => {
    if (!data.postUri) {
      return;
    }

    const split = data.postUri.split("/");
    const postId = split[split.length - 1];
    return latestNews.find(
      n => n.resourceId === postId && n.application === "blog"
    );
  }
};
//TODO types args
const timelineNotifHandlerFactory:NotificationHandlerFactory = (notificationData, legalapps) => async dispatch => {
  for (const path in openNotif) {
    if (notificationData.resourceUri.startsWith(path)) {
      // console.log("before await schoolbooks");
      resetLoadingState();
      if (legalapps.includes("Schoolbook"))
        await loadSchoolbooks();
      dispatch({
        news: [],
        type: "FETCH_NEW_TIMELINE"
      });
      const availableApps = await storedFilters(legalapps);
      const latestNews = await listTimeline(dispatch)(
        0,
        availableApps,
        legalapps,
        true
      );
      // console.log("before await open timeline notif");
      const item = await openNotif[path](notificationData, latestNews);
      // console.log("got item :", item);
      if (item) {
        Tracking.logEvent("readNews", {
          application: item.application,
          articleName: item.title,
          authorName: item.senderName,
          published: item.date,
          articleId: item.id
        });
        mainNavNavigate("newsContent", { news: item, expend: true });
      } else {
        mainNavNavigate("notifications");
      }
      return true;
    }
  }
  return false;
};
export default timelineNotifHandlerFactory;
