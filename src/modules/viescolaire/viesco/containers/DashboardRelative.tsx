import moment from "moment";
import * as React from "react";
import { NavigationScreenProp, withNavigationFocus } from "react-navigation";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";

import withViewTracking from "../../../../framework/util/tracker/withViewTracking";
import { fetchChildHomeworkAction } from "../../cdt/actions/homeworks";
import { getHomeworksListState } from "../../cdt/state/homeworks";
import { fetchLevelsAction } from "../../competences/actions/competencesLevels";
import { fetchDevoirListAction } from "../../competences/actions/devoirs";
import { getLevelsListState, ILevelsList } from "../../competences/state/competencesLevels";
import { getDevoirListState, IDevoirsMatieresState } from "../../competences/state/devoirs";
import { fetchChildrenGroupsAction } from "../actions/childrenGroups";
import { fetchPersonnelListAction } from "../actions/personnel";
import { fetchSubjectListAction } from "../actions/subjects";
import DashboardComponent from "../components/DashboardRelative";
import { getSelectedChild, getSelectedChildStructure } from "../state/children";
import { getSubjectsListState } from "../state/subjects";

class Dashboard extends React.PureComponent<{
  homeworks: any;
  evaluations: IDevoirsMatieresState;
  hasRightToCreateAbsence: boolean;
  structureId: string;
  childId: string;
  levels: ILevelsList;
  getSubjects: (structureId: string) => void;
  getHomeworks: (childId: string, structureId: string, startDate: string, endDate: string) => void;
  getDevoirs: (structureId: string, childId: string) => void;
  getTeachers: (structureId: string) => void;
  getLevels: (structureId: string) => void;
  getChildrenGroups: (structureId: string) => void;
  navigation: NavigationScreenProp<any>;
  isFocused: boolean;
}> {
  public componentDidMount() {
    const { childId, structureId } = this.props;
    this.props.getSubjects(this.props.structureId);
    this.props.getTeachers(this.props.structureId);
    this.props.getHomeworks(
      childId,
      structureId,
      moment()
        .add(1, "day")
        .format("YYYY-MM-DD"),
      moment()
        .add(1, "month")
        .format("YYYY-MM-DD")
    );
    this.props.getDevoirs(structureId, childId);
    this.props.getLevels(structureId);
    this.props.getChildrenGroups(structureId);
  }

  public componentDidUpdate(prevProps) {
    const { childId, structureId, isFocused } = this.props;
    if (prevProps.childId !== childId) {
      this.props.getSubjects(this.props.structureId);
      this.props.getTeachers(this.props.structureId);
      this.props.getLevels(structureId);
      this.props.getChildrenGroups(structureId);
    }
    if (isFocused && (prevProps.isFocused !== isFocused || prevProps.childId !== childId)) {
      this.props.getHomeworks(
        childId,
        structureId,
        moment()
          .add(1, "day")
          .format("YYYY-MM-DD"),
        moment()
          .add(1, "month")
          .format("YYYY-MM-DD")
      );
      this.props.getDevoirs(structureId, childId);
    }
  }

  public render() {
    return <DashboardComponent {...this.props} />;
  }
}

// ------------------------------------------------------------------------------------------------

const mapStateToProps: (state: any) => any = state => {
  const childId = getSelectedChild(state).id;
  const homeworks = getHomeworksListState(state);
  const subjects = getSubjectsListState(state);
  const structureId = getSelectedChildStructure(state)?.id;
  const evaluations = getDevoirListState(state);
  const levels = getLevelsListState(state).data;

  const authorizedActions = state.user.info.authorizedActions;
  const hasRightToCreateAbsence =
    authorizedActions && authorizedActions.some(action => action.displayName === "presences.absence.statements.create");

  return {
    homeworks,
    evaluations,
    hasRightToCreateAbsence,
    structureId,
    childId,
    subjects,
    levels,
  };
};

const mapDispatchToProps: (dispatch: any) => any = dispatch => {
  return bindActionCreators(
    {
      getSubjects: fetchSubjectListAction,
      getTeachers: fetchPersonnelListAction,
      getHomeworks: fetchChildHomeworkAction,
      getDevoirs: fetchDevoirListAction,
      getLevels: fetchLevelsAction,
      getChildrenGroups: fetchChildrenGroupsAction,
    },
    dispatch,
  );
};

export default withViewTracking("viesco")(connect(mapStateToProps, mapDispatchToProps)(withNavigationFocus(Dashboard)));
