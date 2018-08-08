/**
 * List of reducers for single homework task.
 */

import { Moment } from "moment";

export interface ISelectedHomeworkTaskState {
  diaryId: string;
  date: Moment;
  taskId: number;
}

import { actionTypeTaskSelected } from "../actions/selectedTask";

function selectedTask(state: ISelectedHomeworkTaskState = null, action) {
  switch (action.type) {
    case actionTypeTaskSelected:
      return {
        ...state,
        date: action.date,
        diaryId: action.diaryId,
        taskId: action.taskId
      };
    default:
      return state;
  }
}

export default selectedTask;
