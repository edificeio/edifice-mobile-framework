// State definition
import moduleConfig from '~/framework/modules/timeline/moduleConfig';
import {
  AsyncState,
  createAsyncActionCreators,
  createAsyncActionTypes,
  createSessionAsyncReducer,
} from '~/framework/util/redux/async';

export interface INotificationFilter {
  type: string;
  'app-name': string | null;
  'app-address': string | null;
  i18n: string;
}

export type INotifFilters_State_Data = INotificationFilter[];
export type INotifFilters_State = AsyncState<INotifFilters_State_Data>;

// Reducer

const initialState: INotifFilters_State_Data = [];

export const actionTypes = createAsyncActionTypes(moduleConfig.namespaceActionType('NOTIFICATION_FILTERS'));
export const actions = createAsyncActionCreators<INotifFilters_State_Data>(actionTypes);

export default createSessionAsyncReducer(initialState, actionTypes);
