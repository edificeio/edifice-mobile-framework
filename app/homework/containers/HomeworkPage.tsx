import * as React from "react";
import { connect } from "react-redux";
import {
  HomeworkPage,
  IHomeworkPageDataProps,
  IHomeworkPageEventProps,
  IHomeworkPageProps
} from "../components/pages/HomeworkPage";

import { fetchHomeworkListIfNeeded } from "../actions/list";
import { homeworkTaskSelected } from "../actions/selectedTask";
import { fetchHomeworkTasks } from "../actions/tasks";

const mapStateToProps: (state: any) => IHomeworkPageDataProps = state => {
  // Extract data from state
  const localState = state.homework;
  const selectedHomeworkId = localState.selected;
  const currentHomeworkTasks = localState.tasks[selectedHomeworkId];
  if (!currentHomeworkTasks)
    return {
      didInvalidate: true,
      homeworkId: null,
      homeworkTasksByDay: null,
      isFetching: false,
      lastUpdated: null
    };
  const { didInvalidate, isFetching, lastUpdated } = currentHomeworkTasks;

  // Flatten two-dimensional IOrderedArrayById
  const homeworkTasksByDay = currentHomeworkTasks.data.ids.map(homeworkId => ({
    date: currentHomeworkTasks.data.byId[homeworkId].date,
    id: homeworkId,
    tasks: currentHomeworkTasks.data.byId[homeworkId].tasks.ids.map(
      taskId => currentHomeworkTasks.data.byId[homeworkId].tasks.byId[taskId]
    )
  }));

  // Format props
  return {
    didInvalidate,
    homeworkId: selectedHomeworkId,
    homeworkTasksByDay,
    isFetching,
    lastUpdated
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
    this.props.dispatch(fetchHomeworkListIfNeeded());
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(HomeworkPageContainer);
