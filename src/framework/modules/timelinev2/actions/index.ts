/**
 * Timeline v2 actions
 */

import { ThunkDispatch } from "redux-thunk";
import { getUserSession, IUserSession } from "../../../session";
import moduleConfig from "../moduleConfig";
import { ITimeline_State } from "../reducer";
import * as notifDefinitionsStateHandler from "../reducer/notifDefinitions";
import * as notifSettingsStateHandler from "../reducer/notifSettings";
import { loadNotificationsDefinitionsAction } from "./notifDefinitions";
import { loadNotificationsSettingsAction } from "./notifSettings";
import { actions as notificationsActions } from "../reducer/notifications";
import { notificationsService } from "../service";

const _prepareNotificationsAction = () => async (dispatch: ThunkDispatch<any, any, any>, getState: () => any) => {
  // const session = getUserSession(getState());
  let state = moduleConfig.getState(getState()) as ITimeline_State;
  // 1 - Load notification definitions if necessary
  if (!notifDefinitionsStateHandler.getAreNotificationDefinitionsLoaded(state.notifDefinitions)) {
    await dispatch(loadNotificationsDefinitionsAction());
    state = moduleConfig.getState(getState());
  }

  // 2 - Load notification settings if necessary
  if (!notifSettingsStateHandler.getAreNotificationFilterSettingsLoaded(state.notifSettings)) {
    await dispatch(loadNotificationsSettingsAction());
    state = moduleConfig.getState(getState());
  }
  return state;
}

/**
 * Clear the timeline and fetch the first page. If the fetch fail, data is not cleared.
 */
export const startLoadNotificationsAction = () => async (dispatch: ThunkDispatch<any, any, any>, getState: () => any) => {
  try {
    const session = getUserSession(getState());
    const state = await dispatch(_prepareNotificationsAction()) as unknown as ITimeline_State; // TS BUG: await is needed here
    if (state.notifications.isFetching) return;
    console.log("state", state);

    // Load notifications page 0 after reset
    dispatch(notificationsActions.request());
    const page = 0;
    console.log("state.notifSettings.notifFilterSettings.data", state.notifSettings.notifFilterSettings.data);
    const filters = Object.keys(state.notifSettings.notifFilterSettings.data).filter(filter => state.notifSettings.notifFilterSettings.data[filter]);
    console.log("filters", filters);
    const notifications = await notificationsService.page(session, page, filters);
    dispatch(notificationsActions.clear());
    dispatch(notificationsActions.receipt(notifications, page));
  } catch (e) {
    // ToDo: Error handling
    console.warn(`[${moduleConfig.name}] loadNotificationsAction failed`, e);
  }
};

/**
 * Fetch a specific page of notifgications and add it to the notifications data.
 * Use this to load automatically the next page by call the action without provideing the `page` parameter.
 * @param page page number to load. Data of this page will be replaced by the new one. If no page specified, load the next page automatically.
 * @returns true if there is more pages to load, false if data end is reached.
 */
export const loadNotificationsPageAction = (page?: number) => async (dispatch: ThunkDispatch<any, any, any>, getState: () => any) => {
  try {
    const session = getUserSession(getState());
    let state = await dispatch(_prepareNotificationsAction()) as unknown as ITimeline_State; // TS BUG: await is needed here
    page = page || state.notifications.nextPage;
    if (state.notifications.isFetching) return;
    console.log("state", state);

    // Load notifications at the specified page, no reset
    dispatch(notificationsActions.request());
    console.log("state.notifSettings.notifFilterSettings.data", state.notifSettings.notifFilterSettings.data);
    const filters = Object.keys(state.notifSettings.notifFilterSettings.data).filter(filter => state.notifSettings.notifFilterSettings.data[filter]);
    console.log("filters", filters);
    const notifications = await notificationsService.page(session, page, filters);
    dispatch(notificationsActions.receipt(notifications, page));
    // Returns true if there is more pages to load
    state = moduleConfig.getState(getState());
    return !state.notifications.endReached;
  } catch (e) {
    // ToDo: Error handling
    console.warn(`[${moduleConfig.name}] loadNotificationsPageAction failed`, e);
  }
};
