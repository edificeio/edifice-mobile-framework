/**
 * Timeline v2 actions
 */

import { ThunkDispatch } from "redux-thunk";
import { getUserSession } from "../../../session";
import moduleConfig from "../moduleConfig";
import * as notifTypesState from "../reducer/notifTypes";
import { loadNotificationsTypesAction } from "./notifTypes";

export const loadNotificationsAction = () => async (dispatch: ThunkDispatch<any, any, any>, getState: () => any) => {
  try {
    const session = getUserSession(getState());
    let state = moduleConfig.getState(getState());
    // 1 - Load notification types if necessary
    if (!notifTypesState.getAreNotificationTypesLoaded(state.notifTypes)) {
      await dispatch(loadNotificationsTypesAction());
    }
    state = moduleConfig.getState(getState());
    // 2 - Load notification from filtered types
    console.log(notifTypesState.getNotificationFilterList(state.notifTypes));
  } catch (e) {
    console.warn(`[${moduleConfig.name}] loadNotificationsAction failed`, e);
  }
};
