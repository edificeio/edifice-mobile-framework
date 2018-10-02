/**
 * Diary selected action(s)
 * Build actions to be dispatched to the diary selected reducer.
 */
import homeworkConfig from "../config";

import { AsyncStorage } from "react-native";
import { Action } from "redux";
import { fetchHomeworkTasksIfNeeded } from "./tasks";

export const actionTypeDiarySelected = homeworkConfig.createActionType(
  "DIARY_SELECTED"
);

export interface IActionDiarySelected extends Action {
  diaryId: string;
}

export const createActionDiarySelected: (
  diaryId: string
) => IActionDiarySelected = diaryId => ({
  diaryId,
  type: actionTypeDiarySelected
});

export function homeworkDiarySelected(diaryId: string) {
  // console.warn("Homework diary selected : " + diaryId);
  return async dispatch => {
    await AsyncStorage.setItem("diary-selected", diaryId);
    dispatch(createActionDiarySelected(diaryId));
    dispatch(fetchHomeworkTasksIfNeeded(diaryId));
  };
}

export default homeworkDiarySelected;
