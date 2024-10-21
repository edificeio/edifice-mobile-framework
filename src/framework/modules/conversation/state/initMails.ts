import mailConfig from '~/framework/modules/conversation/module-config';
import { AsyncState, createAsyncActionTypes } from '~/infra/redux/async2';

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
      depth: 0,
      folderName: '',
      folders: [],
      id: '',
      parent_id: '',
      skip_uniq: false,
      trashed: false,
      unread: 0,
      user_id: '',
    },
  ],
};

export type IInitMailState = AsyncState<IInitMail>;

export const getInitMailListState = (globalState: any) => mailConfig.getState(globalState).init as IInitMailState;

// THE ACTION TYPES -------------------------------------------------------------------------------

export const actionTypes = createAsyncActionTypes(mailConfig.namespaceActionType('INIT_MAIL_LIST'));
