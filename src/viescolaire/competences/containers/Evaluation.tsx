import I18n from "i18n-js";
import * as React from "react";
import { View } from "react-native";
import { NavigationScreenProp } from "react-navigation";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";

import { getSessionInfo } from "../../../App";
import { standardNavScreenOptions } from "../../../navigation/helpers/navScreenOptions";
import { PageContainer } from "../../../ui/ContainerContent";
import { HeaderBackAction } from "../../../ui/headers/NewHeader";
import { fetchPeriodsListAction } from "../../viesco/actions/periods";
import { getSelectedChild, getSelectedChildStructure } from "../../viesco/state/children";
import { getPeriodsListState } from "../../viesco/state/periods";
import { fetchLevelsAction } from "../actions/competencesLevels";
import { fetchDevoirListAction } from "../actions/devoirs";
import { fetchMatieresAction } from "../actions/matieres";
import { fetchDevoirMoyennesListAction } from "../actions/moyennes";
import Competences from "../components/Evaluation";
import { getLevelsListState } from "../state/competencesLevels";
import { getDevoirListState } from "../state/devoirs";
import { getMatiereListState } from "../state/matieres";
import { getMoyenneListState } from "../state/moyennes";

export class Evaluation extends React.PureComponent<{ navigation: { navigate } }, any> {
  static navigationOptions = ({ navigation }: { navigation: NavigationScreenProp<any> }) => {
    return standardNavScreenOptions(
      {
        title: I18n.t("viesco-tests"),
        headerLeft: <HeaderBackAction navigation={navigation} />,
        headerRight: <View />,
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
  const childId = userType === "Student" ? getSessionInfo().userId : getSelectedChild(state)?.id;
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
    levels: getLevelsListState(state).data,
    subjects: getMatiereListState(state).data,
    userType,
    periods: getPeriodsListState(state).data,
    groupId,
    structureId,
    childId,
  };
};

const mapDispatchToProps: (dispatch: any) => any = dispatch => {
  return bindActionCreators(
    {
      getDevoirs: fetchDevoirListAction,
      getDevoirsMoyennes: fetchDevoirMoyennesListAction,
      getPeriods: fetchPeriodsListAction,
      getLevels: fetchLevelsAction,
      getSubjects: fetchMatieresAction,
    },
    dispatch
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(Evaluation);
