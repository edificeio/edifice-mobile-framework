/**
 * Tasks by HomeworkId actions
 * Build actions to be dispatched to the homework tasks reducer.
 */
import moment from 'moment';

import homeworkConfig from '~/framework/modules/homework/module-config';
import { IHomeworkDay, IHomeworkTasks } from '~/framework/modules/homework/reducers/tasks';
import { IState, asyncActionTypes, asyncFetchIfNeeded, asyncGetJson } from '~/infra/redux/async';

/** Retuns the local state (global state -> homework -> tasks). Give the global state as parameter. */
const localState = globalState => homeworkConfig.getState(globalState).tasks;

// ADAPTER ----------------------------------------------------------------------------------------

// Data type of what is given by the backend.
export interface IHomeworkTasksBackend {
  _id: string;
  title: string;
  thumbnail: any; // unknown but unused here (I guess it's a string that represent the URL)
  trashed: number;
  owner: {
    userId: string;
    displayName: string;
  };
  created: {
    $date: number;
  };
  modified: {
    $date: number;
  };
  entriesModified: {
    $date: number;
  };
  data: {
    date: string;
    entries: {
      title: string;
      value: string;
    }[];
  }[];
}

/** The adapter MUST returns a brand-new object */
const homeworkTasksAdapter: (data: IHomeworkTasksBackend) => IHomeworkTasks = data => {
  // Get all the backend homeworkDays.
  if (!data) return { byId: {}, ids: [] };
  const dataDays = data.data;
  const ret: IHomeworkTasks = {
    byId: {},
    ids: [],
    diaryInfo: {},
  };
  if (!data.data) return { byId: {}, ids: [] };
  // Now it's time to iterate over the days.
  for (const itemday of dataDays) {
    if (itemday.entries.length === 0) continue; // If no tasks this day we skip it.
    const date = moment(itemday.date);
    // each homeworkDay must have an id based on the date.
    const dateId = date.format('YYYY-MM-DD');
    // Now we generate the current homeworkDay (empty for the moment)
    const homeworkDay: IHomeworkDay = {
      date,
      id: dateId,
      tasks: {
        byId: {},
        ids: [],
      },
    };
    // Now it's time to iterate over the tasks of that day
    itemday.entries.forEach((itemtask, indextask) => {
      homeworkDay.tasks.ids.push(indextask.toString());
      homeworkDay.tasks.byId[indextask] = {
        content: itemtask.value,
        id: indextask.toString(),
        title: itemtask.title,
      };
    });
    // Now we put the homeworkDay into the return value
    ret.ids.push(dateId);
    ret.byId[dateId] = homeworkDay;
  }
  // Sorting days of tasks by ascending date
  ret.ids.sort(); // As the used ID from date is YYYY-MM-DD, we can sort it lexically.
  ret.diaryInfo = {
    title: data.title,
    name: data.title, // What is name ??? Baby don't hurt me ! title duplicate ?
    id: data._id,
    thumbnail: data.thumbnail,
  };
  return ret;
};

// ACTION LIST ------------------------------------------------------------------------------------

export const actionTypes = asyncActionTypes(homeworkConfig.namespaceActionType('TASKS'));

export function homeworkTasksInvalidated(diaryId: string) {
  return { type: actionTypes.invalidated, diaryId };
}

export function homeworkTasksRequested(diaryId: string) {
  return { type: actionTypes.requested, diaryId };
}

export function homeworkTasksReceived(diaryId: string, data: IHomeworkTasks) {
  return {
    type: actionTypes.received,

    data,
    diaryId,
    receivedAt: Date.now(),
  };
}

export function homeworkTasksFetchError(diaryId: string, errmsg: string) {
  return { type: actionTypes.fetchError, error: true, errmsg, diaryId };
}

// THUNKS -----------------------------------------------------------------------------------------

/**
 * Calls a fetch operation to get homework tasks from the backend for the given diaryId.
 * Dispatches HOMEWORK_TASKS_REQUESTED, HOMEWORK_TASKS_RECEIVED, and HOMEWORK_TASKS_FETCH_ERROR if an error occurs.
 */
export function fetchHomeworkTasks(diaryId: string) {
  return async dispatch => {
    dispatch(homeworkTasksRequested(diaryId));

    try {
      const data = await asyncGetJson(`/homeworks/get/${diaryId}`, homeworkTasksAdapter);

      dispatch(homeworkTasksReceived(diaryId, data));
    } catch (errmsg) {
      dispatch(homeworkTasksFetchError(diaryId, errmsg as string));
    }
  };
}

/**
 * Calls a fetch operation to get the homework tasks from the backend for the given diaryId, only if needed data is not present or invalidated.
 */
export function fetchHomeworkTasksIfNeeded(diaryId: string) {
  return asyncFetchIfNeeded<IHomeworkTasks, IState<IHomeworkTasks>>(
    gs => {
      return localState(gs)[diaryId];
    },
    fetchHomeworkTasks,
    diaryId,
  );
}
