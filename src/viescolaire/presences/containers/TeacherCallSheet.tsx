import I18n from "i18n-js";
import * as React from "react";
import { NavigationScreenProp } from "react-navigation";
import { connect } from "react-redux";

import { alternativeNavScreenOptions } from "../../../navigation/helpers/navScreenOptions";
import { HeaderBackAction } from "../../../ui/headers/NewHeader";
import { fetchClassesCallAction } from "../actions/teacherClassesCall";
import TeacherCallSheet from "../components/TeacherCallSheet";
import { getClassesCallListState } from "../state/teacherClassesCall";

class CallSheet extends React.PureComponent<any> {
  static navigationOptions = ({ navigation }: { navigation: NavigationScreenProp<{}> }) => {
    return alternativeNavScreenOptions(
      {
        title: I18n.t("viesco-register"),
        headerLeft: <HeaderBackAction navigation={navigation} />,
      },
      navigation
    );
  }

  public render() {
    return <TeacherCallSheet {...this.props} />;
  }
}

const mapStateToProps: (state: any) => any = state => {
  return {
    callList: getClassesCallListState(state),
  };
};

const mapDispatchToProps: (dispatch: any) => any = dispatch => {
  return {
    fetchClassesCall: (callId) => {
      dispatch(fetchClassesCallAction(callId));
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(CallSheet);
