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
import { createEndSessionActionType } from "../../infra/redux/reducerFactory";

function selectedTask(state: ISelectedHomeworkTaskState = null, action) {
  switch (action.type) {
    case actionTypeTaskSelected:
      return {
        ...state,
        date: action.date,
        diaryId: action.diaryId,
        taskId: action.taskId
      };
    // Session flush forward-compatibility.
    case createEndSessionActionType():
      return null;
    default:
      return state;
  }
}

export default selectedTask;
