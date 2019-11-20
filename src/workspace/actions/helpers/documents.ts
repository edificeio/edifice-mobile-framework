/**
 * workspace list actions
 * Build actions to be dispatched to the hworkspace list reducer.
 */

import RNFB from 'rn-fetch-blob';
import Mime from "mime";
import moment from "moment";
import {asyncGetJson} from "../../../infra/redux/async";
import {IItems, IFiltersParameters, IFile, FilterId, IItem} from "../../types";
import {filters} from "../../types/filters/helpers/filters";
import Conf from "../../../../ode-framework-conf";
import {uriToFormData} from "./uriToFormData";
import {OAuth2RessourceOwnerPasswordClient} from "../../../infra/oauth";


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

export type IBackendDocumentArray = Array<IBackendDocument>;

// ADAPTER ----------------------------------------------------------------------------------------

const backendDocumentsAdapter: (data: IBackendDocumentArray) => IItems<IFile> = data => {
  const result = {} as IItems<IFile>;
  if (!data) return result;
  for (const item of data) {
    if (item.deleted) continue;
    result[item._id] = {
      contentType: item.metadata["content-type"],
      date: moment(item.modified, "YYYY-MM-DD HH:mm.ss.SSS").toDate().getTime(),
      filename: item.metadata.filename,
      id: item._id,
      isFolder: false,
      name: item.name,
      owner: filters(item.owner),
      ownerName: item.ownerName,
      size: item.metadata.size,
      url: `/workspace/document/${item._id}`
    };
  }
  return result;
};

// GET -----------------------------------------------------------------------------------------

export function getDocuments(parameters: IFiltersParameters): Promise<IItems<IItem>> {
  const {parentId} = parameters;

  if (parentId === FilterId.root) return Promise.resolve({});

  const formatParameters = (parameters = {}) => {
    let result = "?";

    for (let key in parameters) {
      if (!(parameters as any)[key]) continue;
      if (key === "parentId" && (parameters as any)[key] in FilterId)    // its a root folder, no pass parentId
        continue;
      result = result.concat(`${key}=${(parameters as any)[key]}&`);
    }
    return result.slice(0, -1);
  };

  return asyncGetJson(`/workspace/documents${formatParameters(parameters)}`, backendDocumentsAdapter);
}

// UPLOAD --------------------------------------------------------------------------------------

export const uploadDocument = (uri: string, onEnd: any) => {
  var RNGRP = require('react-native-get-real-path');

  RNGRP.getRealPathFromURI(uri).then((filePath: string) => {
    const filename = filePath.substring(filePath.lastIndexOf('/') + 1);

    const signedHeaders = OAuth2RessourceOwnerPasswordClient.connection.sign({}).headers;
    const headers = {...signedHeaders, "content-Type": "multipart/form-data"};

    RNFB.fetch(
      "POST",
      `${Conf.currentPlatform.url}/workspace/document?quality=1&thumbnail=120x120&thumbnail=100x100&thumbnail=290x290&thumbnail=381x381&thumbnail=1600x0`,
      headers,
      [{
        name: 'file',
        filename,
        data: RNFB.wrap(uri)
      }],
    )
      .then((response) => {
        onEnd(response)
      })
      .catch((err) => {
          console.log(err)
        }
      )
  });
}
