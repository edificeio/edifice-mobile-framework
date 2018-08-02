/**
 * Homework list state reducer
 * Holds a list of available homework Ids in a simple Array
 */

import moment from "moment";

import asyncReducer, { actionTypeReceived } from "./async";

import { actionPrefix, HOMEWORK_LIST_RECEIVED } from "../actions/list";

// TYPE DEFINITIONS -------------------------------------------------------------------------------

// TODO put this interface in a generic helper file. It is useful.
export interface IArrayById<T extends { id: any }> {
  [id: string]: T;
}

export interface IHomework {
  id: string;
  title: string;
  name: string;
}

export type IHomeworkList = IArrayById<IHomework>;

// THE REDUCER ------------------------------------------------------------------------------------

const stateDefault: IHomeworkList = {};

const homeworkListReducer = (state: IHomeworkList = stateDefault, action) => {
  switch (action.type) {
    case HOMEWORK_LIST_RECEIVED:
      return action.data;
    default:
      return state;
  }
  return state;
};

export default asyncReducer<IHomeworkList>(homeworkListReducer, actionPrefix);
