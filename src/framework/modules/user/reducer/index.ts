import { IGlobalState, Reducers } from '~/app/store';
import moduleConfig from '~/framework/modules/user/module-config';
import { createSessionReducer } from '~/framework/util/redux/reducerFactory';

export interface UserState {
  sentNotificationFilters?: Record<string, boolean>;
}

export const userActionTypes = {
  SET_SENT_NOTIFICATION_FILTERS: moduleConfig.namespaceActionType(
    'SET_SENT_NOTIFICATION_FILTERS',
  ) as `${string}_SET_SENT_NOTIFICATION_FILTERS`,
};

type UserAction = {
  type: typeof userActionTypes.SET_SENT_NOTIFICATION_FILTERS;
  payload: { sentNotificationFilters: Record<string, boolean> };
};

type ActionOf<T extends UserAction['type']> = Extract<UserAction, { type: T }>;

const reducer = createSessionReducer<UserState, UserAction>(
  {},
  {
    [userActionTypes.SET_SENT_NOTIFICATION_FILTERS]: (state, action) => ({
      ...state,
      sentNotificationFilters: (action as ActionOf<typeof userActionTypes.SET_SENT_NOTIFICATION_FILTERS>).payload
        .sentNotificationFilters,
    }),
  },
);

export const userActions = {
  setSentNotificationFilters: (sentNotificationFilters: Record<string, boolean>) => ({
    payload: { sentNotificationFilters },
    type: userActionTypes.SET_SENT_NOTIFICATION_FILTERS,
  }),
};

export const userSelectors = {
  getSentNotificationFilters: (state: IGlobalState) => moduleConfig.getState(state).sentNotificationFilters,
};

Reducers.register(moduleConfig.reducerName, reducer);
export default reducer;
