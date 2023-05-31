import { Dispatch } from 'redux';

import { assertSession } from '~/framework/modules/auth/reducer';
import {
  computeNotificationFilterList,
  getAuthorizedNotificationFilterList,
} from '~/framework/modules/timeline/reducer/notif-definitions';
import { actions as notifFiltersAsyncActions } from '~/framework/modules/timeline/reducer/notif-definitions/notif-filters';
import { actions as notifTypesAsyncActions } from '~/framework/modules/timeline/reducer/notif-definitions/notif-types';
import { notifFiltersService, registeredNotificationsService } from '~/framework/modules/timeline/service';

export const loadNotificationsDefinitionsAction = () => async (dispatch: Dispatch, getState: () => any) => {
  try {
    const session = assertSession();
    // 1. Fetch notif filters from backend
    dispatch(notifFiltersAsyncActions.request());
    const filters = await notifFiltersService.list(session);
    // 1a. Fetch notif types from backend
    let notificationTypes;
    try {
      dispatch(notifTypesAsyncActions.request());
      notificationTypes = await registeredNotificationsService.list(session);
      dispatch(notifTypesAsyncActions.receipt(notificationTypes));
    } catch (e) {
      dispatch(notifTypesAsyncActions.error(e as Error));
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
    dispatch(notifFiltersAsyncActions.error(e as Error));
  }
};
