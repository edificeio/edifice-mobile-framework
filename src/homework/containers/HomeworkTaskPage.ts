import { connect } from "react-redux";
import {
  HomeworkTaskPage,
  IHomeworkTaskPageDataProps
} from "../components/HomeworkTaskPage";
import withViewTracking from "../../infra/tracker/withViewTracking";

const mapStateToProps: (state: any) => IHomeworkTaskPageDataProps = state => {
  // Extract data from state
  const localState = state.homework.selectedTask;
  const { diaryId, date, taskId } = localState;
  // Get homework, then day, then task content
  const homeworkDays = state.homework.tasks[diaryId];
  if (!homeworkDays) return {}; // this case shouldn't occur.
  const dateId = date.format("YYYY-MM-DD");
  const homeworkTasksThisDay = homeworkDays.data.byId[dateId];
  if (!homeworkTasksThisDay) return {}; // this case shouldn't occur.
  const taskInfos = homeworkTasksThisDay.tasks.byId[taskId];
  if (!taskInfos) return {}; // this case shouldn't occur.

  // Format props
  return {
    date,
    diaryId,
    taskContent: taskInfos.content,
    taskId,
    taskTitle: taskInfos.title
  };
};

export default withViewTracking("homework/task")(connect(mapStateToProps)(HomeworkTaskPage));
