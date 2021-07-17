/* eslint-disable flowtype/no-types-missing-file-annotation */
import { createAsyncActionTypes, AsyncState } from "../../../infra/redux/async2";
import mailConfig from "../moduleConfig";

// THE MODEL --------------------------------------------------------------------------------------

export type IFolder = {
  id: string;
  folderName: string;
  path: string;
  unread: number;
  count: number;
  folders: any[];
  // Extra data
  parent_id: string;
  user_id: string;
  depth: number;
  trashed: boolean;
};

export interface IInitMail {
  folders: IFolder[];
}

// THE STATE --------------------------------------------------------------------------------------

export const initialState: IInitMail = {
  folders: [
    {
      id: "",
      folderName: "",
      path: "",
      unread: 0,
      count: 0,
      folders: [],
      parent_id: "",
      user_id: "",
      depth: 0,
      trashed: false,
    },
  ],
};

export type IInitMailState = AsyncState<IInitMail>;

export const getInitMailListState = (globalState: any) =>
  mailConfig.getState(globalState).init as IInitMailState;

// THE ACTION TYPES -------------------------------------------------------------------------------

export const actionTypes = createAsyncActionTypes(mailConfig.namespaceActionType("INIT_MAIL_LIST"));
