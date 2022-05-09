import moment from 'moment';

import { AsyncActionTypes, AsyncState, createAsyncActionTypes } from '~/infra/redux/async2';
import viescoConfig from '~/modules/viescolaire/moduleConfig';

// THE MODEL --------------------------------------------------------------------------------------

export interface ICourseTag {
  id: number;
  structureId: string;
  label: string;
  abbreviation: string;
  allowRegister: boolean;
  isHidden: boolean;
  isPrimary: boolean;
  isUsed: boolean;
}

export interface IEdtCourse {
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
  tags: ICourseTag[];
  tagIds: number[];
}

export type IEdtCourseList = IEdtCourse[];

// THE STATE --------------------------------------------------------------------------------------

export type IEdtCourseListState = AsyncState<IEdtCourseList>;

export const initialState: IEdtCourseList = [];

export const getEdtCoursesListState = (globalState: any) =>
  viescoConfig.getState(globalState).edt.edtCourseList as IEdtCourseListState;

// THE ACTION TYPES -------------------------------------------------------------------------------

export const actionTypes: AsyncActionTypes = createAsyncActionTypes(viescoConfig.namespaceActionType('EDT_COURSES_LIST'));
