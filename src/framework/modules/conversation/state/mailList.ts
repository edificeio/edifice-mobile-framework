import moment from 'moment';

import mailConfig from '~/framework/modules/conversation/module-config';
import { AsyncState, createAsyncActionTypes } from '~/infra/redux/async2';

// THE MODEL --------------------------------------------------------------------------------------

export interface IMail {
  id: string;
  date: moment.Moment;
  subject: string;
  state: string;
  unread: boolean;
  response: boolean;
  hasAttachment: boolean;
  to: [];
  cc: [];
  displayNames: [];
  from: string;
  // Extra data
  fromName: null;
  toName: null;
  ccName: null;
  cci: [];
  cciName: [];
  count: number;
}

export type IMailList = IMail[];

// THE STATE --------------------------------------------------------------------------------------

export type IMailListState = AsyncState<IMailList>;

export const initialState: IMailList = [];

export const getMailListState = (globalState: any) => mailConfig.getState(globalState).mailList as IMailListState;

// THE ACTION TYPES -------------------------------------------------------------------------------

export const actionTypes = createAsyncActionTypes(mailConfig.namespaceActionType('MAIL_LIST'));
