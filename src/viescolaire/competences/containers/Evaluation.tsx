import I18n from "i18n-js";
import * as React from "react";
import { NavigationScreenProp } from "react-navigation";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";

import { getSessionInfo } from "../../../App";
import { standardNavScreenOptions } from "../../../navigation/helpers/navScreenOptions";
import { PageContainer } from "../../../ui/ContainerContent";
import { HeaderBackAction } from "../../../ui/headers/NewHeader";
import { getSubjectsListState } from "../../viesco/state/subjects";
import { fetchDevoirListAction } from "../actions/devoirs";
import { fetchDevoirMoyennesListAction } from "../actions/moyennes";
import Competences from "../components/Evaluation";
import { getDevoirListState } from "../state/devoirs";
import { getMoyenneListState } from "../state/moyennes";

export class Evaluation extends React.PureComponent<{ navigation: { navigate } }, any> {
  static navigationOptions = ({ navigation }: { navigation: NavigationScreenProp<any> }) => {
    return standardNavScreenOptions(
      {
        title: I18n.t("viesco-tests"),
        headerLeft: <HeaderBackAction navigation={navigation} />,
        headerStyle: {
          backgroundColor: "#F95303",
        },
      },
      navigation
    );
  };

  public render() {
    return (
      <PageContainer>
        <Competences {...this.props} />
      </PageContainer>
    );
  }
}

const mapStateToProps: (state: any) => any = state => {
  return {
    devoirsList: getDevoirListState(state),
    devoirsMoyennesList: getMoyenneListState(state),
    subjects: getSubjectsListState(state),
    userType: getSessionInfo().type,
  };
};

const mapDispatchToProps: (dispatch: any) => any = dispatch => {
  return bindActionCreators({
      getDevoirs: fetchDevoirListAction,
      getDevoirsMoyennes: fetchDevoirMoyennesListAction,
    },
    dispatch
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(Evaluation);
