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
import { fetchChildHomeworkAction, fetchHomeworkListAction } from "../actions/homeworks";
import { fetchChildSessionAction, fetchSessionListAction } from "../actions/sessions";
import HomeworkList from "../components/HomeworkList";
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
    return <HomeworkList {...this.props} />;
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
    fetchChildHomeworks: (childId, structureId, startDate, endDate) =>
      dispatch(fetchChildHomeworkAction(childId, structureId, startDate, endDate)),
    fetchChildSessions: (childId, startDate, endDate) => dispatch(fetchChildSessionAction(childId, startDate, endDate)),
    fetchHomeworks: (structureId, startDate, endDate) =>
      dispatch(fetchHomeworkListAction(structureId, startDate, endDate)),
    fetchSessions: (structureId, startDate, endDate) =>
      dispatch(fetchSessionListAction(structureId, startDate, endDate)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(HomeworkListRelativeContainer);
