/* eslint-disable flowtype/no-types-missing-file-annotation */
import { createAsyncActionTypes, AsyncState } from "../../infra/redux/async2";
import mailConfig from "../config";

// THE MODEL --------------------------------------------------------------------------------------

export type IFolder = {
  id: string;
  folderName: string;
  path: string;
  unread: number;
  count: number;
  folders: any[];
};

export type IQuota = {
  storage: number;
  quota: string;
};

export interface IInitMail {
  quota: IQuota;
  signature: {
    prefered: boolean;
    id: string;
    content: string;
  };
  folders: IFolder[];
}

// THE STATE --------------------------------------------------------------------------------------

export const initialState: IInitMail = {
  quota: {
    storage: 0,
    quota: "",
  },
  signature: {
    prefered: false,
    id: "",
    content: "",
  },
  folders: [
    {
      id: "",
      folderName: "",
      path: "",
      unread: 0,
      count: 0,
      folders: [],
    },
  ],
};

export type IInitMailState = AsyncState<IInitMail>;

export const getInitMailListState = (globalState: any) =>
  mailConfig.getLocalState(globalState).init as IInitMailState;

// THE ACTION TYPES -------------------------------------------------------------------------------

export const actionTypes = createAsyncActionTypes(mailConfig.createActionType("INIT_MAIL_LIST"));
