/**
 * List of reducers for single homework task.
 */

import { Moment } from 'moment';

import { actionTypeTaskSelected } from '~/homework/actions/selectedTask';
import { createEndSessionActionType } from '~/infra/redux/reducerFactory';

export interface ISelectedHomeworkTaskState {
  diaryId: string;
  date: Moment;
  taskId: number;
}

function selectedTask(state: ISelectedHomeworkTaskState = null, action) {
  switch (action.type) {
    case actionTypeTaskSelected:
      return {
        ...state,
        date: action.date,
        diaryId: action.diaryId,
        taskId: action.taskId,
      };
    // Session flush forward-compatibility.
    case createEndSessionActionType():
      return null;
    default:
      return state;
  }
}

export default selectedTask;
