/**
 * # Reducer Factory
 *
 * Instead of creating switch/case reducers, this tool make easy to create key-based reducers
 * that can be assembled without add extra depth.
 */
import { Action, Reducer } from 'redux';

import { endSessionActionType } from './state';

export interface IReducerActionsHandlerMap<StateType, ActionType extends Action = Action> {
  [actionType: string]: (state: StateType, action: ActionType) => StateType;
}

export default function createReducer<StateType, ActionType extends Action = Action>(
  initialState: StateType,
  reducerActionsHandlerMap: IReducerActionsHandlerMap<StateType, ActionType>,
): Reducer<StateType, ActionType> {
  return (state: StateType = initialState, action: ActionType) => {
    return reducerActionsHandlerMap[action.type] ? reducerActionsHandlerMap[action.type](state, action) : state;
  };
}

export const createEndSessionActionType = (sessionNameUppercase: string = 'SESSION') =>
  endSessionActionType + '_' + sessionNameUppercase;

/**
 * Work as equal as reducerFactory, but can handle a special action type that reset data.
 * You can create multiple sessions that can be flushed independen
 */
export function createSessionReducer<StateType, ActionType extends Action = Action>(
  initialState: StateType,
  reducerActionsHandlerMap: IReducerActionsHandlerMap<StateType, ActionType>,
  sessionNamesUppercase: string[] = ['SESSION'],
): Reducer<StateType, ActionType> {
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
