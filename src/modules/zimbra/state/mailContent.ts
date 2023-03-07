import moment from 'moment';

import { IDistantFile } from '~/framework/util/fileHandler';
import { AsyncState, createAsyncActionTypes } from '~/infra/redux/async2';
import mailConfig from '~/modules/zimbra/moduleConfig';

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
  hasAttachment: boolean;
  attachments: IDistantFile[];
  subject: string;
  body: string;
  response: boolean;
  systemFolder: string;
  parent_id: string;
  thread_id: string;
}

// THE STATE --------------------------------------------------------------------------------------

export type IMailContentState = AsyncState<IMail>;

export const initialState = [];

export const getMailContentState = (globalState: any) => mailConfig.getState(globalState).mailContent as IMailContentState;

// THE ACTION TYPES -------------------------------------------------------------------------------

export const actionTypes = createAsyncActionTypes(mailConfig.namespaceActionType('MAIL_CONTENT'));
