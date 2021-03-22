import moment from "moment";

import { createAsyncActionTypes, AsyncState, AsyncActionTypes } from "../../../infra/redux/async2";
import viescoConfig from "../../config";

// THE MODEL --------------------------------------------------------------------------------------

export interface ICourse {
  startDate: moment.Moment;
  endDate: moment.Moment;
  subjectId: string;
  roomLabels: string[];
  teacherIds: string[];
  classes: string[];
  groups: string[];
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
  viescoConfig.getLocalState(globalState).edt.coursesList as ICourseListState;

// THE ACTION TYPES -------------------------------------------------------------------------------

export const actionTypes: AsyncActionTypes = createAsyncActionTypes(viescoConfig.createActionType("EDT_COURSES_LIST"));
