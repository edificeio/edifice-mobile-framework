/**
 * List of reducers for single homework task.
 */

import { Moment } from "moment";

export interface ISelectedHomeworkTaskState {
  homeworkId: string;
  date: Moment;
  taskId: number;
}

import { HOMEWORK_TASK_SELECTED } from "../actions/selectedTask";

function selectedTask(state: ISelectedHomeworkTaskState = null, action) {
  switch (action.type) {
    case HOMEWORK_TASK_SELECTED:
      return {
        ...state,
        date: action.date,
        homeworkId: action.homeworkId,
        taskId: action.taskId
      };
    default:
      return state;
  }
}

export default selectedTask;
