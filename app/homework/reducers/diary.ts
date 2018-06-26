/**
 * List of reducers for diaries. (aka Homework)
 */

import { IDiaryDayTasks } from "./diaryTasks";

export interface IDiary {
  id: string;
  tasksByDay: IDiaryDayTasks;
}

// Make a list of IDiary like { <id_of_IDiary>: IDiary }.

