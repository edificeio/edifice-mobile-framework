import moment from 'moment';

import mailConfig from '~/framework/modules/conversation/module-config';
import { IDistantFile } from '~/framework/util/fileHandler';
import { AsyncState, createAsyncActionTypes } from '~/infra/redux/async2';

// THE MODEL --------------------------------------------------------------------------------------

export interface IMail {
  id: string;
  date: moment.Moment;
  state: string;
  from: string;
  to: [];
  cc: [];
  cci: [];
  displayNames: [];
  attachments: IDistantFile[];
  subject: string;
  body: string;
  parent_id: string;
  thread_id: string;
  // Extra data
  fromName: string;
  toName: string;
  ccName: string;
  language: string;
  text_searchable: string;
  cciName: string;
}

export type IMailContent = IMail[];

// THE STATE --------------------------------------------------------------------------------------

export type IMailContentState = AsyncState<IMailContent>;

export const initialState: IMailContent = [];

export const getMailContentState = (globalState: any) => mailConfig.getState(globalState).mailContent as IMailContentState;

// THE ACTION TYPES -------------------------------------------------------------------------------

export const actionTypes = createAsyncActionTypes(mailConfig.namespaceActionType('MAIL_CONTENT'));
