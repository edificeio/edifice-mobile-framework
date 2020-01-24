// require the module

import { asyncActionTypes } from "../../infra/redux/async";
import config from "../config";
import { formatResults, uploadDocument } from "./helpers/documents";
import { ContentUri } from "../types";
import {COPY_CLEAR_ACTION_TYPE} from "./copypast";

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
export function uploadAction(parentId: string, uriContent: ContentUri[] | ContentUri) {
  return async (dispatch: any) => {
    try {
      const content = Array.isArray(uriContent) ? uriContent : [uriContent];
      dispatch(uploadRequested(parentId));
      uploadDocument(dispatch, parentId, content, (response: any) => {
        if (response.data) {
          const data = JSON.parse(response.data);
          dispatch(uploadReceived(parentId, formatResults(data)));
        }
      });
    } catch (ex) {
      console.log(ex.message);
      dispatch(uploadError(parentId, ex));
    }
  };
}
