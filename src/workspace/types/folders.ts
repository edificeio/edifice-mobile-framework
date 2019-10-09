import { IArrayById } from "../../infra/collections";

export enum FiltersEnum {
  owner = "owner",
  shared = "shared",
  protected = "protected",
  trash = "trash",
}

export type IFoldersParameters = {
  filter: FiltersEnum;
  parentId: string;
};

export type IWorkspaceBackendFolder = {
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
  inheritedShares: [];
  parents: [];
};

export type IWorkspaceBackendFolderArray = Array<IWorkspaceBackendFolder>;

export type IWorkspacePersonalFolder = {
  owner: string;
  ownerName: string;
} & IWorkspaceFolder;

export type IWorkspaceRootFolder = {
  id: FiltersEnum,
} & IWorkspaceFolder

export type IWorkspaceFolder = {
  id: string,
  name: string
}

export type IWorkspaceFolderArray = IArrayById<IWorkspaceFolder>;
