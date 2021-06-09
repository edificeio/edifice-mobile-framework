import I18n from "i18n-js";
import * as React from "react";
import { NavigationScreenProp } from "react-navigation";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";

import { getSessionInfo } from "../../../../App";
import { standardNavScreenOptions } from "../../../../navigation/helpers/navScreenOptions";
import { PageContainer } from "../../../../ui/ContainerContent";
import { HeaderBackAction } from "../../../../ui/headers/NewHeader";
import { fetchPeriodsListAction, fetchYearAction } from "../../viesco/actions/periods";
import { getSelectedChild, getSelectedChildStructure } from "../../viesco/state/children";
import { getPeriodsListState, getYearState } from "../../viesco/state/periods";
import { getSubjectsListState } from "../../viesco/state/subjects";
import { fetchDevoirListAction } from "../actions/devoirs";
import { fetchDevoirMoyennesListAction } from "../actions/moyennes";
import Competences from "../components/Evaluation";
import { getDevoirListState } from "../state/devoirs";
import { getMoyenneListState } from "../state/moyennes";
import { View } from "react-native";

export class Evaluation extends React.PureComponent<{ navigation: { navigate } }, any> {
  static navigationOptions = ({ navigation }: { navigation: NavigationScreenProp<any> }) => {
    return standardNavScreenOptions(
      {
        title: I18n.t("viesco-tests"),
        headerLeft: <HeaderBackAction navigation={navigation} />,
        headerRight: <View/>,
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
  const userType = getSessionInfo().type;
  const childId = userType === "Student" ? getSessionInfo().id : getSelectedChild(state).id;
  const groupId =
    userType === "Student"
      ? getSessionInfo().classes[0]
      : getSessionInfo().classes[getSessionInfo().childrenIds.findIndex(i => i === childId)];
  const structureId =
    userType === "Student"
      ? getSessionInfo().administrativeStructures[0].id || getSessionInfo().structures[0]
      : getSelectedChildStructure(state)?.id;
  return {
    devoirsList: getDevoirListState(state),
    devoirsMoyennesList: getMoyenneListState(state),
    subjects: getSubjectsListState(state),
    userType,
    periods: getPeriodsListState(state),
    year: getYearState(state),
    groupId,
    structureId,
  };
};

const mapDispatchToProps: (dispatch: any) => any = dispatch => {
  return bindActionCreators(
    {
      getDevoirs: fetchDevoirListAction,
      getDevoirsMoyennes: fetchDevoirMoyennesListAction,
      getPeriods: fetchPeriodsListAction,
      getYear: fetchYearAction,
    },
    dispatch
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(Evaluation);
