import I18n from "i18n-js";
import * as React from "react";
import { View } from "react-native";
import { NavigationScreenProp } from "react-navigation";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";

import { getSessionInfo } from "../../../App";
import withViewTracking from "../../../infra/tracker/withViewTracking";
import { standardNavScreenOptions } from "../../../navigation/helpers/navScreenOptions";
import { INavigationProps } from "../../../types";
import { HeaderBackAction } from "../../../ui/headers/NewHeader";
import { getSelectedChild, getSelectedChildStructure } from "../../viesco/state/children";
import { getPersonnelListState } from "../../viesco/state/personnel";
import { getSubjectsListState } from "../../viesco/state/subjects";
import { fetchChildHomeworkAction, fetchHomeworkListAction, updateHomeworkProgressAction } from "../actions/homeworks";
import { fetchChildSessionAction, fetchSessionListAction } from "../actions/sessions";
import HomeworkList from "../components/HomeworkList";
import { getHomeworksListState } from "../state/homeworks";
import { getSessionsListState } from "../state/sessions";

type HomeworkListProps = {
  homeworks: any;
  sessions: any;
  personnel: any;
  subjects: any;
  childId: string;
  structureId: string;
  fetchHomeworks: any;
  fetchSessions: any;
  fetchChildHomeworks: any;
  fetchChildSessions: any;
  updateHomeworkProgress?: any;
  isFetchingHomework: boolean;
  isFetchingSession: boolean;
} & INavigationProps;

class HomeworkListRelativeContainer extends React.PureComponent<HomeworkListProps> {
  static navigationOptions = ({ navigation }: { navigation: NavigationScreenProp<object> }) => {
    const diaryTitle = navigation.getParam("diaryTitle");

    return standardNavScreenOptions(
      {
        title: diaryTitle || I18n.t("Homework"),
        headerLeft: () => <HeaderBackAction navigation={navigation} />,
        headerRight: () => <View />,
        headerStyle: {
          backgroundColor: "#2BAB6F",
        },
      },
      navigation
    );
  };

  private fetchHomeworks = (startDate, endDate) =>
    getSessionInfo().type === "Student"
      ? this.props.fetchHomeworks(this.props.structureId, startDate, endDate)
      : this.props.fetchChildHomeworks(this.props.childId, this.props.structureId, startDate, endDate);

  private fetchSessions = (startDate, endDate) =>
    getSessionInfo().type === "Student"
      ? this.props.fetchSessions(this.props.structureId, startDate, endDate)
      : this.props.fetchChildSessions(this.props.childId, startDate, endDate);

  public render() {
    return (
      <HomeworkList
        navigation={this.props.navigation}
        personnel={this.props.personnel}
        subjects={this.props.subjects}
        isFetchingHomework={this.props.isFetchingHomework}
        isFetchingSession={this.props.isFetchingSession}
        updateHomeworkProgress={this.props.updateHomeworkProgress}
        homeworks={this.props.homeworks}
        sessions={this.props.sessions}
        onRefreshHomeworks={this.fetchHomeworks}
        onRefreshSessions={this.fetchSessions}
        childId={this.props.childId}
      />
    );
  }
}

const mapStateToProps: (state: any) => any = state => {
  const homeworksState = getHomeworksListState(state);
  const sessionsState = getSessionsListState(state);
  const subjectsState = getSubjectsListState(state);
  const personnelState = getPersonnelListState(state);

  return {
    homeworks: homeworksState.data,
    sessions: sessionsState.data,
    subjects: subjectsState.data,
    personnel: personnelState.data,
    isFetchingHomework: homeworksState.isFetching || subjectsState.isFetching || personnelState.isFetching,
    isFetchingSession: sessionsState.isFetching || subjectsState.isFetching || personnelState.isFetching,
    childId: getSelectedChild(state).id,
    structureId:
      getSessionInfo().type === "Student"
        ? getSessionInfo().administrativeStructures[0].id
        : getSelectedChildStructure(state)?.id,
  };
};

const mapDispatchToProps = (dispatch: any, props: HomeworkListProps) => {
  return bindActionCreators(
    {
      fetchChildHomeworks: fetchChildHomeworkAction,
      fetchChildSessions: fetchChildSessionAction,
      fetchHomeworks: fetchHomeworkListAction,
      fetchSessions: fetchSessionListAction,
      updateHomeworkProgress: updateHomeworkProgressAction,
    },
    dispatch
  );
};

export default withViewTracking("viesco/cdt")(
  connect(mapStateToProps, mapDispatchToProps)(HomeworkListRelativeContainer)
);
