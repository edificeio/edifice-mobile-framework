/**
 * Support Reducer
 */
import { combineReducers } from 'redux';

import moduleConfigWorkspace from '~/framework/modules/workspace/module-config';
import { createAsyncActionTypes, createSessionAsyncReducer } from '~/framework/util/redux/async';

// State
export interface ISupportState {}

// Reducer
export const actionTypes = {
  postTicket: createAsyncActionTypes(moduleConfigWorkspace.namespaceActionType('POST_TICKET')),
};

const reducer = combineReducers({
  ticket: createSessionAsyncReducer(undefined, actionTypes.postTicket),
});
export default reducer;
