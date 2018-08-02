import { connect } from "react-redux";
import {
  HomeworkFilterPage,
  IHomeworkFilterPageProps
} from "../components/HomeworkFilterPage";

const mapStateToProps: (state: any) => IHomeworkFilterPageProps = state => {
  // Extract data from state
  const localState = state.homework;
  const homeworkList = localState.list;
  if (!homeworkList.data)
    return {
      homeworkList: [],
      isFetching: homeworkList.isFetching,
      selectedHomeworkId: localState.selected
    };
  const flatHomeworkList = Object.getOwnPropertyNames(homeworkList.data).map(
    homeworkId => ({
      id: homeworkId,
      name: homeworkList.data[homeworkId].name,
      title: homeworkList.data[homeworkId].title
    })
  );
  // Format props
  return {
    homeworkList: flatHomeworkList,
    isFetching: homeworkList.isFetching,
    selectedHomeworkId: localState.selected
  };
};

export default connect(mapStateToProps)(HomeworkFilterPage);
