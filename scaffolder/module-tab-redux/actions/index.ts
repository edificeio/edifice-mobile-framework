/**
 * Thunk actions for module {{moduleName | toCamelCase}}
 */
import { ThunkDispatch } from 'redux-thunk';

import { IGlobalState } from '~/app/store';
import { actions } from '~/framework/modules/{{moduleName}}/reducer';

export function addValueAction() {
  return async function (dispatch: ThunkDispatch<any, any, any>, getState: () => IGlobalState): Promise<void> {
    // Just do something here.
    // Thunk actions can throw errors. Calls like tryAction() // handleAction() will handle exceptions at a higher level.
    dispatch(actions.addValue(Math.floor(Math.random() * 6) % 6));
  };
}
