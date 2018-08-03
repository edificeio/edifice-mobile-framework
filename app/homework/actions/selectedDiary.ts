/**
 * Diary selected action(s)
 * Build actions to be dispatched to the diary selected reducer.
 */

import { fetchHomeworkTasksIfNeeded } from "./tasks";

export const HOMEWORK_DIARY_SELECTED = "HOMEWORK_DIARY_SELECTED";

export function homeworkDiarySelected(diaryId: string) {
  // console.warn("Homework diary selected : " + diaryId);
  return dispatch => {
    dispatch({ type: HOMEWORK_DIARY_SELECTED, diaryId });
    dispatch(fetchHomeworkTasksIfNeeded(diaryId));
  };
}
