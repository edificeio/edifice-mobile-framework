import * as React from "react";
import { connect } from "react-redux";
import {
  HomeworkPage,
  IHomeworkPageDataProps,
  IHomeworkPageEventProps,
  IHomeworkPageProps
} from "../components/HomeworkPage";
import I18n from "i18n-js";

import {
  fetchHomeworkDiaryList
} from "../actions/diaryList";
import { homeworkTaskSelected } from "../actions/selectedTask";
import { fetchHomeworkTasks } from "../actions/tasks";

import { NavigationScreenProp, NavigationFocusInjectedProps } from "react-navigation";
import { standardNavScreenOptions } from "../../navigation/helpers/navScreenOptions";
import { HeaderAction, HeaderBackAction } from "../../ui/headers/NewHeader";
import withViewTracking from "../../infra/tracker/withViewTracking";

const mapStateToProps: (state: any) => IHomeworkPageDataProps = state => {
  // Extract data from state
  const localState = state.homework;
  const selectedDiaryId = localState.selectedDiary;
  const currentDiaryTasks = localState.tasks[selectedDiaryId];
  const diaryListData = localState.diaryList.data;
  const diaryInformation = diaryListData[selectedDiaryId];
  if (!selectedDiaryId || !currentDiaryTasks)
    if (localState.diaryList.didInvalidate)
      return {
        /* Initial props if there is not initialisation yet.
        For the hack, we consider app is already fetching to avoid a screen blinking. */
        diaryId: undefined,
        didInvalidate: true,
        isFetching: true,
        lastUpdated: undefined,
        tasksByDay: undefined
      };
    else {
      return {
        /* Here is an mepty screen displayer */
        diaryId: undefined,
        didInvalidate: true,
        isFetching: false,
        lastUpdated: undefined,
        tasksByDay: undefined
      };
    }
  const { didInvalidate, isFetching, lastUpdated } = currentDiaryTasks;

  // Flatten two-dimensional IOrderedArrayById
  const tasksByDay = currentDiaryTasks.data.ids.map(diaryId => ({
    date: currentDiaryTasks.data.byId[diaryId].date,
    id: diaryId,
    tasks: currentDiaryTasks.data.byId[diaryId].tasks.ids.map(
      taskId => currentDiaryTasks.data.byId[diaryId].tasks.byId[taskId]
    )
  }));

  // Format props
  return {
    diaryId: selectedDiaryId,
    didInvalidate,
    isFetching,
    lastUpdated,
    tasksByDay,
    diaryListData,
    diaryInformation
  };
};

const mapDispatchToProps: (
  dispatch: any
) => IHomeworkPageEventProps = dispatch => {
  return {
    dispatch,
    onRefresh: diaryId => {
      dispatch(fetchHomeworkTasks(diaryId));
    },
    onScrollBeginDrag: () => {},
    onSelect: (diaryId, date, itemId) => {
      dispatch(homeworkTaskSelected(diaryId, date, itemId));
    }
  };
};

class HomeworkPageContainer extends React.PureComponent<
  IHomeworkPageProps & NavigationFocusInjectedProps & { dispatch: any },
  {}
> {
  static navigationOptions = ({ navigation }: { navigation: NavigationScreenProp<{}> }) => {
    const diaryTitle = navigation.getParam("diaryTitle");
    const hasMultipleDiaries = navigation.getParam("hasMultipleDiaries");

    return standardNavScreenOptions(
      {
        title: diaryTitle || I18n.t("Homework"),
        headerLeft: <HeaderBackAction navigation={navigation} />,
        headerRight: hasMultipleDiaries
          ? <HeaderAction
              name="filter"
              onPress={() => navigation.navigate("HomeworkFilter")}
            />
          : null
      },
      navigation
    );
  }

  constructor(props) {
    super(props);
  }

  public render() {
    return <HomeworkPage {...this.props} />;
  }

  public async componentDidMount() {
    const { dispatch } = this.props;
    dispatch(fetchHomeworkDiaryList());
  }

  public componentDidUpdate(prevProps: IHomeworkPageProps) {
    const { diaryListData, diaryInformation, navigation } = this.props
    if (diaryInformation !== prevProps.diaryInformation) {
      navigation.setParams({ diaryTitle: diaryInformation?.title })
    }
    if (diaryListData !== prevProps.diaryListData) {
      const hasMultipleDiaries = diaryListData && Object.keys(diaryListData).length > 1;
      navigation.setParams({ hasMultipleDiaries });
    }
  }
}

const HomeworkPageContainerConnected = connect(
  mapStateToProps,
  mapDispatchToProps
)(HomeworkPageContainer);

export default withViewTracking("homework")(HomeworkPageContainerConnected);
