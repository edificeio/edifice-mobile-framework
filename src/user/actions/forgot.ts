/**
 * Activate account action(s)
 * Build actions to be dispatched to activate a new account
 */
import { Action } from "redux";
import Conf from "../../../ode-framework-conf";
import { asyncActionTypes } from "../../infra/redux/async";
import userConfig from "../config";
import Tracking from "../../tracking/TrackingManager";

// TYPES ------------------------------------------------------------------------------------------

export interface IForgotModel {
  login: string;
}

export interface IForgotSubmitPayload extends IForgotModel {
  service: "mail";
}

// ACTION INTERFACES ------------------------------------------------------------------------------

export interface IForgotSubmitRequestedAction extends Action {
  model: IForgotModel;
}
export interface IForgotSubmitReceivedAction extends Action {
  result: { error: string } | { status: string };
}

// ACTION TYPES -----------------------------------------------------------------------------------

export const actionTypeForgotRequest = asyncActionTypes(
  userConfig.createActionType("FORGOT_REQUESTED")
);

export const actionTypeForgetReceive = asyncActionTypes(
  userConfig.createActionType("FORGET_RECEIVED")
);

// ACTION CREATORS --------------------------------------------------------------------------------

function actionCreateForgotRequest(userLogin: string) {
  return { type: actionTypeForgotRequest, userLogin };
}

function actionCreateForgotReceive(
  result: { error: string } | { status: string }
) {
  return { type: actionTypeForgetReceive, result };
}

// THUNKS -----------------------------------------------------------------------------------------

export function action_forgotSubmit(userLogin: string) {
  return async dispatch => {
    try {
      // console.log("action_forgotSubmit");
      dispatch(actionCreateForgotRequest(userLogin));
      Tracking.logEvent("forgotPassword", {
        platform: Conf.currentPlatform.displayName
      });
      const res = await fetch(
        `${Conf.currentPlatform.url}/auth/forgot-password`,
        {
          body: JSON.stringify({
            login: userLogin,
            service: "mail"
          }),
          method: "POST"
        }
      );
      const resJson = await res.json();
      // console.log("resJson", resJson);
      dispatch(actionCreateForgotReceive(resJson));
    } catch (err) {
      dispatch(actionCreateForgotReceive({ error: "" }));
      // tslint:disable-next-line:no-console
      console.warn(err);
    }
  };
}

export function action_forgotReset() {
  return async dispatch => {
    // console.log("action_forgotReset");
    dispatch(actionCreateForgotReceive({ status: "" }));
  };
}
