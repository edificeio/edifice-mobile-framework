import { IGlobalState, Reducers } from '~/app/store';
import createReducer from '~/framework/util/redux/reducerFactory';

import { {{moduleName | toCamelCase | capitalize}}Data } from '../model';
import moduleConfig from '../moduleConfig';

// State type

export interface {{moduleName | toCamelCase | capitalize}}State extends {{moduleName | toCamelCase | capitalize}}Data {
  fruit: string;
}

// Initial state value

export const initialState: {{moduleName | toCamelCase | capitalize}}State = {
  id: 'abcdef',
  fruit: 'Physalis',
};

// Actions definitions

export const actionTypes = {
  setFruit: moduleConfig.namespaceActionType('FRUIT_SET'),
  // @scaffolder : add action types here
};

export interface IActionPayloads {
  setFruit: Pick<{{moduleName | toCamelCase | capitalize}}State, 'fruit'>;
  // @scaffolder : add action payload types here
}

export const actions = {
  setFruit: (fruit: string) => ({ type: actionTypes.setFruit, fruit }),
  // @scaffolder : add action creators here
};

// Reducer

const reducer = createReducer(initialState, {
  [actionTypes.setFruit]: (state, action) => {
    const { fruit }: IActionPayloads['setFruit'] = action as any;
    return { ...state, fruit };
  },
  // @scaffolder : add reducing functions here
});

// State getters

export const getState = (state: IGlobalState) => state[moduleConfig.reducerName] as {{moduleName | toCamelCase | capitalize}}State;
export const getFruit = (state: IGlobalState) => getState(state).fruit;

// Register the reducer

Reducers.register(moduleConfig.reducerName, reducer);
export default reducer;
