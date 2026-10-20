import moduleConfig from '~/framework/modules/home/module-config';
import { ITimelineNotification } from '~/framework/util/notifications';
import {
  AsyncPagedState,
  createAsyncPagedActionCreators,
  createAsyncPagedActionTypes,
  createSessionAsyncPagedReducer,
} from '~/framework/util/redux/asyncPaged';
import { createSessionReducer } from '~/framework/util/redux/reducerFactory';

// State

export type NotificationsStateData = ITimelineNotification[];
export type NotificationsState = AsyncPagedState<NotificationsStateData>;

// Reused by reloads that do not set it, so one list never mixes two contracts.
export type NotificationsApiVersionState = string | null;

// Reducer

const initialState: NotificationsStateData = [];
const pageSize = 25;

export const actionTypes = {
  ...createAsyncPagedActionTypes(moduleConfig.namespaceActionType('NOTIFICATIONS')),
  deleteError: moduleConfig.namespaceActionType('NOTIFICATION_DELETE_ERROR'),
  deleteReceipt: moduleConfig.namespaceActionType('NOTIFICATION_DELETE_RECEIPT'),
  deleteRequest: moduleConfig.namespaceActionType('NOTIFICATION_DELETE_REQUEST'),
  setApiVersion: moduleConfig.namespaceActionType('NOTIFICATIONS_API_VERSION_SET'),
};

export const actions = {
  ...createAsyncPagedActionCreators<NotificationsStateData>(actionTypes),
  deleteError: (notificationId: string) => ({ notificationId, type: actionTypes.deleteError }),
  deleteReceipt: (notificationId: string) => ({ notificationId, type: actionTypes.deleteReceipt }),
  deleteRequest: (notificationId: string) => ({ notificationId, type: actionTypes.deleteRequest }),
  setApiVersion: (apiVersion: string) => ({ apiVersion, type: actionTypes.setApiVersion }),
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

export const notificationsApiVersionReducer = createSessionReducer<NotificationsApiVersionState>(null, {
  [actionTypes.setApiVersion]: (_state, action) => (action as ReturnType<typeof actions.setApiVersion>).apiVersion,
});

// Getters
