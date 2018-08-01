import { connect } from "react-redux";
import {
  DiaryTaskPage,
  IDiaryTaskPageProps
} from "../components/DiaryTaskPage";

const mapStateToProps: (state: any) => IDiaryTaskPageProps = state => {
  // Extract data from state
  const localState = state.diary.selectedTask;
  const { diaryId, date, taskId } = localState;
  // Get diary, then day, then task content
  const diaryDays = state.diary.tasks[diaryId];
  if (!diaryDays) return {}; // this case shouldn't occur.
  const dateId = date.format("YYYY-MM-DD");
  const diaryTasksThisDay = diaryDays.data.byId[dateId];
  if (!diaryTasksThisDay) return {}; // this case shouldn't occur.
  const taskInfos = diaryTasksThisDay.tasks.byId[taskId];
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

export default connect(mapStateToProps)(DiaryTaskPage);
