import moduleConfig from '~/framework/modules/timeline/module-config';
import {
  AsyncState,
  createAsyncActionCreators,
  createAsyncActionTypes,
  createSessionAsyncReducer,
} from '~/framework/util/redux/async';

// State definition

export interface IEntcoreNotificationType {
  'type': string;
  'event-type': string;
  'app-name': string | null;
  'app-address': string | null;
  'defaultFrequency': string;
  'restriction': string;
  'push-notif': boolean;
  'key': string;
}

export type NotifTypesStateData = IEntcoreNotificationType[];
export type NotifTypesState = AsyncState<NotifTypesStateData>;

// Reducer

const initialState: NotifTypesStateData = [];

export const actionTypes = createAsyncActionTypes(moduleConfig.namespaceActionType('NOTIFICATION_TYPES'));
export const actions = createAsyncActionCreators<NotifTypesStateData>(actionTypes);

export default createSessionAsyncReducer(initialState, actionTypes);

// State getters
