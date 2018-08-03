import * as React from "react";
import { connect } from "react-redux";
import {
  HomeworkPage,
  IHomeworkPageDataProps,
  IHomeworkPageEventProps,
  IHomeworkPageProps
} from "../components/pages/HomeworkPage";

import { fetchHomeworkDiaryListIfNeeded } from "../actions/list";
import { homeworkTaskSelected } from "../actions/selectedTask";
import { fetchHomeworkTasks } from "../actions/tasks";

const mapStateToProps: (state: any) => IHomeworkPageDataProps = state => {
  // Extract data from state
  const localState = state.homework;
  const selectedDiaryId = localState.selectedDiary;
  const currentDiaryTasks = localState.tasks[selectedDiaryId];
  if (!currentDiaryTasks)
    return {
      diaryId: null,
      didInvalidate: true,
      isFetching: false,
      lastUpdated: null,
      tasksByDay: null
    };
  const { didInvalidate, isFetching, lastUpdated } = currentDiaryTasks;

  // Flatten two-dimensional IOrderedArrayById
  const tasksByDay = currentDiaryTasks.data.ids.map(diaryId => ({
    date: currentDiaryTasks.data.byId[diaryId].date,
    id: diaryId,
    tasks: currentDiaryTasks.data.byId[diaryId].tasks.ids.map(
      taskId => currentDiaryTasks.data.byId[diaryId].tasks.byId[taskId]
    )
  }));

  // Format props
  return {
    diaryId: selectedDiaryId,
    didInvalidate,
    isFetching,
    lastUpdated,
    tasksByDay
  };
};

const mapDispatchToProps: (
  dispatch: any
) => IHomeworkPageEventProps = dispatch => {
  return {
    dispatch,
    onRefresh: diaryId => dispatch(fetchHomeworkTasks(diaryId)),
    onSelect: (diaryId, date, itemId) =>
      dispatch(homeworkTaskSelected(diaryId, date, itemId))
  };
};

class HomeworkPageContainer extends React.Component<
  IHomeworkPageProps & { dispatch: any },
  {}
> {
  constructor(props) {
    super(props);
  }

  public render() {
    return <HomeworkPage {...this.props} />;
  }

  public componentDidMount() {
    this.props.dispatch(fetchHomeworkDiaryListIfNeeded());
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(HomeworkPageContainer);
