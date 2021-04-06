/**
 * Timeline v2 actions
 */

import { ThunkDispatch } from "redux-thunk";
import { getUserSession } from "../../../session";
import moduleConfig from "../moduleConfig";
import { ITimeline_State } from "../reducer";
import * as notifDefinitionsStateHandler from "../reducer/notifDefinitions";
import * as notifSettingsStateHandler from "../reducer/notifSettings";
import { loadNotificationsDefinitionsAction } from "./notifDefinitions";
import { loadNotificationsSettingsAction } from "./notifSettings";
import { actions as notificationsActions } from "../reducer/notifications";
import { notificationsService } from "../service";

export const loadNotificationsAction = () => async (dispatch: ThunkDispatch<any, any, any>, getState: () => any) => {
  try {
    const session = getUserSession(getState());
    let state = moduleConfig.getState(getState()) as ITimeline_State;
    // 1 - Load notification definitions if necessary
    if (!notifDefinitionsStateHandler.getAreNotificationDefinitionsLoaded(state.notifDefinitions)) {
      await dispatch(loadNotificationsDefinitionsAction());
    }
    state = moduleConfig.getState(getState());

    // 2 - Load notification settings if necessary
    if (!notifSettingsStateHandler.getAreNotificationFilterSettingsLoaded(state.notifSettings)) {
      await dispatch(loadNotificationsSettingsAction());
    }
    // state = moduleConfig.getState(getState());

    // 3 - Load notifications
    dispatch(notificationsActions.request());
    const page = state.notifications.nextPage;
    console.log("state.notifSettings.notifFilterSettings.data", state.notifSettings.notifFilterSettings.data);
    const filters = Object.keys(state.notifSettings.notifFilterSettings.data).filter(filter => state.notifSettings.notifFilterSettings.data[filter]);
    console.log("filters", filters);
    const notifications = await notificationsService.page(session, page, filters);
    dispatch(notificationsActions.receipt(notifications, page));

  } catch (e) {
    console.warn(`[${moduleConfig.name}] loadNotificationsAction failed`, e);
  }
};
