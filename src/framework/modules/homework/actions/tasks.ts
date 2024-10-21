/**
 * Tasks by HomeworkId actions
 * Build actions to be dispatched to the homework tasks reducer.
 */
import moment from 'moment';

import homeworkConfig from '~/framework/modules/homework/module-config';
import { IHomeworkDay, IHomeworkTasks, IHomeworkTaskStatuses } from '~/framework/modules/homework/reducers/tasks';
import { asyncActionTypes, asyncFetchIfNeeded, asyncGetJson, IState } from '~/infra/redux/async';

/** Retuns the local state (global state -> homework -> tasks). Give the global state as parameter. */
const localState = globalState => homeworkConfig.getState(globalState).tasks;

// ADAPTER ----------------------------------------------------------------------------------------

export interface IHomeworkTasksBackend {
  _id: string;
  title: string;
  thumbnail: any; // unknown but unused here (I guess it's a string that represent the URL)
  trashed: number;
  owner: {
    userId: string;
    displayName: string;
  };
  shared?: ({
    [key: string]: boolean | string | undefined;
  } & {
    [key in 'userId' | 'groupId']: string;
  })[];
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
      _id: string;
    }[];
  }[];
}

const homeworkTasksAdapter: (data: IHomeworkTasksBackend) => IHomeworkTasks = data => {
  // Get all the backend homeworkDays.
  if (!data) return { byId: {}, ids: [] };
  const dataDays = data.data;
  const ret: IHomeworkTasks = {
    byId: {},
    diaryInfo: {},
    ids: [],
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
        finished: false,
        id: indextask.toString(),
        taskId: itemtask._id,
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
    // What is name ??? Baby don't hurt me ! title duplicate ?
    id: data._id,

    name: data.title,
    owner: data.owner,
    shared: data.shared,
    thumbnail: data.thumbnail,
    title: data.title,
  };
  return ret;
};

export interface IHomeworkTaskStatusBackend {
  userId: string;
  homeworkId: string;
  entryId: string;
  finished: boolean;
}

export type IHomeworkTaskStatusesBackend = IHomeworkTaskStatusBackend[];

const homeworkTaskStatusesAdapter: (data: IHomeworkTaskStatusesBackend) => IHomeworkTaskStatuses = data => {
  const ret = data.map(taskStatus => ({ entryId: taskStatus.entryId, finished: taskStatus.finished }));
  return ret;
};

const homeworkTasksData = (tasksData: IHomeworkTasks, taskStatusesData: IHomeworkTaskStatuses) => {
  const ret = tasksData;
  taskStatusesData?.forEach(taskStatus => {
    ret?.ids?.forEach(id => {
      ret?.byId[id]?.tasks?.ids?.forEach(taskId => {
        const task = ret?.byId[id]?.tasks?.byId[taskId];
        if (taskStatus?.entryId === task?.taskId) task.finished = taskStatus?.finished;
      });
    });
  });
  return ret;
};

// ACTION LIST ------------------------------------------------------------------------------------

export const actionTypes = asyncActionTypes(homeworkConfig.namespaceActionType('TASKS'));

export function homeworkTasksInvalidated(diaryId: string) {
  return { diaryId, type: actionTypes.invalidated };
}

export function homeworkTasksRequested(diaryId: string) {
  return { diaryId, type: actionTypes.requested };
}

export function homeworkTasksReceived(diaryId: string, data: IHomeworkTasks) {
  return {
    data,

    diaryId,
    receivedAt: Date.now(),
    type: actionTypes.received,
  };
}

export function homeworkTasksFetchError(diaryId: string, errmsg: string) {
  return { diaryId, errmsg, error: true, type: actionTypes.fetchError };
}

// THUNKS -----------------------------------------------------------------------------------------

/**
 * Calls a fetch operation to get homework tasks from the backend for the given diaryId.
 * Dispatches HOMEWORK_TASKS_REQUESTED, HOMEWORK_TASKS_RECEIVED, and HOMEWORK_TASKS_FETCH_ERROR if an error occurs.
 */
export function fetchHomeworkTasks(diaryId: string, entryId?: string, repeatId?: string) {
  return async dispatch => {
    dispatch(homeworkTasksRequested(diaryId));

    try {
      const getTaskStatusesQueryParams = () => {
        if (!entryId && !repeatId) return '';
        let queryParams = '?';
        if (entryId) queryParams = `${queryParams}entryid=${entryId}`;
        if (repeatId) queryParams = entryId ? `${queryParams}&repeatid=${repeatId}` : `${queryParams}repeatid=${repeatId}`;
        return queryParams;
      };
      const taskStatusesData = await asyncGetJson(
        `/homeworks/${diaryId}/entry/status${getTaskStatusesQueryParams()}`,
        homeworkTaskStatusesAdapter
      );
      const tasksData = await asyncGetJson(`/homeworks/get/${diaryId}`, homeworkTasksAdapter);
      const data = homeworkTasksData(tasksData, taskStatusesData);
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
    diaryId
  );
}
