import I18n from "i18n-js";
import * as React from "react";
import { NavigationScreenProp } from "react-navigation";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";

import { standardNavScreenOptions } from "../../../navigation/helpers/navScreenOptions";
import { HeaderBackAction } from "../../../ui/headers/NewHeader";
import { postAbsentEvent, deleteEvent } from "../actions/events";
import { fetchClassesCallAction } from "../actions/teacherClassesCall";
import TeacherCallSheet from "../components/TeacherCallSheet";
import { getClassesCallListState } from "../state/teacherClassesCall";

class CallSheet extends React.PureComponent<any> {
  static navigationOptions = ({ navigation }: { navigation: NavigationScreenProp<any> }) => {
    return standardNavScreenOptions(
      {
        title: I18n.t("viesco-register"),
        headerLeft: <HeaderBackAction navigation={navigation} />,
        headerStyle: {
          backgroundColor: "#ffb600",
        },
      },
      navigation
    );
  };

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
  return bindActionCreators({ fetchClassesCallAction, postAbsentEvent, deleteEvent }, dispatch);
};

export default connect(mapStateToProps, mapDispatchToProps)(CallSheet);
