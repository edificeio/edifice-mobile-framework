import { Dispatch } from 'redux';

import { createAsyncActionCreators } from '~/infra/redux/async2';

import { IChildArray } from '../../viesco/state/children';
import { relativesNotificationService } from '../services/relativesNotificationModal';
import { IChildEventsNotification, actionTypes } from '../state/relativesNotificationModal';

export const dataActions = createAsyncActionCreators<IChildEventsNotification>(actionTypes);

export function fetchChildrenEventsAction(
  childrenArray: IChildArray,
  structureId: string,
  startDate: moment.Moment,
  endDate: moment.Moment,
) {
  return async (dispatch: Dispatch) => {
    try {
      dispatch(dataActions.clear());
      dispatch(dataActions.request());
      const data = await relativesNotificationService.fetchChildrenEvents(childrenArray, structureId, startDate, endDate);
      dispatch(dataActions.receipt(data));
    } catch (errmsg) {
      dispatch(dataActions.error(errmsg));
    }
  };
}
