import { asyncActionTypes } from "../../infra/redux/async";
import config from "../config";
import { asyncActionRawFactory } from "../../infra/actions/asyncActionFactory";
import { IFile, IItems } from "../types";
import { downloadFiles, getExtension } from "../../infra/actions/downloadHelper";
import { ThunkDispatch } from "redux-thunk";
import workspaceService from "../../framework/services/workspace";
import { getUserSession } from "../../framework/util/session";
import { IDistantFile } from "../../framework/util/file";
import { Trackers } from "../../framework/util/tracker";

export const actionTypesDownload = asyncActionTypes(config.createActionType("/workspace/download"));

export function downloadAction(parentId: string, selected: IItems<IFile>) {
  return asyncActionRawFactory(actionTypesDownload, { parentId }, async () => {
    downloadFiles(Object.values(selected));
    return {};
  });
}

const convertIFileToIDistantFile = (file: IFile) => {
  return {
    url: file.url,
    filename: file.name,
    filesize: file.size,
    filetype: file.contentType
  } as IDistantFile;
}

export const newDownloadAction = (parentId: string, selected: IItems<IFile>) =>
  async (dispatch: ThunkDispatch<any, any, any>, getState: () => any) => {
    console.log("WILL DISPATCH NEW DOWNLOAD FILE");
    return dispatch(asyncActionRawFactory(actionTypesDownload, { parentId }, async () => {
      console.log("NEW DOWNLOAD FILE");
      return Object.values(selected).map(sel => {
        if (sel.url.startsWith("/zimbra")) {
          Trackers.trackEvent("Zimbra", "DOWNLOAD ATTACHMENT");
        } else {
          Trackers.trackEvent("Workspace", "DOWNLOAD", getExtension(sel.filename));
        }
        workspaceService.downloadFile(
          getUserSession(getState()),
          convertIFileToIDistantFile(sel),
          {},
          {}
        ).then(f => f.open())
      });
    }));
  }
