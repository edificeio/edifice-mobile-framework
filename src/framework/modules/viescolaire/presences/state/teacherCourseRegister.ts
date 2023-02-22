import moment from 'moment';

import { AsyncState, createAsyncActionTypes } from '~/framework/util/redux/async';
import moduleConfig from '~/modules/viescolaire/presences/moduleConfig';

// THE MODEL --------------------------------------------------------------------------------------

export interface ICoursesRegisterInfos {
  id: string;
  course_id: string;
  structure_id: string;
  state_id: number;
  start_date: moment.Moment;
  end_date: moment.Moment;
  councellor_input: boolean;
}

// THE STATE --------------------------------------------------------------------------------------

export type ICoursesRegisterInfosState = AsyncState<ICoursesRegisterInfos>;

export const initialStateRegister: ICoursesRegisterInfos = {
  id: '',
  course_id: '',
  structure_id: '',
  state_id: 0,
  start_date: moment(),
  end_date: moment(),
  councellor_input: false,
};

export const getCoursesRegisterState = (globalState: any) =>
  moduleConfig.getState(globalState).coursesRegister as ICoursesRegisterInfosState;

// THE ACTION TYPES -------------------------------------------------------------------------------

export const actionTypes = createAsyncActionTypes(moduleConfig.namespaceActionType('COURSES_REGISTER'));
