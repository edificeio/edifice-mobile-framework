/**
 * Homework assistance Reducer
 */
import { combineReducers } from 'redux';

import { Reducers } from '~/app/store';
import { HomeworkAssistanceData } from '~/framework/modules/homework-assistance/model';
import moduleConfig from '~/framework/modules/homework-assistance/module-config';
import { createAsyncActionTypes, createSessionAsyncReducer } from '~/framework/util/redux/async';

const initialState: HomeworkAssistanceData = {
  services: [],
};

export const actionTypes = {
  config: createAsyncActionTypes(moduleConfig.namespaceActionType('CONFIG')),
  services: createAsyncActionTypes(moduleConfig.namespaceActionType('SERVICES')),
};

const reducer = combineReducers({
  config: createSessionAsyncReducer(initialState.config, actionTypes.config),
  services: createSessionAsyncReducer(initialState.services, actionTypes.services),
});
Reducers.register(moduleConfig.reducerName, reducer);
export default reducer;
