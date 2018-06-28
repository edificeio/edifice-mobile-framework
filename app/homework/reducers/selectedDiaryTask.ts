/**
 * List of reducers for single diary task.
 */

import { Moment } from "moment";

export interface ISelectedDiaryTaskState {
  diaryId: string;
  moment: Moment;
  taskId: number;
}

import { DIARY_TASK_SELECTED } from "../actions/selectedDiaryTask";

function selectedDiaryTask(state: ISelectedDiaryTaskState = null, action) {
  switch (action.type) {
    case DIARY_TASK_SELECTED:
      return {
        ...state,
        diaryId: action.diaryId,
        moment: action.moment,
        taskId: action.taskId
      };
    default:
      return state;
  }
}

export default selectedDiaryTask;
