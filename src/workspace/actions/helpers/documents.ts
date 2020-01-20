/**
 * workspace list actions
 * Build actions to be dispatched to the hworkspace list reducer.
 */

import RNFB from "rn-fetch-blob";
import moment from "moment";
import { Platform, ToastAndroid } from "react-native";
import I18n from "i18n-js";
import { IFile, ContentUri, IFolder } from "../../types";
import { filters } from "../../types/filters/helpers/filters";
import Conf from "../../../../ode-framework-conf";
import { OAuth2RessourceOwnerPasswordClient, getDummySignedRequest, getAuthHeader } from "../../../infra/oauth";
import { progressAction, progressEndAction, progressInitAction } from "../../../infra/actions/progress";
import { IRootItems } from "../../types/states/items";
import { formatFolderResult, IBackendFolder } from "./folders";
import { IId } from "../../../types";

// TYPE -------------------------------------------------------------------------------------------

export type IBackendDocument = {
  _id: string;
  name: string;
  metadata: {
    name: "file";
    filename: string;
    "content-type": string;
    "content-transfer-encoding": string;
    charset: "UTF-8";
    size: number;
  };
  deleted: boolean;
  eParent: string | null;
  eType: "file";
  file: string;
  shared: [];
  inheritedShares: [];
  created: string;
  modified: string;
  owner: string;
  ownerName: string;
  thumbnails: { [id: string]: string };
};

export type IDocumentArray = Array<any>;

// ADAPTER ----------------------------------------------------------------------------------------

export const formatResults: (data: IDocumentArray | IBackendDocument | IBackendFolder) => IRootItems<IId> = data => {
  if (data instanceof Array) {
    let result = {} as IRootItems<IId>;
    if (!data) {
      return result;
    }
    for (const item of data) {
      result[item._id] = formatResult(item);
    }
    return result;
  } else return formatResult(data);
};

export function formatResult(item: IBackendDocument | IBackendFolder | any): IFile | IFolder {
  if (item.metadata) return formatFileResult(item as IBackendDocument);
  else return formatFolderResult(item as IBackendFolder);
}

export function formatFileResult(item: IBackendDocument): IFile {
  const result = {} as IFile;

  if (!item) {
    return result;
  }

  return {
    contentType: item.metadata["content-type"],
    date: moment(item.modified, "YYYY-MM-DD HH:mm.ss.SSS")
      .toDate()
      .getTime(),
    filename: item.metadata.filename,
    id: item._id,
    isFolder: false,
    name: item.name,
    owner: filters(item.owner),
    ownerName: item.ownerName,
    size: item.metadata.size,
    url: `/workspace/document/${item._id}`,
  };
}

// UPLOAD --------------------------------------------------------------------------------------

export const uploadDocument = (dispatch: any, parentId: string, content: ContentUri[], onEnd: any) => {
  const signedHeaders = getAuthHeader();
  const headers = { ...signedHeaders, "content-Type": "multipart/form-data" };
  const body = content.reduce(
    (acc, item, index) => [
      ...acc,
      { name: `document${index}`, type: item.mime, filename: item.name, data: RNFB.wrap(item.uri) },
    ],
    []
  );

  dispatch(progressInitAction());
  RNFB.fetch(
    "POST",
    `${Conf.currentPlatform.url}/workspace/document?parentId=${parentId}&quality=1&thumbnail=120x120&thumbnail=100x100&thumbnail=290x290&thumbnail=381x381&thumbnail=1600x0`,
    headers,
    body
  )
    .uploadProgress({ interval: 100 }, (written, total) => {
      dispatch(progressAction((written / total) * 100));
    })
    .then(response => {
      dispatch(progressAction(100));
      setTimeout(() => {
        dispatch(progressEndAction());
        if (Platform.OS === "android") {
          ToastAndroid.show(I18n.t("workspace-uploadSuccessful"), ToastAndroid.SHORT);
        }
        onEnd(response);
      }, 500);
    })
    .catch(err => {
      if (Platform.OS === "android") {
        ToastAndroid.show(I18n.t("workspace-uploadFailed"), ToastAndroid.SHORT);
      }
      console.log("upload failed", err.message);
      dispatch(progressEndAction());
    });
};
