import { connect } from "react-redux";
import {
  DiaryFilterPage,
  IDiaryFilterPageProps
} from "../components/DiaryFilterPage";

const mapStateToProps: (state: any) => IDiaryFilterPageProps = state => {
  // Extract data from state
  const localState = state.diary;
  const diaryList = localState.list;
  if (!diaryList.data)
    return {
      diaryList: [],
      isFetching: diaryList.isFetching,
      selectedDiaryId: localState.selected
    };
  const flatDiaryList = Object.getOwnPropertyNames(diaryList.data).map(
    diaryId => ({
      id: diaryId,
      name: diaryList.data[diaryId].name,
      title: diaryList.data[diaryId].title
    })
  );
  // Format props
  return {
    diaryList: flatDiaryList,
    isFetching: diaryList.isFetching,
    selectedDiaryId: localState.selected
  };
};

export default connect(mapStateToProps)(DiaryFilterPage);
