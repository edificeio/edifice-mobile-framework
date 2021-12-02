import I18n from "i18n-js";
import * as React from "react";
import { View } from "react-native";
import { NavigationScreenProp } from "react-navigation";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";

import { getSessionInfo } from "../../../../App";
import { standardNavScreenOptions } from "../../../../navigation/helpers/navScreenOptions";
import { INavigationProps } from "../../../../types";
import { PageContainer } from "../../../../ui/ContainerContent";
import { HeaderBackAction } from "../../../../ui/headers/NewHeader";
import { fetchUserChildrenAction } from "../../edt/actions/userChildren";
import { getUserChildrenState } from "../../edt/state/userChildren";
import { fetchGroupListAction } from "../../viesco/actions/group";
import { fetchPeriodsListAction } from "../../viesco/actions/periods";
import { getSelectedChild, getSelectedChildStructure } from "../../viesco/state/children";
import { getGroupsListState } from "../../viesco/state/group";
import { getPeriodsListState, IPeriodsList } from "../../viesco/state/periods";
import { fetchLevelsAction } from "../actions/competencesLevels";
import { fetchDevoirListAction } from "../actions/devoirs";
import { fetchDevoirMoyennesListAction } from "../actions/moyennes";
import Competences from "../components/Evaluation";
import { getLevelsListState, ILevelsList } from "../state/competencesLevels";
import { getDevoirListState, IDevoirsMatieresState } from "../state/devoirs";
import { getMoyenneListState, IMoyenneListState } from "../state/moyennes";

// eslint-disable-next-line flowtype/no-types-missing-file-annotation
export type CompetencesProps = {
  devoirsList: IDevoirsMatieresState;
  devoirsMoyennesList: IMoyenneListState;
  levels: ILevelsList;
  userType: string;
  periods: IPeriodsList;
  groups: string[];
  childClasses: string;
  structureId: string;
  childId: string;
  fetchChildInfos: () => void;
  fetchChildGroups: (classes: string, student: string) => any;
  getDevoirs: (structureId: string, studentId: string, period?: string, matiere?: string) => void;
  getDevoirsMoyennes: (structureId: string, studentId: string, period?: string) => void;
  getPeriods: (structureId: string, groupId: string) => void;
  getLevels: (structureIs: string) => void;
} & INavigationProps;

export class Evaluation extends React.PureComponent<CompetencesProps, any> {
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

  componentDidMount = async () => {
    const { structureId, childId, childClasses } = this.props;
    this.props.getDevoirs(structureId, childId);
    this.props.getLevels(structureId);
    if (getSessionInfo().type === "Relative") await this.props.fetchChildInfos();
    this.props.getPeriods(structureId, childClasses);
    this.props.fetchChildGroups(childClasses, childId);
  };

  componentDidUpdate = async (prevProps) => {
    const { structureId, childId, childClasses } = this.props;
    if (prevProps.childId !== childId || prevProps.childClasses !== childClasses) {
      if (getSessionInfo().type === "Relative") await this.props.fetchChildInfos();
      this.props.getDevoirs(structureId, childId);
      this.props.getPeriods(structureId, childClasses);
      this.props.fetchChildGroups(childClasses, childId);
    }
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
  const structureId =
    userType === "Student"
      ? getSessionInfo().administrativeStructures[0].id || getSessionInfo().structures[0]
      : getSelectedChildStructure(state)?.id;

  // get groups and childClasses
  let childClasses: string = "";
  let groups = [] as string[];
  const childGroups = getGroupsListState(state).data;
  if (getSessionInfo().type === "Student") {
    childClasses = getSessionInfo().classes[0];
  } else {
    childClasses = getUserChildrenState(state).data!.find(child => childId === child.id)?.idClasses!;
  }
  if (childGroups !== undefined && childGroups[0] !== undefined) {
    if (childGroups[0].nameClass !== undefined) groups.push(childGroups[0].nameClass);
    childGroups[0]?.nameGroups?.forEach(item => groups.push(item));
  } else if (getSessionInfo().type === "Student") {
    groups.push(getSessionInfo().realClassesNames[0]);
  }

  return {
    devoirsList: getDevoirListState(state),
    devoirsMoyennesList: getMoyenneListState(state),
    levels: getLevelsListState(state).data,
    userType,
    periods: getPeriodsListState(state).data,
    groups: getGroupsListState(state).data,
    structureId,
    childId,
    childClasses,
  };
};

const mapDispatchToProps: (dispatch: any) => any = dispatch => {
  return bindActionCreators(
    {
      fetchChildInfos: fetchUserChildrenAction,
      fetchChildGroups: fetchGroupListAction,
      getDevoirs: fetchDevoirListAction,
      getDevoirsMoyennes: fetchDevoirMoyennesListAction,
      getPeriods: fetchPeriodsListAction,
      getLevels: fetchLevelsAction,
    },
    dispatch
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(Evaluation);
