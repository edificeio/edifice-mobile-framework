/**
 * Conversation Reducer
 */
import { Reducers } from '~/app/store';
import { createSessionReducer } from '~/framework/util/redux/reducerFactory';
import { createInitialState } from '~/infra/redux/async2';

import moduleConfig from './module-config';
import { ICountListState, initialState as initialCountListState } from './state/count';
import { IFolderListState, initialState as initialFolderListState } from './state/folders';
import { IInitMailState, initialState as initialInitMailState } from './state/initMails';
import { IMailContentState, initialState as initialMailContentState } from './state/mailContent';
import { IMailListState, initialState as initialMailListState } from './state/mailList';
import { ISignatureState, initialState as initialSignatureState } from './state/signature';

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

const initialState: IConversationState = {
  count: createInitialState(initialCountListState),
  folders: createInitialState(initialFolderListState),
  init: createInitialState(initialInitMailState),
  mailContent: createInitialState(initialMailContentState),
  mailList: createInitialState(initialMailListState),
  signature: createInitialState(initialSignatureState),
};

const reducer = createSessionReducer(initialState, {
  // Add reducer functions here or use reducer tools
});
Reducers.register(moduleConfig.reducerName, reducer);
export default reducer;
