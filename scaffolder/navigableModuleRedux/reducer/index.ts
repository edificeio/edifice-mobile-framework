import { IGlobalState, Reducers } from '~/app/store';
import createReducer from '~/framework/util/redux/reducerFactory';

import { {{moduleName | toCamelCase | capitalize}}Data } from '../model';
import moduleConfig from '../module-config';

// State type

// @scaffolder : empty this interface, replace it by your own
// @scaffolder : place here only values that are not related to the abstract data model defined in model/index.ts.
export interface {{moduleName | toCamelCase | capitalize}}State extends {{moduleName | toCamelCase | capitalize}}Data {
  nbUpdates: number;
}

// Initial state value

export const initialState: {{moduleName | toCamelCase | capitalize}}State = {
  // @scaffolder : empty this exemple initialState, replace it by your own
  fruit: 'Physalis',
  nbUpdates: 0,
};

// Actions definitions

export const actionTypes = {
  // @scaffolder : empty this exemple actionType, replace it by your own
  setFruit: moduleConfig.namespaceActionType('FRUIT_SET'),
};

export interface ActionPayloads {
  // @scaffolder : empty this exemple action payload, replace it by your own
  setFruit: Pick<{{moduleName | toCamelCase | capitalize}}State, 'fruit'>;
}

export const actions = {
  // @scaffolder : empty this exemple action creator, replace it by your own
  setFruit: (fruit: string) => ({ type: actionTypes.setFruit, fruit }),
};

// Reducer

const reducer = createReducer(initialState, {
  // @scaffolder : empty this exemple reducing function, add by your own
  [actionTypes.setFruit]: (state, action) => {
    const { fruit }: ActionPayloads['setFruit'] = action as any;
    return { ...state, fruit, nbUpdates: state.nbUpdates + 1 };
  },
});

// State getters

export const getState = (state: IGlobalState) => state[moduleConfig.reducerName] as {{moduleName | toCamelCase | capitalize}}State;
export const getFruit = (state: IGlobalState) => getState(state).fruit; // @scaffolder : remove this example
export const getNbUpdates = (state: IGlobalState) => getState(state).nbUpdates; // @scaffolder : remove this example

// Register the reducer

Reducers.register(moduleConfig.reducerName, reducer);
export default reducer;
