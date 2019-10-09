import { IArrayById } from "../../infra/collections";

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