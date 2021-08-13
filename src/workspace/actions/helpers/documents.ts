/**
 * workspace list actions
 * Build actions to be dispatched to the hworkspace list reducer.
 */

import moment from "moment";
import I18n from "i18n-js";
import { IFile, ContentUri, IFolder, IItems, IItem, FilterId } from "../../types";
import { filters } from "../../types/filters/helpers/filters";
import { progressAction, progressEndAction, progressInitAction } from "../../../infra/actions/progress";
import Toast from "react-native-tiny-toast";
import workspaceService, { IWorkspaceUploadParams } from "../../../framework/modules/workspace/service";
import { ThunkDispatch } from "redux-thunk";
import { LocalFile } from "../../../framework/util/fileHandler";
import { getUserSession } from "../../../framework/util/session";

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

  if (!data) {
    return result;
  } else if (data instanceof Array) {
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

export const uploadDocumentAction = (content: ContentUri[], parentId?: string) =>
  async (dispatch: ThunkDispatch<any, any, any>, getState: () => any) => {
    try {
      const lcs = content.map(c => new LocalFile({
        filepath: c.uri,
        filename: c.name,
        filetype: c.mime,
      }, { _needIOSReleaseSecureAccess: false }))
      const jobs = workspaceService.startUploadFiles(getUserSession(getState()), lcs, { parent: parentId as IWorkspaceUploadParams['parent'] }, {
        onBegin: (res => {
          dispatch(progressInitAction());
        }),
        onProgress: (res => {
          dispatch(progressAction((res.totalBytesSent / res.totalBytesExpectedToSend) * 100));
        })
      });
      return Promise.all(jobs.map(j => j.promise)).then(files => {
        dispatch(progressAction(100));
        dispatch(progressEndAction());
        return files;
      });
    } catch (e) {
      console.warn("error uploading: ", e);
      if (e === `{"error":"file.too.large"}`) {
        Toast.show(I18n.t("workspace-quota-overflowText"), {
          position: Toast.position.BOTTOM,
          mask: false,
          containerStyle: { width: "95%", backgroundColor: "black" },
        });
      };
    }
  }


// export const uploadDocument = (dispatch: any, content: ContentUri[], parentId?: string) => {
//   const signedHeaders = getAuthHeader();
//   const headers = { ...signedHeaders, "Content-Type": "multipart/form-data" };
//   console.log("cgi headers", headers);

//   const parentIdParam = !!parentId && !Object.keys(FilterId).includes(parentId) ? `parentId=${parentId}&` : "";
//   const protectedParam = parentId === FilterId.protected ? "protected=true&application=media-library&" : "";

//   const url = `${Conf.currentPlatform.url}/workspace/document?${parentIdParam}${protectedParam}quality=1&thumbnail=120x120&thumbnail=100x100&thumbnail=290x290&thumbnail=381x381&thumbnail=1600x0`;

//   console.log("upload document", content, url);

//   dispatch(progressInitAction());

//   // console.log(content.map((item, index) => ({ name: `document${index}`, type: item.mime, filename: item.name, data: RNFB.wrap(decodeURIComponent(item.uri)) })));
//   console.log("cgi content", content);
//   const response = content.map((item, index) =>
//     RNFB.fetch("POST", url, headers, [
//       {
//         name: `document${index}`, type: item.mime, filename: item.name, data: RNFB.wrap(decodeURIComponent(
//           Platform.OS === 'ios' ? item.uri.replace('file://', '') : item.uri
//         ))
//       },
//     ])
//       .uploadProgress({ interval: 100 }, (written, total) => {
//         // console.log("progress");
//         dispatch(progressAction((written / total) * 100));
//       })
//       .then(response => {
//         // console.log("upload done");
//         dispatch(progressAction(100));
//         dispatch(progressEndAction());

//         if (response && response.respInfo.status >= 200 && response.respInfo.status < 300) {
//           return Promise.resolve(response.data);
//         } else {
//           return Promise.reject(response.data);
//         }
//       })
//       .catch(e => {
//         console.warn("error uploading: ", e);
//         if (e === `{"error":"file.too.large"}`) {
//           Toast.show(I18n.t("workspace-quota-overflowText"), {
//             position: Toast.position.BOTTOM,
//             mask: false,
//             containerStyle: { width: "95%", backgroundColor: "black" },
//           });
//         };
//       })
//   );

//   return Promise.all(response);
// };
