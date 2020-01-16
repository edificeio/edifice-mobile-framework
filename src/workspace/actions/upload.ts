// require the module

import { asyncActionTypes } from "../../infra/redux/async";
import config from "../config";
import { uploadDocument } from "./helpers/documents";
import { ContentUri, FilterId } from "../types";
import { listAction } from "./list";

// ACTION UPLOAD ------------------------------------------------------------------------------------

export const actionTypesUpload = asyncActionTypes(config.createActionType("WORKSPACE_UPLOAD"));

export function uploadRequested() {
  return { type: actionTypesUpload.requested };
}

export function uploadReceived(data?: any, id?: string | undefined) {
  return { type: actionTypesUpload.received, data, id, receivedAt: Date.now() };
}

export function uploadError(errmsg: string) {
  return { type: actionTypesUpload.fetchError, error: true, errmsg };
}

/**
 * Take a file from the mobile and post it to the backend.
 * Dispatches WORKSPACE_UPLOAD_REQUESTED, WORKSPACE_UPLOAD_RECEIVED, and WORKSPACE_UPLOAD_FETCH_ERROR if an error occurs.
 */
export function uploadAction(uriContent: ContentUri[] | ContentUri) {
  return async (dispatch: any) => {
    try {
      const content = Array.isArray(uriContent) ? uriContent : [uriContent];
      dispatch(uploadRequested());
      uploadDocument(dispatch, content, (response: any) => {
        if (response.data) {
          // const data = JSON.parse(response.data);
          // const dataArray = Array.isArray(data) ? data : [data];
          dispatch(
            listAction({
              // better to do addReceived, but sometime data is erased by a previous long listAction
              filter: FilterId.owner,
              parentId: FilterId.owner,
            })
          );
          //dispatch(addReceived(backendDocumentsAdapter(dataArray), FilterId.owner));
          dispatch(uploadReceived());
        }
      });
    } catch (ex) {
      console.log(ex.message);
      dispatch(uploadError(ex));
    }
  };
}
