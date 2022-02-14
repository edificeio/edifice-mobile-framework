import moment from 'moment';

import { createAsyncActionTypes, AsyncState, AsyncActionTypes } from '~/infra/redux/async2';
import { ISessionHomeworksBackend } from '~/modules/viescolaire/cdt/services/sessions';
import viescoConfig from '~/modules/viescolaire/moduleConfig';

// THE MODEL --------------------------------------------------------------------------------------

export interface ISession {
  id: string;
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
  end_time: string;
  teacher_id: string;
  description: string;
  title: string;
  homeworks: ISessionHomeworksBackend;
  course_id: string;
  audience: {
    externalId: string;
    id: string;
    labels: string[];
    name: string;
  };
}

export type ISessionList = ISession[];

// THE STATE --------------------------------------------------------------------------------------

export type ISessionListState = AsyncState<ISessionList>;

export const initialState: ISessionList = [
  {
    id: '',
    date: moment(),
    subject_id: '',
    subject: {
      id: '',
      externalId: '',
      name: '',
      rank: 0,
    },
    exceptional_label: '',
    start_time: '',
    end_time: '',
    teacher_id: '',
    description: '',
    title: '',
    homeworks: [],
    course_id: '',
    audience: {
      externalId: '',
      id: '',
      labels: [],
      name: '',
    },
  },
];

export const getSessionsListState = (globalState: any) => viescoConfig.getState(globalState).cdt.sessionsList as ISessionListState;

// THE ACTION TYPES -------------------------------------------------------------------------------

export const actionTypes: AsyncActionTypes = createAsyncActionTypes(viescoConfig.namespaceActionType('CDT_SESSION_LIST'));
