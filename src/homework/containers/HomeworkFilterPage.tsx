import * as React from "react";
import { connect } from "react-redux";
import {
  HomeworkFilterPage,
  IHomeworkFilterPageDataProps,
  IHomeworkFilterPageEventProps,
  IHomeworkFilterPageProps
} from "../components/HomeworkFilterPage";
import I18n from "i18n-js";

import {
  fetchHomeworkDiaryList,
  fetchHomeworkDiaryListIfNeeded
} from "../actions/diaryList";
import { homeworkDiarySelected } from "../actions/selectedDiary";

import { alternativeNavScreenOptions } from "../../navigation/helpers/navScreenOptions";
import { NavigationScreenProp } from "react-navigation";
import { HeaderBackAction } from "../../ui/headers/NewHeader";
import withViewTracking from "../../infra/tracker/withViewTracking";

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
  const { didInvalidate, isFetching } = homeworkDiaryList;

  // Format props
  return {
    diaryList: flatHomeworkDiaryList,
    didInvalidate,
    isFetching,
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
      dispatch(homeworkDiarySelected(diaryId));
    }
  };
};

class HomeworkFilterPageContainer extends React.PureComponent<
  IHomeworkFilterPageProps & { dispatch: any },
  {}
> {
  static navigationOptions = ({ navigation }: { navigation: NavigationScreenProp<{}> }) => {
    return alternativeNavScreenOptions(
      {
        title: I18n.t("homework-select"),
        headerLeft: <HeaderBackAction navigation={navigation} />
      },
      navigation
    );
  };

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

const HomeworkFilterPageContainerConnected = connect(
  mapStateToProps,
  mapDispatchToProps
)(HomeworkFilterPageContainer);

export default withViewTracking("homework/filter")(HomeworkFilterPageContainerConnected);
