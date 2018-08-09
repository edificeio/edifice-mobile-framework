/**
 * Homework diary list state reducer
 * Holds a list of available homework diary Ids in a simple Array
 */
import asyncReducer from "../../infra/redux/async";

import { actionTypes } from "../actions/diaryList";

// TYPE DEFINITIONS -------------------------------------------------------------------------------

// TODO put this interface in a generic helper file. It is useful.
export interface IArrayById<T extends { id: any }> {
  [id: string]: T;
}

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
  action
) => {
  switch (action.type) {
    case actionTypes.received:
      return action.data;
    default:
      return state;
  }
};

export default asyncReducer<IHomeworkDiaryList>(
  homeworkDiaryListReducer,
  actionTypes
);
