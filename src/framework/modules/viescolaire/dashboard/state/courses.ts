import moment from 'moment';

import viescoConfig from '~/framework/modules/viescolaire/dashboard/module-config';
import { AsyncActionTypes, AsyncState, createAsyncActionTypes } from '~/framework/util/redux/async';

// THE MODEL --------------------------------------------------------------------------------------

export interface ICourse {
  id: string;
  startDate: moment.Moment;
  endDate: moment.Moment;
  subjectId: string;
  roomLabels: string[];
  teacherIds: string[];
  classes: string[];
  groups: string[];
  exceptionnal: string;
  subject: {
    code: string;
    externalId: string;
    id: string;
    name: string;
    rank: number;
  };
  color: string;
}

export type ICourseList = ICourse[];

// THE STATE --------------------------------------------------------------------------------------

export type ICourseListState = AsyncState<ICourseList>;

export const initialState: ICourseList = [];

export const getCoursesListState = (globalState: any) => viescoConfig.getState(globalState).coursesList as ICourseListState;

// THE ACTION TYPES -------------------------------------------------------------------------------

export const actionTypes: AsyncActionTypes = createAsyncActionTypes(viescoConfig.namespaceActionType('VIESCO_COURSES_LIST'));
