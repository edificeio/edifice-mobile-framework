import * as React from "react";
import { connect } from "react-redux";
import {
  HomeworkFilterPage,
  IHomeworkFilterPageDataProps,
  IHomeworkFilterPageEventProps,
  IHomeworkFilterPageProps
} from "../components/pages/HomeworkFilterPage";

import {
  fetchHomeworkDiaryList,
  fetchHomeworkDiaryListIfNeeded
} from "../actions/diaryList";
import { homeworkDiarySelected } from "../actions/selectedDiary";

import { Tracking } from "../../tracking/TrackingManager";

const mapStateToProps: (state: any) => IHomeworkFilterPageDataProps = state => {
  // Extract data from state
  const localState = state.homework;
  const homeworkDiaryList = localState.diaryList;
  if (!homeworkDiaryList.data)
    return {
      diaryList: [],
      isFetching: homeworkDiaryList.isFetching,
      selectedDiaryId: localState.selected
    };
  const flatHomeworkDiaryList = Object.getOwnPropertyNames(
    homeworkDiaryList.data
  ).map(diaryId => ({
    id: diaryId,
    name: homeworkDiaryList.data[diaryId].name,
    title: homeworkDiaryList.data[diaryId].title
  }));

  // Format props
  return {
    diaryList: flatHomeworkDiaryList,
    isFetching: homeworkDiaryList.isFetching,
    selectedDiaryId: localState.selectedDiary
  };
};

const mapDispatchToProps: (
  dispatch: any
) => IHomeworkFilterPageEventProps = dispatch => {
  return {
    dispatch,
    onRefresh: () => dispatch(fetchHomeworkDiaryList()),
    onSelect: (diaryId, trackingKeyword) => {
      Tracking.logEvent("selectNotebook", {
        tab: trackingKeyword || "undefined"
      });
      dispatch(homeworkDiarySelected(diaryId));
    }
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
    this.props.dispatch(fetchHomeworkDiaryListIfNeeded());
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(HomeworkFilterPageContainer);
