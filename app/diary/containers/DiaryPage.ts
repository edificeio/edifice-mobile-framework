import { connect } from "react-redux";
import { DiaryPage, IDiaryPageProps } from "../components/DiaryPage";

const mapStateToProps: (state: any) => IDiaryPageProps = state => {
  // Extract data from state
  const localState = state.diary;
  const selectedDiaryId = localState.selected;
  const currentDiaryTasks = localState.tasks[selectedDiaryId];
  if (!currentDiaryTasks)
    return {
      diaryId: null,
      diaryTasksByDay: null,
      didInvalidate: true,
      isFetching: false,
      lastUpdated: null
    };
  const { didInvalidate, isFetching, lastUpdated } = currentDiaryTasks;

  // Flatten two-dimensional IOrderedArrayById
  const diaryTasksByDay = currentDiaryTasks.data.ids.map(diaryId => ({
    date: currentDiaryTasks.data.byId[diaryId].date,
    id: diaryId,
    tasks: currentDiaryTasks.data.byId[diaryId].tasks.ids.map(
      taskId => currentDiaryTasks.data.byId[diaryId].tasks.byId[taskId]
    )
  }));

  // Format props
  return {
    diaryId: selectedDiaryId,
    diaryTasksByDay,
    didInvalidate,
    isFetching,
    lastUpdated
  };
};

export default connect(mapStateToProps)(DiaryPage);
