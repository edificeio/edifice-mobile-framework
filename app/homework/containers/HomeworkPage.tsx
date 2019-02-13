import * as React from "react";
import { AsyncStorage } from "react-native";
import { connect } from "react-redux";
import {
  HomeworkPage,
  IHomeworkPageDataProps,
  IHomeworkPageEventProps,
  IHomeworkPageProps
} from "../components/pages/HomeworkPage";

import { fetchHomeworkDiaryListIfNeeded } from "../actions/diaryList";
import { homeworkTaskSelected } from "../actions/selectedTask";
import { fetchHomeworkTasks } from "../actions/tasks";

import Tracking from "../../tracking/TrackingManager";
import homeworkDiarySelected from "../actions/selectedDiary";
import { clearFilterConversation } from "../../mailbox/actions/filter";

const mapStateToProps: (state: any) => IHomeworkPageDataProps = state => {
  // Extract data from state
  const localState = state.homework;
  const selectedDiaryId = localState.selectedDiary;
  const currentDiaryTasks = localState.tasks[selectedDiaryId];
  if (!selectedDiaryId || !currentDiaryTasks)
    if (localState.diaryList.didInvalidate)
      return {
        /* Initial props if there is not initialisation yet.
        For the hack, we consider app is already fetching to avoid a screen blinking. */
        diaryId: null,
        didInvalidate: true,
        isFetching: true,
        lastUpdated: null,
        tasksByDay: null
      };
    else {
      return {
        /* Here is an mepty screen displayer */
        diaryId: null,
        didInvalidate: true,
        isFetching: false,
        lastUpdated: null,
        tasksByDay: null
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
    tasksByDay
  };
};

const mapDispatchToProps: (
  dispatch: any
) => IHomeworkPageEventProps = dispatch => {
  return {
    dispatch,
    onFocus: () => clearFilterConversation(dispatch)(),
    onRefresh: diaryId => {
      Tracking.logEvent("refreshNotebook");
      dispatch(fetchHomeworkTasks(diaryId));
    },
    onScrollBeginDrag: () => {
      Tracking.logEvent("scrollNotebook");
    },
    onSelect: (diaryId, date, itemId) => {
      Tracking.logEvent("readHomework");
      dispatch(homeworkTaskSelected(diaryId, date, itemId));
    }
  };
};

class HomeworkPageContainer extends React.PureComponent<
  IHomeworkPageProps & { dispatch: any },
  {}
> {
  constructor(props) {
    super(props);
  }

  public render() {
    return <HomeworkPage {...this.props} />;
  }

  public async componentDidMount() {
    await this.loadSelectedDiary();
    this.props.dispatch(fetchHomeworkDiaryListIfNeeded());
    this.props.onFocus();
    this.didFocusSubscription = this.props.navigation.addListener(
      "didFocus",
      payload => {
        this.props.onFocus();
      }
    );
  }

  private didFocusSubscription;
  public componentWillUnmount() {
    this.didFocusSubscription.remove();
  }

  private async loadSelectedDiary() {
    const selectedId = await AsyncStorage.getItem("diary-selected");
    if (selectedId) this.props.dispatch(homeworkDiarySelected(selectedId));
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(HomeworkPageContainer);
