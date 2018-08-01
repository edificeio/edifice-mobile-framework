import { connect } from "react-redux";
import {
  DiaryTaskPageHeader,
  IDiaryTaskPageHeaderProps
} from "../components/DiaryTaskPageHeader";

const mapStateToProps: (state: any) => IDiaryTaskPageHeaderProps = state => {
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
    title: taskInfos.title
  };
};

export default connect(mapStateToProps)(DiaryTaskPageHeader);
