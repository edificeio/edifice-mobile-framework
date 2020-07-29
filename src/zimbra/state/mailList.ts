/* eslint-disable flowtype/no-types-missing-file-annotation */
import moment from "moment";

import { createAsyncActionTypes, AsyncState } from "../../infra/redux/async2";
import mailConfig from "../config";

// THE MODEL --------------------------------------------------------------------------------------

export interface IMail {
  id: string;
  date: moment.Moment;
  subject: string;
  parent_id: string;
  thread_id: string;
  state: string;
  unread: boolean;
  response: boolean;
  hasAttachment: boolean;
  systemFolder: string;
  to: [];
  cc: [];
  bcc: [];
  displayNames: [];
  attachments: [];
  from: string;
}

export type IMailList = IMail[];

// THE STATE --------------------------------------------------------------------------------------

export type IMailListState = AsyncState<IMailList>;

export const initialState: IMailList = [];

export const getMailListState = (globalState: any) => mailConfig.getLocalState(globalState).mailList as IMailListState;

// THE ACTION TYPES -------------------------------------------------------------------------------

export const actionTypes = createAsyncActionTypes(mailConfig.createActionType("MAIL_LIST"));
