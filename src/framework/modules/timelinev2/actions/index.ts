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
import { loadNotificationFiltersSettingsAction } from "./notifSettings";
import { actions as notificationsActions } from "../reducer/notifications";
import { actions as flashMessagesActions } from "../reducer/flashMessages";
import { flashMessagesService, notificationsService } from "../service";

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
    await dispatch(loadNotificationFiltersSettingsAction());
    state = moduleConfig.getState(getState());
  }
  return state;
}

/**
 * Clear the timeline and fetch the first page. If the fetch fails, data is not cleared.
 */
export const startLoadNotificationsAction = () => async (dispatch: ThunkDispatch<any, any, any>, getState: () => any) => {
  try {
    const session = getUserSession(getState());
    const state = await dispatch(_prepareNotificationsAction()) as unknown as ITimeline_State; // TS BUG: await is needed here
    if (state.notifications.isFetching) return;

    // Load notifications page 0 & flash messages (after reset)
    dispatch(notificationsActions.request());
    dispatch(flashMessagesActions.request());

    const page = 0;
    const filters = Object.keys(state.notifSettings.notifFilterSettings.data).filter(filter => state.notifSettings.notifFilterSettings.data[filter]);
    const [notifications, flashMessages] = await Promise.all([
      notificationsService.page(session, page, filters),
      flashMessagesService.list(session)
    ])

    dispatch(notificationsActions.clear());
    dispatch(flashMessagesActions.clear());
    dispatch(notificationsActions.receipt(notifications, page));
    dispatch(flashMessagesActions.receipt(flashMessages));
  } catch (e) {
    // ToDo: Error handling
    console.warn(`[${moduleConfig.name}] loadNotificationsAction failed`, e);
  }
};

/**
 * Fetch a specific page of notifications and add it to the notifications data.
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

    // Load notifications at the specified page, no reset
    dispatch(notificationsActions.request());
    const filters = Object.keys(state.notifSettings.notifFilterSettings.data).filter(filter => state.notifSettings.notifFilterSettings.data[filter]);
    const notifications = await notificationsService.page(session, page, filters);
    dispatch(notificationsActions.receipt(notifications, page));
    // Returns true if there is more pages to load
    state = moduleConfig.getState(getState());
    return !state.notifications.endReached;
  } catch (e) {
    // ToDo: Error handling
    console.warn(`[${moduleConfig.name}] loadNotificationsPageAction failed`, e);
    dispatch(notificationsActions.error(e));
  }
};

/**
 * Dismiss a given flash message by marking it as read.
 */
export const dismissFlashMessageAction = (flashMessageId: number) => async (dispatch: ThunkDispatch<any, any, any>, getState: () => any) => {
  try {
    const session = getUserSession(getState());

    // Dismiss flash message
    dispatch(flashMessagesActions.dismissRequest(flashMessageId));
    await flashMessagesService.dismiss(session, flashMessageId);
    dispatch(flashMessagesActions.dismissReceipt(flashMessageId));
  } catch (e) {
    // ToDo: Error handling (notifier: "votre action n'a pas été correctement exécutée (problème de connexion)")
    console.warn(`[${moduleConfig.name}] dismissFlashMessageAction failed`, e);
    dispatch(flashMessagesActions.dismissError(flashMessageId));
  }
};
