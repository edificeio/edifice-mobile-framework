import moduleConfig from '~/framework/modules/timeline/module-config';
import { ITimelineNotification } from '~/framework/util/notifications';
import {
  AsyncPagedState,
  createAsyncPagedActionCreators,
  createAsyncPagedActionTypes,
  createSessionAsyncPagedReducer,
} from '~/framework/util/redux/asyncPaged';

// State

export type NotificationsStateData = ITimelineNotification[];
export type NotificationsState = AsyncPagedState<NotificationsStateData>;

// Reducer

const initialState: NotificationsStateData = [];
const pageSize = 25;

export const actionTypes = createAsyncPagedActionTypes(moduleConfig.namespaceActionType('NOTIFICATIONS'));
export const actions = createAsyncPagedActionCreators<NotificationsStateData>(actionTypes);

export default createSessionAsyncPagedReducer(initialState, actionTypes, pageSize);

// Getters
