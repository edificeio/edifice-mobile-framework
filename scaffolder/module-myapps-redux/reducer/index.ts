import { IGlobalState, Reducers } from '~/app/store';
import { {{moduleName | toCamelCase | capitalize}}Data } from '~/framework/modules/{{moduleName}}/model';
import moduleConfig from '~/framework/modules/{{moduleName}}/module-config';
import createSessionReducer from '~/framework/util/redux/reducerFactory';

// State type

export interface {{moduleName | toCamelCase | capitalize}}State extends {{moduleName | toCamelCase | capitalize}}Data {
  // Add here any value that are not related to the data model, but need to be kept into the state
  basicValue: number;
}

// Initial state value

export const initialState: {{moduleName | toCamelCase | capitalize}}State = {
  basicValue: 0,
};

// Actions definitions

export const actionTypes = {
  // names for actions of this reducer. the verb at the end.
  addValue: moduleConfig.namespaceActionType('VALUE_ADD'),
};

export interface ActionPayloads {
  // Payload defiition for the actions. Same keys as `actionTypes`.
  addValue: { count: number };
}

export const actions = {
  // Action creators. Same keys as `actionTypes`.
  addValue: (count: number) => ({ type: actionTypes.addValue, count }),
};

// Reducer

// You can use createReducer if you do not need to clean this reducer on logout
const reducer = createSessionReducer(initialState, {
  // Reducer functions
  [actionTypes.addValue]: (state, action) => {
    const { count }: ActionPayloads['addValue'] = action as any;
    return { ...state, basicValue: state.basicValue + count };
  },
});

// State getters

export const getState = (state: IGlobalState) => state[moduleConfig.reducerName] as {{moduleName | toCamelCase | capitalize}}State;

// Add here every getter you'll need.
export const getBasicValue = (state: IGlobalState) => getState(state).basicValue;

// Register the reducer

Reducers.register(moduleConfig.reducerName, reducer);
export default reducer;
