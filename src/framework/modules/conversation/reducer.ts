/**
 * Conversation Reducer
 */
import { combineReducers } from 'redux';

import { Reducers } from '~/app/store';
import { createSessionAsyncReducer } from '~/framework/util/redux/async';
import { createAsyncActionTypes, createInitialState } from '~/infra/redux/async2';

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

export const actionTypes = {
  count: createAsyncActionTypes(moduleConfig.namespaceActionType('COUNT_LIST')),
  folders: createAsyncActionTypes(moduleConfig.namespaceActionType('FOLDERS_LIST')),
  init: createAsyncActionTypes(moduleConfig.namespaceActionType('INIT_MAIL_LIST')),
  mailContent: createAsyncActionTypes(moduleConfig.namespaceActionType('MAIL_CONTENT')),
  mailList: createAsyncActionTypes(moduleConfig.namespaceActionType('MAIL_LIST')),
  signature: createAsyncActionTypes(moduleConfig.namespaceActionType('SIGNATURE')),
};

const reducer = combineReducers({
  count: createSessionAsyncReducer(initialState.count, actionTypes.count),
  folders: createSessionAsyncReducer(initialState.folders, actionTypes.folders),
  init: createSessionAsyncReducer(initialState.init, actionTypes.init),
  mailContent: createSessionAsyncReducer(initialState.mailContent, actionTypes.mailContent),
  mailList: createSessionAsyncReducer(initialState.mailList, actionTypes.mailList),
  signature: createSessionAsyncReducer(initialState.signature, actionTypes.signature),
});
Reducers.register(moduleConfig.reducerName, reducer);
export default reducer;
