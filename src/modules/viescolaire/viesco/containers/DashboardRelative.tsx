import moment from "moment";
import * as React from "react";
import { NavigationScreenProp, withNavigationFocus } from "react-navigation";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";

import withViewTracking from "../../../../infra/tracker/withViewTracking";
import { fetchChildHomeworkAction } from "../../cdt/actions/homeworks";
import { getHomeworksListState } from "../../cdt/state/homeworks";
import { fetchPersonnelListAction } from "../actions/personnel";
import { fetchSubjectListAction } from "../actions/subjects";
import DashboardComponent from "../components/DashboardRelative";
import { getSelectedChild, getSelectedChildStructure } from "../state/children";
import { getSubjectsListState } from "../state/subjects";

class Dashboard extends React.PureComponent<{
  homeworks: any;
  evaluations: any[];
  hasRightToCreateAbsence: boolean;
  structureId: string;
  childId: string;
  getSubjects: any;
  getHomeworks: any;
  getTeachers: any;
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
  }

  public componentDidUpdate(prevProps) {
    const { childId, structureId, isFocused } = this.props;
    if (prevProps.childId !== childId) {
      this.props.getSubjects(this.props.structureId);
      this.props.getTeachers(this.props.structureId);
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

  const authorizedActions = state.user.info.authorizedActions;
  const hasRightToCreateAbsence =
    authorizedActions && authorizedActions.some(action => action.displayName === "presences.absence.statements.create");

  const evaluations = [
    { subject: "Mathématiques", date: "23/03/2020", note: "15/20" },
    { subject: "Histoire-Géographie", date: "25/03/2020", note: "10/20" },
    { subject: "Mathématiques", date: "18/03/2020", note: "11/20" },
  ];

  return {
    homeworks,
    evaluations,
    hasRightToCreateAbsence,
    structureId,
    childId,
    subjects,
  };
};

const mapDispatchToProps: (dispatch: any) => any = dispatch => {
  return bindActionCreators(
    {
      getSubjects: fetchSubjectListAction,
      getTeachers: fetchPersonnelListAction,
      getHomeworks: fetchChildHomeworkAction,
    },
    dispatch
  );
};

export default withViewTracking("viesco")(connect(mapStateToProps, mapDispatchToProps)(withNavigationFocus(Dashboard)));
