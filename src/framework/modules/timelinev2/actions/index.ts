/**
 * Timeline v2 actions
 */

import { Dispatch } from "redux";
import { ThunkDispatch } from "redux-thunk";
import { getUserSession } from "../../../session";
import moduleConfig from "../moduleConfig";
import { getAreNotificationTypesLoaded } from "../reducer/notifTypes";
import { loadNotificationsTypesAction } from "./notifTypes";

export const loadNotificationsAction = () => async (dispatch: ThunkDispatch<any, any, any>, getState: () => any) => {
  try {
    console.log("begin loadNotificationsAction");
    const session = getUserSession(getState());
    const state = moduleConfig.getState(getState());
    console.log(state.notifTypes, getAreNotificationTypesLoaded(state.notifTypes));
    if (!getAreNotificationTypesLoaded(state.notifTypes)) {
      await dispatch(loadNotificationsTypesAction());
    }
  } catch (e) {
    console.warn(`[${moduleConfig.name}] loadNotificationsAction failed`, e);
  }
};
