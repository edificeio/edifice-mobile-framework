import { IUploadCommonParams } from '~/framework/util/fileHandler/service';

export const implicitWorkspaceUploadParams = {
  owner: {}, // Exists BackEnd side but not useed yet!
  protected: { application: 'media-library', protected: 'true' },
  root: {}, // Exists BackEnd side but not useed yet! // Exists BackEnd side but not useed yet!
  shared: {}, // Exists BackEnd side but not useed yet!
  trash: {}, // Exists BackEnd side but not useed yet!
};

export type WorkspaceParentItem = keyof typeof implicitWorkspaceUploadParams | string;
export interface IWorkspaceUploadParams extends IUploadCommonParams {
  parent?: WorkspaceParentItem;
  public?: boolean;
}

export type IEntcoreWorkspaceDocument = {
  _id: string;
  name: string;
  metadata: {
    'name': 'file';
    'filename': string;
    'content-type': string;
    'content-transfer-encoding': string;
    'charset': 'UTF-8';
    'size': number;
  };
  deleted: boolean;
  eParent: string | null;
  eType: 'file';
  file: string;
  shared: [];
  inheritedShares: [];
  created: string;
  modified: string;
  owner: string;
  ownerName: string;
  thumbnails: { [id: string]: string };
  public?: boolean;
};

export type IEntcoreWorkspaceFolder = {
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

type IEntcoreWorkspaceFile = IEntcoreWorkspaceDocument | IEntcoreWorkspaceFolder;
export type IEntcoreWorkspaceFileList = IEntcoreWorkspaceFile[];
