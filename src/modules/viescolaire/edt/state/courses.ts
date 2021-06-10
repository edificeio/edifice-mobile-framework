import moment from "moment";

import { createAsyncActionTypes, AsyncState, AsyncActionTypes } from "../../../../infra/redux/async2";
import viescoConfig from "../../moduleConfig";

// THE MODEL --------------------------------------------------------------------------------------

export interface ICourse {
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
}

export type ICourseList = ICourse[];

// THE STATE --------------------------------------------------------------------------------------

export type ICourseListState = AsyncState<ICourseList>;

export const initialState: ICourseList = [];

export const getCoursesListState = (globalState: any) =>
  viescoConfig.getState(globalState).edt.coursesList as ICourseListState;

// THE ACTION TYPES -------------------------------------------------------------------------------

export const actionTypes: AsyncActionTypes = createAsyncActionTypes(
  viescoConfig.namespaceActionType("EDT_COURSES_LIST")
);
