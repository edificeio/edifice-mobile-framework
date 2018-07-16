/**
 * Diary selected action(s)
 * Build actions to be dispatched to the diary selected reducer.
 */

import { fetchDiaryTasksIfNeeded } from "./tasks";

export const DIARY_SELECTED = "DIARY_SELECTED";

export function diarySelected(diaryId: string) {
  // console.warn("Diary selected : " + diaryId);
  return dispatch => {
    dispatch({ type: DIARY_SELECTED, diaryId });
    dispatch(fetchDiaryTasksIfNeeded(diaryId));
  };
}
