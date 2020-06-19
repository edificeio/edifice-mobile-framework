import I18n from "i18n-js";
import * as React from "react";
import { NavigationScreenProp } from "react-navigation";
import { connect } from "react-redux";

import { standardNavScreenOptions } from "../../../navigation/helpers/navScreenOptions";
import { HeaderAction } from "../../../ui/headers/Header";
import { HeaderBackAction } from "../../../ui/headers/NewHeader";
import { fetchPersonnelListAction } from "../../viesco/actions/personnel";
import { fetchSubjectListAction } from "../../viesco/actions/subjects";
import { getPersonnelListState } from "../../viesco/state/personnel";
import { getSubjectsListState } from "../../viesco/state/subjects";
import { fetchHomeworkListAction } from "../actions/homeworks";
import { fetchSessionListAction } from "../actions/sessions";
import HomeworkListStudent from "../components/HomeworkListStudent";
import { getHomeworksListState } from "../state/homeworks";
import { getSessionsListState } from "../state/sessions";

class HomeworkListStudentContainer extends React.PureComponent<{ navigation: { navigate } }, any> {
  static navigationOptions = ({ navigation }: { navigation: NavigationScreenProp<object> }) => {
    const diaryTitle = navigation.getParam("diaryTitle");

    return standardNavScreenOptions(
      {
        title: diaryTitle || I18n.t("Homework"),
        headerLeft: <HeaderBackAction navigation={navigation} />,
        headerRight: <HeaderAction name="filter" onPress={() => navigation.navigate("HomeworkFilter")} />,
      },
      navigation
    );
  };

  public render() {
    return <HomeworkListStudent {...this.props} />;
  }
}

const mapStateToProps: (state: any) => any = state => {
  return {
    homeworks: getHomeworksListState(state),
    sessions: getSessionsListState(state),
    personnel: getPersonnelListState(state),
    subjects: getSubjectsListState(state),
  };
};

const mapDispatchToProps: (dispatch: any) => any = dispatch => {
  return {
    fetchHomeworks: (structureId, startDate, endDate) =>
      dispatch(fetchHomeworkListAction(structureId, startDate, endDate)),
    fetchSessions: (structureId, startDate, endDate) =>
      dispatch(fetchSessionListAction(structureId, startDate, endDate)),
    fetchPersonnel: structureId => dispatch(fetchPersonnelListAction(structureId)),
    fetchSubjects: structureId => dispatch(fetchSubjectListAction(structureId)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(HomeworkListStudentContainer);
