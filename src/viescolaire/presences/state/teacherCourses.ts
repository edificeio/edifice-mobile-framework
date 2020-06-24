import moment from "moment";

import { createAsyncActionTypes, AsyncState } from "../../../infra/redux/async2";
import viescoConfig from "../../config";

export interface ICourses {
  classes: string;
  structureId: string;
  startDate: moment.Moment;
  endDate: moment.Moment;
  roomLabels: string;
}

export type ICoursesList = ICourses[];

export type ICoursesListState = AsyncState<ICoursesList>;

export const initialState: ICoursesList = [];

export const getCoursesListState = (globalState: any) =>
  viescoConfig.getLocalState(globalState).presences.coursesList as ICoursesListState;

export const actionTypes = createAsyncActionTypes(viescoConfig.createActionType("TEACHER_COURSES"));
