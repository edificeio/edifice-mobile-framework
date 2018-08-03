import * as React from "react";
import { connect } from "react-redux";
import {
  HomeworkFilterPage,
  IHomeworkFilterPageDataProps,
  IHomeworkFilterPageEventProps,
  IHomeworkFilterPageProps
} from "../components/pages/HomeworkFilterPage";

import { fetchHomeworkList, fetchHomeworkListIfNeeded } from "../actions/list";
import { homeworkSelected } from "../actions/selected";

const mapStateToProps: (state: any) => IHomeworkFilterPageDataProps = state => {
  // Extract data from state
  const localState = state.homework;
  const homeworkList = localState.list;
  if (!homeworkList.data)
    return {
      diaryList: [],
      isFetching: homeworkList.isFetching,
      selectedDiaryId: localState.selected
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
    diaryList: flatHomeworkList,
    isFetching: homeworkList.isFetching,
    selectedDiaryId: localState.selected
  };
};

const mapDispatchToProps: (
  dispatch: any
) => IHomeworkFilterPageEventProps = dispatch => {
  return {
    dispatch,
    onRefresh: () => dispatch(fetchHomeworkList()),
    onSelect: diaryId => dispatch(homeworkSelected(diaryId))
  };
};

class HomeworkFilterPageContainer extends React.Component<
  IHomeworkFilterPageProps & { dispatch: any },
  {}
> {
  constructor(props) {
    super(props);
  }

  public render() {
    return <HomeworkFilterPage {...this.props} />;
  }

  public componentDidMount() {
    this.props.dispatch(fetchHomeworkListIfNeeded());
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(HomeworkFilterPageContainer);
