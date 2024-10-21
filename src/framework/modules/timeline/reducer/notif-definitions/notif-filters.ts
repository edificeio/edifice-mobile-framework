// State definition
import moduleConfig from '~/framework/modules/timeline/module-config';
import {
  AsyncState,
  createAsyncActionCreators,
  createAsyncActionTypes,
  createSessionAsyncReducer,
} from '~/framework/util/redux/async';

export interface NotificationFilter {
  'type': string;
  'app-name': string | null;
  'app-address': string | null;
  'i18n': string;
}

export type NotifFiltersStateData = NotificationFilter[];
export type NotifFiltersState = AsyncState<NotifFiltersStateData>;

// Reducer

const initialState: NotifFiltersStateData = [];

export const actionTypes = createAsyncActionTypes(moduleConfig.namespaceActionType('NOTIFICATION_FILTERS'));
export const actions = createAsyncActionCreators<NotifFiltersStateData>(actionTypes);

export default createSessionAsyncReducer(initialState, actionTypes);
