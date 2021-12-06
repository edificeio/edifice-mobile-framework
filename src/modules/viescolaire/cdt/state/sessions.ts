import moment from 'moment';

import { createAsyncActionTypes, AsyncState, AsyncActionTypes } from '~/infra/redux/async2';
import viescoConfig from '~/modules/viescolaire/moduleConfig';

// THE MODEL --------------------------------------------------------------------------------------

export interface ISession {
  id: number;
  date: moment.Moment;
  subject_id: string;
  subject: {
    id: string;
    externalId: string;
    name: string;
    rank?: number;
  };
  exceptional_label: string;
  start_time: string;
  teacher_id: string;
  description: string;
  title: string;
}

export type ISessionList = ISession[];

// THE STATE --------------------------------------------------------------------------------------

export type ISessionListState = AsyncState<ISessionList>;

export const initialState: ISessionList = [];

export const getSessionsListState = (globalState: any) => viescoConfig.getState(globalState).cdt.sessionsList as ISessionListState;

// THE ACTION TYPES -------------------------------------------------------------------------------

export const actionTypes: AsyncActionTypes = createAsyncActionTypes(viescoConfig.namespaceActionType('CDT_SESSION_LIST'));
