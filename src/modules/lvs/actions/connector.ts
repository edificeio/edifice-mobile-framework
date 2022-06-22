/**
 * Connector list actions
 * Build actions to be dispatched to the Connector reducer.
 */
import { openUrl } from '~/framework/util/linking';
import { signedFetchJson } from '~/infra/fetchWithCache';
import lvsConfig from '~/modules/lvs/moduleConfig';

// ACTION LIST ------------------------------------------------------------------------------------

export const actionTypes = {
  connecting: lvsConfig.namespaceActionType('CONNECTOR') + '_CONNECTING',
  connected: lvsConfig.namespaceActionType('CONNECTOR') + '_CONNECTED',
  error: lvsConfig.namespaceActionType('CONNECTOR') + '_ERROR',
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
      await openUrl(intermediateResponse.link, undefined, true);
      dispatch(connectorConnected());
      successCallback();
    } catch (errmsg) {
      dispatch(connectorError(errmsg));
    }
  };
}
