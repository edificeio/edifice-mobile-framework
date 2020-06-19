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
import { fetchChildHomeworkAction } from "../actions/homeworks";
import { fetchChildSessionAction } from "../actions/sessions";
import HomeworkListRelative from "../components/HomeworkListRelative";
import { getHomeworksListState } from "../state/homeworks";
import { getSessionsListState } from "../state/sessions";

class HomeworkListRelativeContainer extends React.PureComponent<{ navigation: { navigate } }, any> {
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
    return <HomeworkListRelative {...this.props} />;
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
    fetchHomeworks: (childId, structureId, startDate, endDate) =>
      dispatch(fetchChildHomeworkAction(childId, structureId, startDate, endDate)),
    fetchSessions: (childId, startDate, endDate) => dispatch(fetchChildSessionAction(childId, startDate, endDate)),
    fetchPersonnel: structureId => dispatch(fetchPersonnelListAction(structureId)),
    fetchSubjects: structureId => dispatch(fetchSubjectListAction(structureId)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(HomeworkListRelativeContainer);
