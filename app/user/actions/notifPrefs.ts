import deepmerge from "deepmerge";
import {
  fetchJSONWithCache,
  signedFetchJson
} from "../../infra/fetchWithCache";
import { preference, savePreference } from "../../infra/Me";
import userConfig from "../config";

export const actionTypeSetNotifPrefs = userConfig.createActionType(
  "NOTIFICATIONS_PREFS_SET"
);

export function loadNotificationPrefs() {
  return async (dispatch, getState) => {
    // 1 : Get user's timeline preferences

    const rawUserTimelinePrefs = (await preference("timeline")) || {
      config: {}
    };
    if (!rawUserTimelinePrefs.config) rawUserTimelinePrefs.config = {};
    // console.log("rawUserTimelinePrefs", rawUserTimelinePrefs);

    // 2 : Build user preferences

    const userNotifPrefsConfig = Object.values(
      rawUserTimelinePrefs.config
    ).reduce((acc, el: any) => {
      if (includeNotifKeys.includes(el.key)) {
        acc[el.key] = { ...el, "push-notif": el["push-notif"] || false }; // In the eventual case of push-notifs is not defined for this key, we consider `false`.
      }
      return acc;
    }, {});
    // console.log("userNotifPrefsConfig", userNotifPrefsConfig);

    // 3 : Get default notif prefs

    // These default prefs are also a complete list of existing prefs keys
    // Also, the complete key list is filtred with excludeNotifTypes array.
    const rawDefaultNotifsPrefsConfig = await fetchJSONWithCache(
      "/timeline/notifications-defaults"
    );
    const defaultNotifsPrefsConfig = rawDefaultNotifsPrefsConfig.reduce(
      (acc, el) => {
        if (includeNotifKeys.includes(el.key)) {
          acc[el.key] = { ...el, "push-notif": el["push-notif"] || false }; // In the eventual case of push-notifs is not defined for this key, we consider `false`.
        }
        return acc;
      },
      {}
    );
    // console.log("defaultNotifsPrefsConfig", defaultNotifsPrefsConfig);

    // 4 : We merge the user values in the default ones.

    const mergedNotifPrefs = deepmerge(
      defaultNotifsPrefsConfig,
      userNotifPrefsConfig
    );
    // console.log("mergedNotifPrefs", mergedNotifPrefs);

    // 5 : Sort merged notifs prefs

    const sortedNotifPrefs = {};
    includeNotifKeys.map(prefName => {
      sortedNotifPrefs[prefName] = mergedNotifPrefs[prefName];
    });
    // console.log("sortedNotifPrefs", sortedNotifPrefs);

    // 5 : Dispatch load

    dispatch({
      notificationPrefs: sortedNotifPrefs,
      type: actionTypeSetNotifPrefs
    });
  };
}

/*
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
*/

/**
 * Only these preferences keys are used by Pocket for push-notifications.
 * /!\ Caution : Order matters. Notifs prefs will be displayed in the same order as defined here.
 */
export const includeNotifKeys = [
  "messagerie.send-message",
  "schoolbook.publish",
  "blog.publish-post",
  "news.info-shared"
  // TODO (Soon) Homework
];

export function setNotificationPref(
  notif: { key: string },
  value: boolean,
  notificationPrefs: object
) {
  return async (dispatch, getState) => {
    // console.log("set notif pref", notif, value, notificationPrefs);
    const newNotificationPrefs = {
      ...notificationPrefs,
      [notif.key]: {
        ...notif,
        "push-notif": value
      }
    };
    // console.log("newNotificationPrefs", newNotificationPrefs);

    dispatch({
      notificationPrefs: newNotificationPrefs,
      type: actionTypeSetNotifPrefs
    });

    savePreference("timeline", {
      config: newNotificationPrefs
    });
  };
}
