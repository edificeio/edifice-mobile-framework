import moment from 'moment';

import moduleConfig from '~/framework/modules/viescolaire/presences/module-config';
import { AsyncState } from '~/framework/util/redux/async';

export type ICallEvent = {
  id?: number;
  start_date?: string;
  end_date?: string;
  comment?: string;
  counsellor_input?: string;
  student_id: string;
  register_id: number;
  type_id: number;
  reason_id?: number;
};

export type IHistoryEvent = {
  start_date: moment.Moment;
  end_date: moment.Moment;
  type_id: number;
  recovery_method: string;
  period: string;
};

export type IForgottenNotebook = {
  date: moment.Moment;
};

export type IIncident = {
  date: moment.Moment;
  protagonist: { label: string };
  label: string;
};

export type IPunishment = {
  created_at: moment.Moment;
  start_date: moment.Moment;
  end_date: moment.Moment;
  delay_at: moment.Moment;
  label: string;
  punishment_category_id: number;
};

export type ICallEventsList = ICallEvent[];
export type IHistoryEventsList = IHistoryEvent[];
export type IForgottenNotebooksList = IForgottenNotebook[];
export type IIncidentsList = IIncident[];
export type IPunishmentsList = IPunishment[];

export type ICallEventsListState = AsyncState<ICallEventsList>;

const callPrefix = moduleConfig.namespaceActionType('CALL_EVENT');
const historyPrefix = moduleConfig.namespaceActionType('HISTORY');

export const initialState = {
  lateness: [],
  departure: [],
  no_reason: [],
  regularized: [],
  unregularized: [],
  notebooks: [],
  punishments: [],
  incidents: [],
  isPristine: true,
  error: '',
};

export const teacherEventsActionsTypes = {
  post: callPrefix + '_POST',
  put: callPrefix + '_PUT',
  delete: callPrefix + '_DELETE',
  error: callPrefix + '_ERROR',
};

export const studentEventsActionsTypes = {
  event: historyPrefix + '_GET_EVENTS',
  notebook: historyPrefix + '_GET_NOTEBOOKS',
  incident: historyPrefix + '_GET_INCIDENTS',
  clear: historyPrefix + '_CLEAR',
  error: historyPrefix + '_ERROR',
};

export const getHistoryEvents = (globalState: any) => moduleConfig.getState(globalState).history as ICallEventsListState;
