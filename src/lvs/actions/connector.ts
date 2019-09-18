/**
 * Connector list actions
 * Build actions to be dispatched to the Connector reducer.
 */

import { Linking } from "react-native";

import lvsConfig from "../config";
import { signedFetchJson } from "../../infra/fetchWithCache";

// ACTION LIST ------------------------------------------------------------------------------------

export const actionTypes = {
  connecting: lvsConfig.createActionType("CONNECTOR") + "_CONNECTING",
  connected: lvsConfig.createActionType("CONNECTOR") + "_CONNECTED",
  error: lvsConfig.createActionType("CONNECTOR") + "_ERROR",
};

// ACTION CREATORS --------------------------------------------------------------------------------

export function connectorConnecting() {
  return { type: actionTypes.connecting };
}

export function connectorConnected() {
  return { type: actionTypes.connected };
}

export function connectorError(errmsg: string) {
  return { type: actionTypes.error, errmsg };
}

// THUNKS -----------------------------------------------------------------------------------------

export function openConnector(connectorAddress: string, successCallback: Function) {
  return async (dispatch: any) => {
    dispatch(connectorConnecting());
    try {
      const intermediateResponse = await signedFetchJson(connectorAddress);
      const isSupported = await Linking.canOpenURL(intermediateResponse.link);
      if (isSupported === true) {
        await Linking.openURL(intermediateResponse.link);
        dispatch(connectorConnected());
        successCallback()
      } else {
        dispatch(connectorError("Not supported"));
      }
    } catch (errmsg) {
      dispatch(connectorError(errmsg));
    }
  };
}
