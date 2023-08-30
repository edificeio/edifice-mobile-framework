import * as React from 'react';
import { connect } from 'react-redux';

import { getSession } from '~/framework/modules/auth/reducer';
import { fetchHomeworkTasks } from '~/framework/modules/homework/actions/tasks';
import HomeworkTaskListScreen, {
  IHomeworkTaskListScreenDataProps,
  IHomeworkTaskListScreenEventProps,
  IHomeworkTaskListScreenProps,
} from '~/framework/modules/homework/components/HomeworkTaskListScreen';

const mapStateToProps: (state: any) => IHomeworkTaskListScreenDataProps = state => {
  // Extract data from state
  const session = getSession();
  const localState = state.homework;
  const selectedDiaryId = localState.selectedDiary;
  const currentDiaryTasks = localState.tasks[selectedDiaryId];
  const diaryListData = localState.diaryList.data;
  const diaryInformation = diaryListData[selectedDiaryId];
  if (!selectedDiaryId || !currentDiaryTasks)
    if (localState.diaryList.didInvalidate)
      return {
        /* Initial props if there is not initialisation yet.
        For the hack, we consider app is already fetching to avoid a screen blinking. */
        diaryId: undefined,
        didInvalidate: true,
        isFetching: true,
        lastUpdated: undefined,
        tasksByDay: undefined,
        session,
      };
    else {
      return {
        /* Here is an empty screen displayer */
        diaryId: undefined,
        didInvalidate: true,
        isFetching: false,
        lastUpdated: undefined,
        tasksByDay: undefined,
        session,
      };
    }
  const { didInvalidate, isFetching, lastUpdated, error, errmsg } = currentDiaryTasks;

  // Flatten two-dimensional IOrderedArrayById
  const tasksByDay = currentDiaryTasks.data.ids.map(diaryId => ({
    date: currentDiaryTasks.data.byId[diaryId].date,
    id: diaryId,
    tasks: currentDiaryTasks.data.byId[diaryId].tasks.ids.map(taskId => currentDiaryTasks.data.byId[diaryId].tasks.byId[taskId]),
  }));

  // Format props
  return {
    diaryId: selectedDiaryId,
    didInvalidate,
    isFetching,
    lastUpdated,
    error,
    errmsg,
    tasksByDay,
    diaryListData,
    diaryInformation,
    session,
  };
};

const mapDispatchToProps: (dispatch: any) => IHomeworkTaskListScreenEventProps = dispatch => {
  return {
    dispatch,
    onRefresh: diaryId => {
      dispatch(fetchHomeworkTasks(diaryId));
    },
  };
};

export interface HomeworkTaskListScreenNavigationParams {
  createdEntryId?: string;
}

class HomeworkTaskListScreenContainer extends React.PureComponent<IHomeworkTaskListScreenProps, object> {
  render() {
    return <HomeworkTaskListScreen {...this.props} />;
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(HomeworkTaskListScreenContainer);
