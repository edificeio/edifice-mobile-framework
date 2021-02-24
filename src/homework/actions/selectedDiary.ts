/**
 * Diary selected action(s)
 * Build actions to be dispatched to the diary selected reducer.
 */
import homeworkConfig from "../config";

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Action } from "redux";
import { fetchHomeworkTasks } from "./tasks";
import { Trackers } from "../../infra/tracker";

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
  return async dispatch => {
    await AsyncStorage.setItem("diary-selected", diaryId);
    dispatch(createActionDiarySelected(diaryId));
    dispatch(fetchHomeworkTasks(diaryId));
    Trackers.trackEvent("Homework", "SELECT");
  };
}

export default homeworkDiarySelected;
