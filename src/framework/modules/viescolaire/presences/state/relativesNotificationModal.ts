import { AsyncState, createAsyncActionTypes } from '~/framework/util/redux/async';
import moduleConfig from '~/modules/viescolaire/presences/moduleConfig';

export type IChildEventsNotification = {
  studentsEvents: any;
  limit?: number;
  offset?: number;
  recoveryMethods: string; // {HALF_DAY / HOUR / DAY}
  totals: {
    JUSTIFIED: number;
    UNJUSTIFIED: number;
    LATENESS: number;
    DEPARTURE: number;
  };
};

export const initialState = {
  studentsEvents: {},
  recoveryMethods: '', // {HALF_DAY / HOUR / DAY}
  totals: {
    JUSTIFIED: 0,
    UNJUSTIFIED: 0,
    LATENESS: 0,
    DEPARTURE: 0,
  },
};

export type IChildEventsNotificationState = AsyncState<IChildEventsNotification>;

export const getRelativesNotification = (globalState: any) =>
  moduleConfig.getState(globalState).relativesNotification as IChildEventsNotificationState;

export const actionTypes = createAsyncActionTypes(moduleConfig.namespaceActionType('RELATIVES_NOTIFICATION'));
