import rootReducer from "../reducers";
import { NavigationScreenProp } from "react-navigation";
import { IArrayById } from "../../infra/collections";

export interface IFolder {
  id: string;
  name: string;
}

export interface IFile {
  id: string;
  name: string;
}

export interface IState {
  directories: IFolder[];
  files: IFile[];
}

export interface IDataProps extends IState {
}

export interface IActionProps {
  fetchWorkspaceList: any;
}

export interface IEventProps {
    dispatch: any
    fetchWorkspaceList: any
}

export interface IOtherProps {
  navigation?: NavigationScreenProp<{}>;
}

export type IProps = IDataProps & IEventProps & IOtherProps;

export type Reducer = ReturnType<typeof rootReducer>;

export type IWorkspaceBackendDocument = {
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
  thumbnails: {
    [id: string]: string;
  };
};

export type IWorkspaceBackendDocumentArray = Array<IWorkspaceBackendDocument>;

export type IWorkspaceDocument = {
  id: string;
  name: string;
  owner: string;
  ownerName: string;
};

export type IWorkspaceDocumentArray = IArrayById<IWorkspaceDocument>;

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

export type IWorkspaceBackendFolderArray = Array<IWorkspaceBackendDocument>;

export type IWorkspaceFolder = {
  id: string;
  name: string;
  owner: string;
  ownerName: string;
};

export type IWorkspaceFolderArray = IArrayById<IWorkspaceFolder>;
