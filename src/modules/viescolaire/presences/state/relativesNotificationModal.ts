import { AsyncState, createAsyncActionTypes } from '~/infra/redux/async2';
import viescoConfig from '~/modules/viescolaire/moduleConfig';

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
  viescoConfig.getState(globalState).presences.relativesNotification as IChildEventsNotificationState;

export const actionTypes = createAsyncActionTypes(viescoConfig.namespaceActionType('RELATIVES_NOTIFICATION'));
