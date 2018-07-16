/**
 * List of reducers for single diary task.
 */

import { Moment } from "moment";

export interface ISelectedDiaryTaskState {
  diaryId: string;
  date: Moment;
  taskId: number;
}

import { DIARY_TASK_SELECTED } from "../actions/selectedTask";

function selectedTask(state: ISelectedDiaryTaskState = null, action) {
  switch (action.type) {
    case DIARY_TASK_SELECTED:
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
