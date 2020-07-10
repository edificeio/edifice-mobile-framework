import moment from "moment";

import { createAsyncActionTypes, AsyncState } from "../../../infra/redux/async2";
import viescoConfig from "../../config";

export interface ICourses {
  id: string;
  subjectId: string;
  classes: string;
  structureId: string;
  startDate: moment.Moment;
  endDate: moment.Moment;
  roomLabels: string;
  groups: string;
  registerId: string;
}

export type ICoursesList = ICourses[];

export type ICoursesListState = AsyncState<ICoursesList>;

export const initialState: ICoursesList = [];

export const getCoursesListState = (globalState: any) =>
  viescoConfig.getLocalState(globalState).presences.coursesList as ICoursesListState;

export const actionTypes = createAsyncActionTypes(viescoConfig.createActionType("TEACHER_COURSES"));

export interface ICoursesRegister {
  id: string;
  course_id: string;
  structure_id: string;
  state_id: number;
  start_date: moment.Moment;
  end_date: moment.Moment;
  councellor_input: boolean;
}

export type ICoursesRegisterInfos = ICoursesRegister[];

export type ICoursesRegisterInfosState = AsyncState<ICoursesRegisterInfos>;

export const initialStateRegister: ICoursesRegisterInfos = [];

export const getCoursesRegisterState = (globalState: any) =>
  viescoConfig.getLocalState(globalState).presences.coursesRegister as ICoursesRegisterInfosState;

export const actionTypesRegister = createAsyncActionTypes(viescoConfig.createActionType("COURSES_REGISTER"));
