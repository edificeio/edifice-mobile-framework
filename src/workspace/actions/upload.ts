// require the module

import { asyncActionTypes } from "../../infra/redux/async";
import config from "../config";
import { formatResults, uploadDocument } from "./helpers/documents";
import { ContentUri, IItem } from "../types";
import { Trackers } from "../../infra/tracker";
import { getExtension } from "../../infra/actions/downloadHelper";

// ACTION UPLOAD ------------------------------------------------------------------------------------

export const actionTypesUpload = asyncActionTypes(config.createActionType("WORKSPACE_UPLOAD"));

export function uploadRequested(parentId) {
  return {
    type: actionTypesUpload.requested,
    payload: {
      parentId,
    },
  };
}

export function uploadReceived(parentId, data: any) {
  return {
    type: actionTypesUpload.received,
    data,
    receivedAt: Date.now(),
    payload: {
      parentId,
    },
  };
}

export function uploadError(parentId, errmsg: string) {
  return {
    type: actionTypesUpload.fetchError,
    error: true,
    errmsg,
    payload: {
      parentId,
    },
  };
}

/**
 * Take a file from the mobile and post it to the backend.
 * Dispatches WORKSPACE_UPLOAD_REQUESTED, WORKSPACE_UPLOAD_RECEIVED, and WORKSPACE_UPLOAD_FETCH_ERROR if an error occurs.
 */
export function uploadAction(parentId: string, uriContent: ContentUri[] | ContentUri, doTrack: boolean = true) {
  return async (dispatch: any) => {
    try {
      const content = Array.isArray(uriContent) ? uriContent : [uriContent];
      dispatch(uploadRequested(parentId));
      const response = await uploadDocument(dispatch, content, parentId);
      const data = response.map(item => JSON.parse(item));
      dispatch(uploadReceived(parentId, formatResults(data)));
      doTrack && Trackers.trackEvent("Workspace", 'UPLOAD');
    } catch (ex) {
      console.log(ex);
      dispatch(uploadError(parentId, ex));
    }
  };
}
