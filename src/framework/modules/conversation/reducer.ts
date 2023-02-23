/**
 * Conversation Reducer
 */
import { Reducers } from '~/app/store';
import { createSessionReducer } from '~/framework/util/redux/reducerFactory';

import moduleConfig from './module-config';
import { ICountListState } from './state/count';
import { IFolderListState } from './state/folders';
import { IInitMailState } from './state/initMails';
import { IMailContentState } from './state/mailContent';
import { IMailListState } from './state/mailList';
import { ISignatureState } from './state/signature';

// Types

// State

export interface IConversationState {
  count: ICountListState;
  folders: IFolderListState;
  init: IInitMailState;
  mailContent: IMailContentState;
  mailList: IMailListState;
  signature: ISignatureState;
}

// Reducer

const initialState: IConversationState = {};

const reducer = createSessionReducer(initialState, {
  // Add reducer functions here or use reducer tools
});
Reducers.register(moduleConfig.reducerName, reducer);
export default reducer;
