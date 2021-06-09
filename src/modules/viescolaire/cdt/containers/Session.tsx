import I18n from "i18n-js";
import * as React from "react";
import { View } from "react-native";
import { NavigationScreenProp } from "react-navigation";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";

import { fetchJSONWithCache } from "../../../../infra/fetchWithCache";
import { standardNavScreenOptions } from "../../../../navigation/helpers/navScreenOptions";
import { HeaderBackAction } from "../../../../ui/headers/NewHeader";
import DisplaySession from "../components/DisplaySession";

class Session extends React.PureComponent<any> {
  static navigationOptions = ({ navigation }: { navigation: NavigationScreenProp<{}> }) => {
    return standardNavScreenOptions(
      {
        title: I18n.t("Homework"),
        headerLeft: <HeaderBackAction navigation={navigation} />,
        headerRight: <View />,
        headerStyle: {
          backgroundColor: "#2BAB6F",
        },
      },
      navigation
    );
  };

  public render() {
    return <DisplaySession {...this.props} />;
  }
}

const mapStateToProps: (state: any) => any = state => {
  return {
    getfunction: fetchJSONWithCache(`/diary/session/38`)
  };
};

const mapDispatchToProps: (dispatch: any) => any = dispatch => {
  return bindActionCreators({}, dispatch);
};

export default connect(mapStateToProps)(Session);
