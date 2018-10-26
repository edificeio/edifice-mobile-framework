import { fetchJSONWithCache } from "../../infra/fetchWithCache";
import { preference, savePreference } from "../../infra/Me";
import userConfig from "../config";

export const actionTypeSetNotifPrefs = userConfig.createActionType(
  "NOTIFICATIONS_PREFS_SET"
);

export function loadNotificationPrefs() {
  return async (dispatch, getState) => {
    console.log("load timeline default notif prefs");
    const defaultNotifs = await fetchJSONWithCache(
      "/timeline/notifications-defaults"
    );
    console.log("load preference timeline prefs");
    const timelinePrefs = await preference("timeline");
    const newNotifs = defaultNotifs.map(notif => ({
      ...notif,
      defaultFrequency:
        timelinePrefs.config && timelinePrefs.config[notif.key]
          ? timelinePrefs.config[notif.key].defaultFrequency
          : notif.defaultFrequency,
      "push-notif":
        timelinePrefs.config &&
        timelinePrefs.config[notif.key] &&
        timelinePrefs.config[notif.key].defaultFrequency === "IMMEDIATE"
          ? timelinePrefs.config[notif.key]["push-notif"]
          : false
    }));

    dispatch({
      notificationPrefs: newNotifs,
      type: actionTypeSetNotifPrefs
    });
  };
}

export const excludeNotifTypes = [
  "blog.publish-comment",
  "blog.share",
  "blog.submit-post",
  "messagerie.storage",
  "news.news-comment",
  "news.news-published",
  "news.news-submitted",
  "news.news-update",
  "news.news-unpublished",
  "news.news-unsubmitted",
  "news.thread-shared",
  "schoolbook.acknowledge",
  "schoolbook.modifyresponse",
  "schoolbook.response",
  "schoolbook.word-resend",
  "schoolbook.word-shared"
];

export function setNotificationPref(notif, value, notificationPrefs) {
  return async (dispatch, getState) => {
    const newPrefs = notificationPrefs.reduce((acc, cur, i) => {
      acc[cur.key] = {
        ...cur,
        defaultFrequency:
          notif.key === cur.key && value ? "IMMEDIATE" : cur.defaultFrequency,
        "push-notif": notif.key === cur.key ? value : cur["push-notif"] === true
      };
      return acc;
    }, {});

    dispatch({
      notificationPrefs: Object.keys(newPrefs).map(p => ({
        ...newPrefs[p],
        key: p
      })),
      type: actionTypeSetNotifPrefs
    });

    savePreference("timeline", {
      config: newPrefs
    });
  };
}
