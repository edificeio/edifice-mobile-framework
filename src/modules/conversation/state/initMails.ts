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
    },
  ],
};

export type IInitMailState = AsyncState<IInitMail>;

export const getInitMailListState = (globalState: any) =>
  mailConfig.getState(globalState).init as IInitMailState;

// THE ACTION TYPES -------------------------------------------------------------------------------

export const actionTypes = createAsyncActionTypes(mailConfig.namespaceActionType("INIT_MAIL_LIST"));
