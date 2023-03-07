/**
 * Support Reducer
 */
import { combineReducers } from 'redux';

import { createAsyncActionTypes, createSessionAsyncReducer } from '~/framework/util/redux/async';
import moduleConfig from '~/modules/workspace/moduleConfig';

// State

interface ISupport_StateData {}

export interface ISupport_State {}

// Reducer

export const actionTypes = {
  postTicket: createAsyncActionTypes(moduleConfig.namespaceActionType('POST_TICKET')),
};

export default combineReducers({
  ticket: createSessionAsyncReducer(undefined, actionTypes.postTicket),
});
