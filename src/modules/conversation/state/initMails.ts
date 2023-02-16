import { AsyncState, createAsyncActionTypes } from '~/infra/redux/async2';
import mailConfig from '~/modules/conversation/moduleConfig';

// THE MODEL --------------------------------------------------------------------------------------

export type IFolder = {
  id: string;
  folderName: string;
  unread: number;
  folders: any[];
  // Extra data
  parent_id: string;
  user_id: string;
  depth: number;
  trashed: boolean;
  skip_uniq: boolean;
};

export interface IInitMail {
  folders: IFolder[];
}

// THE STATE --------------------------------------------------------------------------------------

export const initialState: IInitMail = {
  folders: [
    {
      id: '',
      folderName: '',
      unread: 0,
      folders: [],
      parent_id: '',
      user_id: '',
      depth: 0,
      trashed: false,
      skip_uniq: false,
    },
  ],
};

export type IInitMailState = AsyncState<IInitMail>;

export const getInitMailListState = (globalState: any) => mailConfig.getState(globalState).init as IInitMailState;

// THE ACTION TYPES -------------------------------------------------------------------------------

export const actionTypes = createAsyncActionTypes(mailConfig.namespaceActionType('INIT_MAIL_LIST'));
