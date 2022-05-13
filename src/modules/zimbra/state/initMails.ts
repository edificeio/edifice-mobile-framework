import { AsyncState, createAsyncActionTypes } from '~/infra/redux/async2';
import mailConfig from '~/modules/zimbra/moduleConfig';

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
    quota: '',
  },
  signature: {
    prefered: false,
    id: '',
    content: '',
  },
  folders: [
    {
      id: '',
      folderName: '',
      path: '',
      unread: 0,
      count: 0,
      folders: [],
    },
  ],
};

export type IInitMailState = AsyncState<IInitMail>;

export const getInitMailListState = (globalState: any) => mailConfig.getState(globalState).init as IInitMailState;

// THE ACTION TYPES -------------------------------------------------------------------------------

export const actionTypes = createAsyncActionTypes(mailConfig.namespaceActionType('INIT_MAIL_LIST'));
