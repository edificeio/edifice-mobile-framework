/**
 * Sub-module CDT Reducer
 */
import { IHomeworkListState } from './state/homeworks';
import { ISessionListState } from './state/sessions';
import { ITimeSlotsState } from './state/timeSlots';

// State

export interface ICdt_State {
  homeworksList: IHomeworkListState;
  sessionsList: ISessionListState;
  timeSlots: ITimeSlotsState;
}
