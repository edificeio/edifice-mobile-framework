/* eslint-disable flowtype/no-types-missing-file-annotation */
import moment from "moment";

import { createAsyncActionTypes, AsyncState } from "../../../infra/redux/async2";
import mailConfig from "../moduleConfig";

// THE MODEL --------------------------------------------------------------------------------------

export interface IMail {
  id: string;
  date: moment.Moment;
  state: string;
  unread: boolean;
  from: string;
  to: [];
  cc: [];
  bcc: [];
  displayNames: [];
  attachments: [];
  subject: string;
  body: string;
  systemFolder: string;
  parent_id: string;
  thread_id: string;
  fromName: string;
  toName: string;
  ccName: string;
  language: string;
  text_searchable: string;
  cci: [];
  cciName: string
}

export type IMailContent = IMail[];

// THE STATE --------------------------------------------------------------------------------------

export type IMailContentState = AsyncState<IMailContent>;

export const initialState: IMailContent = [];

export const getMailContentState = (globalState: any) =>
  mailConfig.getState(globalState).mailContent as IMailContentState;

// THE ACTION TYPES -------------------------------------------------------------------------------

export const actionTypes = createAsyncActionTypes(mailConfig.namespaceActionType("MAIL_CONTENT"));
