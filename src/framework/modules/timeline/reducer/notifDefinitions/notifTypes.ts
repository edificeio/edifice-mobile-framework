import moduleConfig from '~/framework/modules/timeline/moduleConfig';
import {
  AsyncState,
  createAsyncActionCreators,
  createAsyncActionTypes,
  createSessionAsyncReducer,
} from '~/framework/util/redux/async';

// State definition

export interface IEntcoreNotificationType {
  type: string;
  'event-type': string;
  'app-name': string | null;
  'app-address': string | null;
  defaultFrequency: string;
  restriction: string;
  'push-notif': boolean;
  key: string;
}

export type INotifTypes_State_Data = IEntcoreNotificationType[];
export type INotifTypes_State = AsyncState<INotifTypes_State_Data>;

// Reducer

const initialState: INotifTypes_State_Data = [];

export const actionTypes = createAsyncActionTypes(moduleConfig.namespaceActionType('NOTIFICATION_TYPES'));
export const actions = createAsyncActionCreators<INotifTypes_State_Data>(actionTypes);

export default createSessionAsyncReducer(initialState, actionTypes);

// State getters
