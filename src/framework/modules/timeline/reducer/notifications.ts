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

export const actionTypes = {
  ...createAsyncPagedActionTypes(moduleConfig.namespaceActionType('NOTIFICATIONS')),
  deleteError: moduleConfig.namespaceActionType('NOTIFICATION_DELETE_ERROR'),
  deleteReceipt: moduleConfig.namespaceActionType('NOTIFICATION_DELETE_RECEIPT'),
  deleteRequest: moduleConfig.namespaceActionType('NOTIFICATION_DELETE_REQUEST'),
};

export const actions = {
  ...createAsyncPagedActionCreators<NotificationsStateData>(actionTypes),
  deleteError: (notificationId: string) => ({ notificationId, type: actionTypes.deleteError }),
  deleteReceipt: (notificationId: string) => ({ notificationId, type: actionTypes.deleteReceipt }),
  deleteRequest: (notificationId: string) => ({ notificationId, type: actionTypes.deleteRequest }),
};

/**
 * The notification is only marked on request, so it leaves the list at once and comes back at its
 * place if the server refuses. It is dropped for good once the deletion is confirmed.
 */
const deleteNotificationActionsHandlerMap = {
  [actionTypes.deleteRequest]: (state: NotificationsStateData, action) =>
    state.map(notification => (notification.id === action.notificationId ? { ...notification, deleted: true } : notification)),
  [actionTypes.deleteReceipt]: (state: NotificationsStateData, action) =>
    state.filter(notification => notification.id !== action.notificationId),
  [actionTypes.deleteError]: (state: NotificationsStateData, action) =>
    state.map(notification => (notification.id === action.notificationId ? { ...notification, deleted: false } : notification)),
};

export default createSessionAsyncPagedReducer(initialState, actionTypes, pageSize, deleteNotificationActionsHandlerMap);

// Getters
