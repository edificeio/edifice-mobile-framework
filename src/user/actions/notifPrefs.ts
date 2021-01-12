import deepmerge from "deepmerge";
import {
  fetchJSONWithCache,
} from "../../infra/fetchWithCache";
import { preference, savePreference } from "../../infra/Me";
import userConfig from "../config";
import { Trackers } from "../../infra/tracker";

export const actionTypeSetNotifPrefs = userConfig.createActionType(
  "NOTIFICATIONS_PREFS_SET"
);

export function loadNotificationPrefs() {
  return async (dispatch: any, getState: any) => {
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
      if (includeNotifKeys.includes(el.key as never)) {
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
    const defaultNotifsPrefsConfig = !rawDefaultNotifsPrefsConfig ? {} : rawDefaultNotifsPrefsConfig.reduce(
      (acc: any, el: any) => {
        if (includeNotifKeys.includes(el.key as never)) {
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

    // 5 : Dispatch load

    dispatch({
      notificationPrefs: mergedNotifPrefs,
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
/*
export const includeNotifKeys = [
  "messagerie.send-message",
  "schoolbook.publish",
  "schoolbook.word-resend",
  "blog.publish-post",
  "news.info-shared",
  "homeworks.share",
  "homeworks.entries.modified"
];
*/

/**
 * Only these preferences keys are used by Pocket for push-notifications. On button per app.
 * /!\ Caution : Order matters. Notifs prefs will be displayed in the same order as defined here.
 */
export const includeNotifKeysByApp = [
  {
    appName: "messagerie",
    notifKeys: ["push.notif.new.message", "messagerie.send-message"],
  },
  {
    appName: "schoolbook",
    notifKeys: [
      "schoolbook.publish",
      "schoolbook.word-resend",
      "schoolbook.acknowledge"
    ]
  },
  {
    appName: "blog",
    notifKeys: ["blog.publish-post"]
  },
  {
    appName: "news",
    notifKeys: ["news.info-shared"]
  },
  {
    appName: "homeworks",
    notifKeys: ["homeworks.share", "homeworks.entries.modified"]
  },
  {
    appName: "workspace",
    notifKeys: [ "workspace.contrib-folder", "workspace.share", "workspace.share-folder"]
  }
];

export const includeNotifKeys = [];
includeNotifKeysByApp.forEach(app =>
  app.notifKeys.forEach(key => includeNotifKeys.push(key))
);
// console.log("includeNotifKeys", includeNotifKeys);

export function action_toggleNotifPrefsByApp(
  appName: string,
  value: boolean,
  notificationPrefs: object
) {
  return async (dispatch: any, getState: any) => {
    // console.log("toggle notif prefs for app", appName);
    const newNotificationPrefs = {
      ...notificationPrefs
    };

    for (const pref of Object.values(newNotificationPrefs)) {
      // console.log(pref);
      const prefAppName = pref["type"].toLowerCase();
      if (appName === prefAppName) {
        pref["push-notif"] = value;
      }
    }

    // console.log("new prefs", newNotificationPrefs);

    dispatch({
      notificationPrefs: newNotificationPrefs,
      type: actionTypeSetNotifPrefs
    });

    savePreference("timeline", {
      config: newNotificationPrefs
    });
  };
}

// Deprecated. Use `action_toggleNotifPrefsByApp` instead to toggle all pref of an app
export function setNotificationPref(
  notif: { key: string },
  value: boolean,
  notificationPrefs: object
) {
  return async (dispatch: any, getState: any) => {
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
