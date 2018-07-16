/**
 * Diary list state reducer
 * Holds a list of available diary Ids in a simple Array
 */

import moment from "moment";

import asyncReducer, { actionTypeReceived } from "./async";

import { actionPrefix, DIARY_LIST_RECEIVED } from "../actions/list";

// TYPE DEFINITIONS -------------------------------------------------------------------------------

// TODO put it in a generic helper file. It is useful.
export interface IArrayById<T extends { id: any }> {
  [id: string]: T;
}

export interface IDiary {
  id: string;
  title: string;
  name: string;
}

export type IDiaryList = IArrayById<IDiary>;

// THE REDUCER ------------------------------------------------------------------------------------

const stateDefault: IDiaryList = {};

const diaryListReducer = (state: IDiaryList = stateDefault, action) => {
  switch (action.type) {
    case DIARY_LIST_RECEIVED:
      return action.data;
    default:
      return state;
  }
  return state;
};

export default asyncReducer<IDiaryList>(diaryListReducer, actionPrefix);
