/**
 * Diary selected action(s)
 * Build actions to be dispatched to the diary selected reducer.
 */

export const DIARY_SELECTED = "DIARY_SELECTED";

export function diarySelected(diaryId: string) {
  return dispatch => {
    dispatch({ type: DIARY_SELECTED, diaryId });
    // dispatch(fetchDiaryTasksIfNeeded(diaryId)); // TODO : tasks actions
  };
}
