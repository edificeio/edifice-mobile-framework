import * as React from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { NavigationScreenProp } from "react-navigation";
import I18n from "i18n-js";

import { fetchJSONWithCache } from "../../../infra/fetchWithCache";
import { standardNavScreenOptions } from "../../../navigation/helpers/navScreenOptions";
import { HeaderBackAction } from "../../../ui/headers/NewHeader";
import { HeaderAction } from "../../../ui/headers/Header";
import DisplayHomework from "../components/DisplayHomework";

class Homework extends React.PureComponent<any> {
  static navigationOptions = ({ navigation }: { navigation: NavigationScreenProp<{}> }) => {
    const diaryTitle = navigation.getParam("diaryTitle")

    return standardNavScreenOptions(
      {
        title: diaryTitle || I18n.t("Homework"),
        headerLeft: <HeaderBackAction navigation={navigation} />,
        headerRight: <HeaderAction
          name="filter"
          onPress={() => navigation.navigate("HomeworkFilter")}
        />
      },
      navigation
    );
  }
  
  public render() {
    return <DisplayHomework {...this.props} />;
  }
}

const mapStateToProps: (state: any) => any = state => {
  return {
    getfunction: fetchJSONWithCache(`/diary/homework/49`)
  };
};

const mapDispatchToProps: (dispatch: any) => any = dispatch => {
  return bindActionCreators({}, dispatch);
};

export default connect(mapStateToProps)(Homework);
