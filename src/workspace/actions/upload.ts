// require the module

import {asyncActionTypes} from "../../infra/redux/async";
import config from "../config";
import {backendDocumentsAdapter, uploadDocument} from "./helpers/documents";
import {ContentUri, FilterId} from "../types";
import {addReceived} from "./add";



// ACTION UPLOAD ------------------------------------------------------------------------------------


export const actionTypesUpload = asyncActionTypes(
  config.createActionType("WORKSPACE_UPLOAD")
);

export function uploadRequested() {
  return { type: actionTypesUpload.requested };
}

export function uploadReceived(data?: any, id?: string | undefined) {
  return { type: actionTypesUpload.received, data, id, receivedAt: Date.now() };
}

export function uploadError(errmsg: string) {
  return { type: actionTypesUpload.fetchError, error: true, errmsg };
}

// THUNKS -----------------------------------------------------------------------------------------

const sortOnName = ( a: string, b: string) : boolean => {
  return a < b;
};

/**
 * Take a file from the mobile and post it to the backend.
 * Dispatches WORKSPACE_UPLOAD_REQUESTED, WORKSPACE_UPLOAD_RECEIVED, and WORKSPACE_UPLOAD_FETCH_ERROR if an error occurs.
 */
export function uploadAction(uriContent: any) {
  console.log( "upload url " + uriContent);
  return async (dispatch: any, state: any) => {

    try {
      dispatch(uploadRequested());
      uploadDocument(uriContent, (response: any) => {
        if (response.data) {
          const data = JSON.parse(response.data);
          const dataArray = Array.isArray(data) ? data : [data];
          dispatch(addReceived(backendDocumentsAdapter(dataArray), FilterId.owner));
          dispatch(uploadReceived());
        }
      })
    }
    catch( ex) {
      console.log(ex.message);
      dispatch(uploadError(ex));
    }
  }
}

