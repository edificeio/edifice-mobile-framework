import I18n from "i18n-js";
import * as React from "react";
import { NavigationScreenProp } from "react-navigation";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";

import { standardNavScreenOptions } from "../../../navigation/helpers/navScreenOptions";
import { HeaderBackAction } from "../../../ui/headers/NewHeader";
import { getPersonnelListState } from "../../viesco/state/personnel";
import { getSubjectsListState } from "../../viesco/state/subjects";
import { fetchChildHomeworkAction, fetchHomeworkListAction, updateHomeworkProgressAction } from "../actions/homeworks";
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
        headerStyle: {
          backgroundColor: "#2BAB6F",
        },
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

export default connect(mapStateToProps, mapDispatchToProps)(HomeworkListRelativeContainer);
