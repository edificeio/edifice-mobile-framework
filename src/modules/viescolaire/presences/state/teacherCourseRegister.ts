import moment from 'moment';

import { AsyncState, createAsyncActionTypes } from '~/infra/redux/async2';
import viescoConfig from '~/modules/viescolaire/moduleConfig';

// THE MODEL --------------------------------------------------------------------------------------

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

// THE STATE --------------------------------------------------------------------------------------

export type ICoursesRegisterInfosState = AsyncState<ICoursesRegisterInfos>;

export const initialStateRegister: ICoursesRegisterInfos = [];

export const getCoursesRegisterState = (globalState: any) =>
  viescoConfig.getState(globalState).presences.coursesRegister as ICoursesRegisterInfosState;

// THE ACTION TYPES -------------------------------------------------------------------------------

export const actionTypes = createAsyncActionTypes(viescoConfig.namespaceActionType('COURSES_REGISTER'));
