/**
 * Homework selected action(s)
 * Build actions to be dispatched to the homework selected reducer.
 */

import { fetchHomeworkTasksIfNeeded } from "./tasks";

export const HOMEWORK_SELECTED = "HOMEWORK_SELECTED";

export function homeworkSelected(homeworkId: string) {
  // console.warn("Homework selected : " + homeworkId);
  return dispatch => {
    dispatch({ type: HOMEWORK_SELECTED, homeworkId });
    dispatch(fetchHomeworkTasksIfNeeded(homeworkId));
  };
}
