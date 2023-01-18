/**
 * Thunk actions for module {{moduleName | toCamelCase}}
 */
import { ThunkDispatch } from 'redux-thunk';

import { IGlobalState } from '~/AppStore';

import { actions } from '../reducer';

export function setFruitAction(fruit: string) {
  return async function (dispatch: ThunkDispatch<any, any, any>, getState: () => IGlobalState): Promise<void> {
    // Just do something here.
    // Thunk actions can throw errors. Calls like tryAction() will handle exceptions at a higher level.
    dispatch(actions.setFruit(fruit));
  };
}
