import { CombinedState, combineReducers } from 'redux';

import { IEntcoreApp } from '~/framework/util/moduleTool';

import notifFilters, { NotifFiltersState, NotificationFilter } from './notif-filters';
import notifTypes, { IEntcoreNotificationType, NotifTypesState } from './notif-types';

// State

export type NotifDefinitionsState = CombinedState<{
  notifTypes: NotifTypesState;
  notifFilters: NotifFiltersState;
}>;

// Reducer

export default combineReducers({
  notifTypes,
  notifFilters,
});

// State getters

export const getAreNotificationDefinitionsLoaded = (state: NotifDefinitionsState) => state.notifTypes.lastSuccess;

/**
 * Compute and populate all notification filters that exists in given notif definitions.
 */
const getFilterDetail = (filter: string, notifTypesToFilter: IEntcoreNotificationType[]) => {
  const matchingNotifType = notifTypesToFilter.find(nt => nt.type === filter);
  return matchingNotifType
    ? {
        type: filter,
        'app-name': matchingNotifType['app-name'],
        'app-address': matchingNotifType['app-address'],
        i18n: `timeline.appType.${filter}`,
      }
    : undefined;
};
export const computeNotificationFilterList = (filters: string[], notifTypesToFilter: IEntcoreNotificationType[]) => {
  return filters.reduce<NotificationFilter[]>((acc, cur) => {
    const filterDetail = getFilterDetail(cur, notifTypesToFilter);
    return filterDetail ? [...acc, filterDetail] : acc;
  }, []);
};

/**
 * Filter a notificationFilterList with authorized entcore apps
 */
export const getAuthorizedNotificationFilterList = (notifFiltersToFilter: NotificationFilter[], entcoreApps: IEntcoreApp[]) =>
  notifFiltersToFilter.filter(nf => entcoreApps.find(ea => !nf['app-name'] || ea.name === nf['app-name']));
