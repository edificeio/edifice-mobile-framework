/*
  Reducers for Homework (aka Diary) app.
*/

import { combineReducers } from "redux";

import { availableDiaries, selectedDiary } from "./diaries";
import selectedDiaryTask from "./selectedDiaryTask";

const rootReducer = combineReducers({
  availableDiaries,
  selectedDiary,
  selectedDiaryTask
});

export default rootReducer;
