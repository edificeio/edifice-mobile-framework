/**
 * # Reducer Factory
 *
 * Instead of creating switch/case reducers, this tool make easy to create key-based reducers
 * that can be assembled without add extra depth.
 */
import { AnyAction, Reducer } from 'redux';

import { endSessionActionType } from './state';

export interface IReducerActionsHandlerMap<StateType> {
  [actionType: string]: (state: StateType, action: AnyAction) => StateType;
}

export default function createReducer<StateType>(
  initialState: StateType,
  reducerActionsHandlerMap: IReducerActionsHandlerMap<StateType>,
): Reducer<StateType, AnyAction> {
  return (state: StateType = initialState, action: AnyAction = { type: undefined }) => {
    return reducerActionsHandlerMap[action.type] ? reducerActionsHandlerMap[action.type](state, action) : state;
  };
}

export const createEndSessionActionType = (sessionNameUppercase: string = 'SESSION') =>
  endSessionActionType + '_' + sessionNameUppercase;

/**
 * Work as equal as reducerFactory, but can handle a special action type that reset data.
 * You can create multiple sessions that can be flushed independen
 */
export function createSessionReducer<StateType>(
  initialState: StateType,
  reducerActionsHandlerMap: IReducerActionsHandlerMap<StateType>,
  sessionNamesUppercase: string[] = ['SESSION'],
): Reducer<StateType, AnyAction> {
  const sessionActions = {};
  for (const sessionName of sessionNamesUppercase) {
    sessionActions[createEndSessionActionType(sessionName)] = () => initialState;
  }
  return createReducer(initialState, {
    ...reducerActionsHandlerMap,
    ...sessionActions,
  });
}

export const createEndSessionAction = (sessionNameUppercase?: string) => ({
  type: createEndSessionActionType(sessionNameUppercase),
});
