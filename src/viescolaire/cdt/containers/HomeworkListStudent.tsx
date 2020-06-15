import * as React from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { NavigationScreenProp } from "react-navigation";
import I18n from "i18n-js";

import { fetchJSONWithCache } from "../../../infra/fetchWithCache";
import { standardNavScreenOptions } from "../../../navigation/helpers/navScreenOptions";
import { HeaderBackAction } from "../../../ui/headers/NewHeader";
import { HeaderAction } from "../../../ui/headers/Header";
import HomeworkListRelative from "../components/HomeworkListStudent";

class HomeworkListRelativeContainer extends React.PureComponent<{ navigation: { navigate } }, any> {
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
    return <HomeworkListRelative {...this.props} />;
  }
}

const mapStateToProps: (state: any) => any = state => {
  return {
    getfunction: fetchJSONWithCache(`/diary/homeworks/own/2020-03-08/2020-06-15/97a7363c-c000-429e-9c8c-d987b2a2c204`)
  };
};

const mapDispatchToProps: (dispatch: any) => any = dispatch => {
  return bindActionCreators({}, dispatch);
};

export default connect(mapStateToProps)(HomeworkListRelativeContainer);
