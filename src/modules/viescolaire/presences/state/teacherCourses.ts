import moment from 'moment';

import { AsyncState, createAsyncActionTypes } from '~/infra/redux/async2';
import moduleConfig from '~/modules/viescolaire/presences/moduleConfig';

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

export const getCoursesListState = (globalState: any) => moduleConfig.getState(globalState).coursesList as ICoursesListState;

// THE ACTION TYPES -------------------------------------------------------------------------------

export const actionTypes = createAsyncActionTypes(moduleConfig.namespaceActionType('TEACHER_COURSES'));
