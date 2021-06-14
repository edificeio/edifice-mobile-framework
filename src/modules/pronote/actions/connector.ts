/**
 * Connector list actions
 * Build actions to be dispatched to the Connector reducer.
 */

import { Linking } from "react-native";

import { signedFetch } from "../../../infra/fetchWithCache";
import pronoteConfig from "../moduleConfig";

// ACTION LIST ------------------------------------------------------------------------------------

export const actionTypes = {
  connecting: pronoteConfig.namespaceActionType("CONNECTOR") + "_CONNECTING",
  connected: pronoteConfig.namespaceActionType("CONNECTOR") + "_CONNECTED",
  error: pronoteConfig.namespaceActionType("CONNECTOR") + "_ERROR",
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
      const intermediateResponse = await signedFetch(connectorAddress);
      const finalUrl = intermediateResponse.headers.get("location");
      const isSupported = await Linking.canOpenURL(finalUrl);
      if (isSupported === true) {
        await Linking.openURL(finalUrl);
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
