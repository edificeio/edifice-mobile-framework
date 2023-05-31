/**
 * Homework diary list state reducer
 * Holds a list of available homework diary Ids in a simple Array
 */
import { AnyAction } from 'redux';

import { actionTypes } from '~/framework/modules/homework/actions/diaryList';
import { homeworkTasksReceived, actionTypes as taskListActionTypes } from '~/framework/modules/homework/actions/tasks';
import { IArrayById } from '~/infra/collections';
import asyncReducer from '~/infra/redux/async';
import { createEndSessionActionType } from '~/infra/redux/reducerFactory';

// TYPE DEFINITIONS -------------------------------------------------------------------------------

export interface IHomeworkDiary {
  id: string;
  title: string;
  name: string;
  thumbnail: string;
}

export type IHomeworkDiaryList = IArrayById<IHomeworkDiary>;

// THE REDUCER ------------------------------------------------------------------------------------

const stateDefault: IHomeworkDiaryList = {};

const homeworkDiaryListReducer = (state: IHomeworkDiaryList = stateDefault, action = {} as AnyAction) => {
  switch (action.type) {
    case actionTypes.received:
      return action.data;
    // Session flush forward-compatibility.
    case taskListActionTypes.received: {
      const a = action as ReturnType<typeof homeworkTasksReceived>;
      if (a.data.diaryInfo) {
        return {
          ...state,
          [a.diaryId]: a.data.diaryInfo,
        } as IHomeworkDiaryList;
      } else return state;
    }
    case createEndSessionActionType():
      return stateDefault;
    default:
      return state;
  }
};

export default asyncReducer<IHomeworkDiaryList>(homeworkDiaryListReducer, actionTypes);
