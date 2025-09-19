/**
 * Homework assistance Reducer
 */
import { combineReducers } from 'redux';

import { Reducers } from '~/app/store';
import { ModuleParameters, Resource, Service } from '~/framework/modules/homework-assistance/model';
import moduleConfig from '~/framework/modules/homework-assistance/module-config';
import { AsyncState, createAsyncActionTypes, createSessionAsyncReducer } from '~/framework/util/redux/async';

export interface IHomeworkAssistanceReduxState {
  parameters: AsyncState<ModuleParameters | undefined>;
  resources: AsyncState<Resource[]>;
  services: AsyncState<Service[]>;
}

interface IHomeworkAssistanceReduxStateData {
  parameters?: ModuleParameters;
  resources: Resource[];
  services: Service[];
}

const initialState: IHomeworkAssistanceReduxStateData = {
  resources: [],
  services: [],
};

export const actionTypes = {
  parameters: createAsyncActionTypes(moduleConfig.namespaceActionType('PARAMETERS')),
  resources: createAsyncActionTypes(moduleConfig.namespaceActionType('RESOURCES')),
  services: createAsyncActionTypes(moduleConfig.namespaceActionType('SERVICES')),
};

const reducer = combineReducers({
  parameters: createSessionAsyncReducer(initialState.parameters, actionTypes.parameters),
  resources: createSessionAsyncReducer(initialState.resources, actionTypes.resources),
  services: createSessionAsyncReducer(initialState.services, actionTypes.services),
});
Reducers.register(moduleConfig.reducerName, reducer);
export default reducer;
