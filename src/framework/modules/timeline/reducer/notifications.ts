import moduleConfig from '~/framework/modules/timeline/moduleConfig';
import { ITimelineNotification } from '~/framework/util/notifications';
import {
  AsyncPagedState,
  createAsyncPagedActionCreators,
  createAsyncPagedActionTypes,
  createSessionAsyncPagedReducer,
} from '~/framework/util/redux/asyncPaged';

// State

export type INotifications_State_Data = ITimelineNotification[];
export type INotifications_State = AsyncPagedState<INotifications_State_Data>;

// Reducer

const initialState: INotifications_State_Data = [];
const pageSize = 25;

export const actionTypes = createAsyncPagedActionTypes(moduleConfig.namespaceActionType('NOTIFICATIONS'));
export const actions = createAsyncPagedActionCreators<INotifications_State_Data>(actionTypes);

export default createSessionAsyncPagedReducer(initialState, actionTypes, pageSize);

// Getters
