/**
 * workspace list actions
 * Build actions to be dispatched to the hworkspace list reducer.
 */

import RNFB from "rn-fetch-blob";
import moment from "moment";
import { Platform, ToastAndroid } from "react-native";
import I18n from "i18n-js";
import { IFile, ContentUri, IFolder, IItems, IItem, FilterId } from "../../types";
import { filters } from "../../types/filters/helpers/filters";
import Conf from "../../../../ode-framework-conf";
import { OAuth2RessourceOwnerPasswordClient, getDummySignedRequest, getAuthHeader } from "../../../infra/oauth";
import { progressAction, progressEndAction, progressInitAction } from "../../../infra/actions/progress";

export type IDocumentArray = any[];

// ADAPTER ----------------------------------------------------------------------------------------

function checkAncestorsAndFormat(result, item, parentId) {
  const { eParent } = item;

  if (typeof item === "string") {
    result[item as string] = item;
    return result;
  }

  if (!parentId || eParent === parentId || (!eParent && parentId === "owner")) {
    result[item._id] = formatResult(item);
    return result;
  }

  return result;
}

export const formatResults: (
  data: IDocumentArray | IBackendDocument | IBackendFolder | string[],
  parentId?: string
) => IItems<IItem | string> = (data, parentId) => {
  let result = {} as IItems<IFile | IFolder | string>;

  if (data instanceof Array) {
    if (!data) {
      return result;
    }
    (data as any[]).map(item => (result = checkAncestorsAndFormat(result, item, parentId)));
    return result;
  } else {
    return checkAncestorsAndFormat(result, data, parentId);
  }
};

function formatResult(item: IBackendDocument | IBackendFolder | any): IFile | IFolder {
  if (item.metadata) return formatFileResult(item as IBackendDocument);
  else return formatFolderResult(item as IBackendFolder);
}

// File TYPE -------------------------------------------------------------------------------------------

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

// ADAPTER ----------------------------------------------------------------------------------------

function formatFileResult(item: IBackendDocument): IFile {
  if (!item || !item._id) return {} as IFile;

  return {
    contentType: item.metadata["content-type"],
    date: moment(item.modified, "YYYY-MM-DD HH:mm.ss.SSS")
      .toDate()
      .getTime(),
    filename: item.name,
    id: item._id,
    isFolder: false,
    name: item.name,
    owner: filters(item.owner),
    ownerName: item.ownerName,
    size: item.metadata.size,
    url: `/workspace/document/${item._id}`,
  };
}

// Folder TYPE -------------------------------------------------------------------------------------------

export type IBackendFolder = {
  _id: string;
  created: string;
  modified: string;
  owner: string;
  ownerName: string;
  name: string;
  application: string;
  shared: [];
  ancestors: [];
  deleted: boolean;
  eParent: string | null;
  eType: string;
  externalId: string;
  inheritedShares: [];
  parents: [];
};

// ADAPTER ----------------------------------------------------------------------------------------

function formatFolderResult(item: IBackendFolder): IFolder {
  if (!item || !item._id) return {} as IFolder;

  return {
    date: moment(item.modified, "YYYY-MM-DD HH:mm.ss.SSS")
      .toDate()
      .getTime(),
    id: item._id,
    isFolder: true,
    name: item.name,
    owner: filters(item.owner),
    ownerName: item.ownerName,
    number: 1,
  };
}

// UPLOAD --------------------------------------------------------------------------------------

export const uploadDocument = (dispatch: any, parentId: string, content: ContentUri[], onEnd: any) => {
  const signedHeaders = getAuthHeader();
  const headers = { ...signedHeaders, "content-Type": "multipart/form-data" };

  const parentIdParam = parentId === FilterId.owner ? "parentId=" + parentId + "&" : "";
  const protectedParam = parentId === FilterId.protected ? "protected=true&application=media-library&" : "";

  const url = `${Conf.currentPlatform.url}/workspace/document?${parentIdParam}${protectedParam}quality=1&thumbnail=120x120&thumbnail=100x100&thumbnail=290x290&thumbnail=381x381&thumbnail=1600x0`;

  dispatch(progressInitAction());
  const uploads = content.map((item, index) => {
    return RNFB.fetch("POST", url, headers, [
      { name: `document${index}`, type: item.mime, filename: item.name, data: RNFB.wrap(item.uri) },
    ])
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
        return JSON.parse(response.data);
      })
      .catch(() => {
        if (Platform.OS === "android") {
          ToastAndroid.show(I18n.t("workspace-uploadFailed"), ToastAndroid.SHORT);
        }
        dispatch(progressEndAction());
      });
  });

  return Promise.all(uploads).then(data => formatResults(data, undefined));
};
