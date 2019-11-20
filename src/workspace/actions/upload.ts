// require the module

import {asyncActionTypes} from "../../infra/redux/async";
import config from "../config";
import {uploadDocument} from "./helpers/documents";
import {getList} from "./list";
import {FilterId} from "../types";



// ACTION UPLOAD ------------------------------------------------------------------------------------


export const actionTypes = asyncActionTypes(
  config.createActionType("WORKSPACE_UPLOAD")
);

export function uploadInvalidated() {
  return { type: actionTypes.invalidated };
}

export function uploadRequested() {
  return { type: actionTypes.requested };
}

export function uploadReceived(data?: any, id?: string | undefined) {
  return { type: actionTypes.received, data, id, receivedAt: Date.now() };
}

export function uploadError(errmsg: string) {
  return { type: actionTypes.fetchError, error: true, errmsg };
}

// THUNKS -----------------------------------------------------------------------------------------

const sortOnName = ( a: string, b: string) : boolean => {
  return a < b;
}

/**
 * Take a file from the mobile and post it to the backend.
 * Dispatches WORKSPACE_UPLOAD_REQUESTED, WORKSPACE_UPLOAD_RECEIVED, and WORKSPACE_UPLOAD_FETCH_ERROR if an error occurs.
 */
export function upload(uriContent: string) {
  console.log( "upload url " + uriContent);
  return async (dispatch: any, state: any) => {

    try {
      uploadDocument(uriContent, () => {
        dispatch(getList({filter: FilterId.owner}));
        dispatch(uploadReceived());
      })
    }
    catch( ex) {
      console.log(ex.message);
      dispatch(uploadError(ex));
    }
  }
}

