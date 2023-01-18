import { IGlobalState, Reducers } from '~/app/store';
import createReducer from '~/framework/util/redux/reducerFactory';

import { {{moduleName | toCamelCase | capitalize}}Data } from '../model';
import moduleConfig from '../moduleConfig';

// State type

// @scaffolder : empty this interface, replace it by your own
export interface {{moduleName | toCamelCase | capitalize}}State extends {{moduleName | toCamelCase | capitalize}}Data {
  fruit: string;
}

// Initial state value

// @scaffolder : empty this exemple initialState, replace it by your own
export const initialState: {{moduleName | toCamelCase | capitalize}}State = {
  id: 'abcdef',
  fruit: 'Physalis',
};

// Actions definitions

// @scaffolder : empty this exemple actionType, replace it by your own
export const actionTypes = {
  setFruit: moduleConfig.namespaceActionType('FRUIT_SET'),
};

// @scaffolder : empty this exemple action payload, replace it by your own
export interface ActionPayloads {
  setFruit: Pick<{{moduleName | toCamelCase | capitalize}}State, 'fruit'>;
}

// @scaffolder : empty this exemple action creator, replace it by your own
export const actions = {
  setFruit: (fruit: string) => ({ type: actionTypes.setFruit, fruit }),
};

// Reducer

// @scaffolder : empty this exemple reducing function, replace it by your own
const reducer = createReducer(initialState, {
  [actionTypes.setFruit]: (state, action) => {
    const { fruit }: ActionPayloads['setFruit'] = action as any;
    return { ...state, fruit };
  },
});

// State getters

export const getState = (state: IGlobalState) => state[moduleConfig.reducerName] as {{moduleName | toCamelCase | capitalize}}State;
export const getFruit = (state: IGlobalState) => getState(state).fruit; // @scaffolder : remove this example

// Register the reducer

Reducers.register(moduleConfig.reducerName, reducer);
export default reducer;
