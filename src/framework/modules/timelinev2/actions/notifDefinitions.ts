import { Dispatch } from 'redux';

import {
  computeNotificationFilterList,
  getAuthorizedNotificationFilterList,
} from '~/framework/modules/timelinev2/reducer/notifDefinitions';
import { actions as notifFiltersAsyncActions } from '~/framework/modules/timelinev2/reducer/notifDefinitions/notifFilters';
import { actions as notifTypesAsyncActions } from '~/framework/modules/timelinev2/reducer/notifDefinitions/notifTypes';
import { notifFiltersService, registeredNotificationsService } from '~/framework/modules/timelinev2/service';

import { assertSession } from '../../auth/reducer';

export const loadNotificationsDefinitionsAction = () => async (dispatch: Dispatch, getState: () => any) => {
  try {
    const session = assertSession();
    // 1. Fetch notif filters from backend
    dispatch(notifFiltersAsyncActions.request());
    const filters = await notifFiltersService.list(session);
    // 1a. Fetch notif types from backend
    try {
      dispatch(notifTypesAsyncActions.request());
      var notificationTypes = await registeredNotificationsService.list(session);
      dispatch(notifTypesAsyncActions.receipt(notificationTypes));
    } catch (e) {
      dispatch(notifTypesAsyncActions.error(e));
      throw e;
    }
    // 1b. Filter notif filters (That sounds odd...) + get app info
    let detailedFilters = computeNotificationFilterList(filters, notificationTypes);
    // 1c. Keep only userauthorized filters
    detailedFilters = getAuthorizedNotificationFilterList(detailedFilters, session.apps);
    // 2. Validate data
    dispatch(notifFiltersAsyncActions.receipt(detailedFilters));
  } catch (e) {
    console.error(e);
    dispatch(notifFiltersAsyncActions.error(e));
  }
};
