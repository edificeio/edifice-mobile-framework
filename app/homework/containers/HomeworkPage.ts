import { connect } from "react-redux";
import { HomeworkPage, IHomeworkPageProps } from "../components/HomeworkPage";

const mapStateToProps: (state: any) => IHomeworkPageProps = state => {
  // Extract data from state
  const localState = state.homework;
  const selectedHomeworkId = localState.selected;
  const currentHomeworkTasks = localState.tasks[selectedHomeworkId];
  if (!currentHomeworkTasks)
    return {
      homeworkId: null,
      homeworkTasksByDay: null,
      didInvalidate: true,
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
    homeworkId: selectedHomeworkId,
    homeworkTasksByDay,
    didInvalidate,
    isFetching,
    lastUpdated
  };
};

export default connect(mapStateToProps)(HomeworkPage);
