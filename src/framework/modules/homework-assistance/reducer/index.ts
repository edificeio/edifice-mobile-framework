/**
 * Homework assistance Reducer
 */
import { combineReducers } from 'redux';

import { Reducers } from '~/app/store';
import { Config, Resource, Service } from '~/framework/modules/homework-assistance/model';
import moduleConfig from '~/framework/modules/homework-assistance/module-config';
import { AsyncState, createAsyncActionTypes, createSessionAsyncReducer } from '~/framework/util/redux/async';

export interface IHomeworkAssistanceReduxState {
  config: AsyncState<Config | undefined>;
  resources: AsyncState<Resource[]>;
  services: AsyncState<Service[]>;
}

interface IHomeworkAssistanceReduxStateData {
  config?: Config;
  resources: Resource[];
  services: Service[];
}

const initialState: IHomeworkAssistanceReduxStateData = {
  resources: [],
  services: [],
};

export const actionTypes = {
  config: createAsyncActionTypes(moduleConfig.namespaceActionType('CONFIG')),
  resources: createAsyncActionTypes(moduleConfig.namespaceActionType('RESOURCES')),
  services: createAsyncActionTypes(moduleConfig.namespaceActionType('SERVICES')),
};

const reducer = combineReducers({
  config: createSessionAsyncReducer(initialState.config, actionTypes.config),
  resources: createSessionAsyncReducer(initialState.resources, actionTypes.resources),
  services: createSessionAsyncReducer(initialState.services, actionTypes.services),
});
Reducers.register(moduleConfig.reducerName, reducer);
export default reducer;
