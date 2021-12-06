import moment from 'moment';

import { createAsyncActionTypes, AsyncState } from '~/infra/redux/async2';
import viescoConfig from '~/modules/viescolaire/moduleConfig';

export interface IClassesCall {
  personnel_id: string;
  roof_id: string;
  state_id: number;
  course_id: string;
  subject_id: string;
  start_date: moment.Moment;
  end_date: moment.Moment;
  counsellor_input: boolean;
  teachers: Array<{
    id: string;
    displayName: string;
    functions: string;
  }>;
  students: Array<{
    id: string;
    name: string;
    group: string;
    group_name: string;
    last_course_absent: boolean;
    exempted: boolean;
    exemption_attendance: boolean;
    forgotten_notebook: boolean;
    day_history: Array<{
      name: string;
      //start_date: moment.Moment;
      //end_date: moment.Moment;
      type_id: number;
      events: Array<{
        id: number;
        comment: string;
        counsellor_input: boolean;
        //end_date: moment.Moment;
        //start_date: moment.Moment;
        register_id: string;
        type_id: number;
      }>;
    }>;
  }>;
}

export type IClassesCallList = IClassesCall[];

export type IClassesCallListState = AsyncState<IClassesCallList>;

export const initialState: IClassesCallList = [];

export const getClassesCallListState = (globalState: any) =>
  viescoConfig.getState(globalState).presences.callList as IClassesCallListState;

export const actionTypes = createAsyncActionTypes(viescoConfig.namespaceActionType('CLASSES_CALL'));
