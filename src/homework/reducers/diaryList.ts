/**
 * Homework diary list state reducer
 * Holds a list of available homework diary Ids in a simple Array
 */
import { IArrayById } from "../../infra/collections";
import asyncReducer from "../../infra/redux/async";

import { actionTypes } from "../actions/diaryList";
import { createEndSessionActionType } from "../../infra/redux/reducerFactory";
import { AnyAction } from "redux";

// TYPE DEFINITIONS -------------------------------------------------------------------------------

export interface IHomeworkDiary {
  id: string;
  title: string;
  name: string;
}

export type IHomeworkDiaryList = IArrayById<IHomeworkDiary>;

// THE REDUCER ------------------------------------------------------------------------------------

const stateDefault: IHomeworkDiaryList = {};

const homeworkDiaryListReducer = (
  state: IHomeworkDiaryList = stateDefault,
  action: AnyAction
) => {
  switch (action.type) {
    case actionTypes.received:
      return action.data;
    // Session flush forward-compatibility.
    case createEndSessionActionType():
      return stateDefault;
    default:
      return state;
  }
};

export default asyncReducer<IHomeworkDiaryList>(
  homeworkDiaryListReducer,
  actionTypes
);
