import moment from 'moment';

import { AsyncState, createAsyncActionTypes } from '~/framework/util/redux/async';
import moduleConfig from '~/modules/viescolaire/presences/moduleConfig';

interface IEvents {
  id: number;
  comment: string;
  counsellor_input: boolean;
  //end_date: moment.Moment;
  //start_date: moment.Moment;
  register_id: string;
  type_id: number;
}

export interface IDayHistory {
  name: string;
  //start_date: moment.Moment;
  //end_date: moment.Moment;
  type_id: number;
  events: IEvents[];
}

export interface IStudent {
  id: string;
  name: string;
  group: string;
  group_name: string;
  last_course_absent: boolean;
  exempted: boolean;
  exemption_attendance: boolean;
  forgotten_notebook: boolean;
  day_history: IDayHistory[];
}

interface ITeachers {
  id: string;
  displayName: string;
  functions: string;
}

export interface IClassesCall {
  personnel_id: string;
  roof_id: string;
  state_id: number;
  course_id: string;
  subject_id: string;
  start_date: moment.Moment;
  end_date: moment.Moment;
  counsellor_input: boolean;
  teachers: ITeachers[];
  students: IStudent[];
}

export type IClassesCallList = IClassesCall[];

export type IClassesCallListState = AsyncState<IClassesCallList>;

export const initialState: IClassesCallList = [];

export const getClassesCallListState = (globalState: any) => moduleConfig.getState(globalState).callList as IClassesCallListState;

export const actionTypes = createAsyncActionTypes(moduleConfig.namespaceActionType('CLASSES_CALL'));
