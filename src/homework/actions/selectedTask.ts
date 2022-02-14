/**
 * List of actions & action creators & thucs for tasks of Homework app.
 */
import moment from 'moment';
import { Action } from 'redux';

import homeworkConfig from '~/homework/config';

export const actionTypeTaskSelected = homeworkConfig.createActionType('TASK_SELECTED');

export interface IActionDiarySelected extends Action {
  date: moment.Moment;
  diaryId: string;
  taskId: string;
}

// NOTE : Yes, tasks only exists within a diary, so we need both ids.
// We need to pass the date (Moment object) as it's not stored in each task data. (same in the backend data.)
export function homeworkTaskSelected(diaryId: string, date: moment.Moment, taskId: string) {
  return {
    type: actionTypeTaskSelected,

    date,
    diaryId,
    taskId,
  };
}

// No task for fetch task from backend. Normally it's already done.
