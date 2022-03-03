import moment from 'moment';

import { createAsyncActionTypes, AsyncState } from '~/infra/redux/async2';
import viescoConfig from '~/modules/viescolaire/moduleConfig';

// THE MODEL --------------------------------------------------------------------------------------

export interface ICourses {
  id: string;
  allowRegister: boolean;
  subjectId: string;
  classes: string[];
  structureId: string;
  startDate: moment.Moment;
  endDate: moment.Moment;
  roomLabels: string[];
  groups: string[];
  registerId: string;
  splitSlot: boolean;
}

export type ICoursesList = ICourses[];

// THE STATE --------------------------------------------------------------------------------------

export type ICoursesListState = AsyncState<ICoursesList>;

export const initialState: ICoursesList = [];

export const getCoursesListState = (globalState: any) =>
  viescoConfig.getState(globalState).presences.coursesList as ICoursesListState;

// THE ACTION TYPES -------------------------------------------------------------------------------

export const actionTypes = createAsyncActionTypes(viescoConfig.namespaceActionType('TEACHER_COURSES'));
