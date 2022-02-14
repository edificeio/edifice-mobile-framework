/**
 * Notification list actions
 * Build actions to be dispatched to the notification list reducer.
 */

import { Dispatch } from 'redux';

import { createAsyncActionCreators } from '~/infra/redux/async2';
import { sessionsService } from '~/modules/viescolaire/cdt/services/sessions';
import { actionTypes, ISessionList } from '~/modules/viescolaire/cdt/state/sessions';

// ACTION LIST ------------------------------------------------------------------------------------

export const dataActions = createAsyncActionCreators<ISessionList>(actionTypes);

// THUNKS -----------------------------------------------------------------------------------------

export function fetchSessionListAction(structureId: string, startDate: string, endDate: string) {
  return async (dispatch: Dispatch) => {
    try {
      dispatch(dataActions.request());
      const data = await sessionsService.get(structureId, startDate, endDate);
      dispatch(dataActions.receipt(data));
    } catch (errmsg) {
      dispatch(dataActions.error(errmsg));
    }
  };
}

export function fetchChildSessionAction(childId: string, startDate: string, endDate: string) {
  return async (dispatch: Dispatch) => {
    try {
      dispatch(dataActions.request());
      const data = await sessionsService.getFromChildId(childId, startDate, endDate);
      dispatch(dataActions.receipt(data));
    } catch (errmsg) {
      dispatch(dataActions.error(errmsg));
    }
  };
}
