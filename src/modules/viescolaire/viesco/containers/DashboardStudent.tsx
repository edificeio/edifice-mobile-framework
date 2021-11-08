import moment from "moment";
import * as React from "react";
import { NavigationScreenProp } from "react-navigation";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";

import { getSessionInfo } from "../../../../App";
import withViewTracking from "../../../../framework/util/tracker/withViewTracking";
import { fetchHomeworkListAction, updateHomeworkProgressAction } from "../../cdt/actions/homeworks";
import { getHomeworksListState } from "../../cdt/state/homeworks";
import { fetchLevelsAction } from "../../competences/actions/competencesLevels";
import { fetchDevoirListAction } from "../../competences/actions/devoirs";
import { getLevelsListState, ILevelsList } from "../../competences/state/competencesLevels";
import { getDevoirListState } from "../../competences/state/devoirs";
import { fetchPersonnelListAction } from "../actions/personnel";
import { fetchSubjectListAction } from "../actions/subjects";
import DashboardComponent from "../components/DashboardStudent";
import { getSubjectsListState } from "../state/subjects";

class Dashboard extends React.PureComponent<{
  homeworks: any[];
  structureId: string;
  childId: string;
  levels: ILevelsList;
  getSubjects: (structureId: string) => any;
  getTeachers: (structureId: string) => any;
  getHomeworks: (structureId: string, startDate: string, endDate: string) => any;
  getDevoirs: (structureId: string, childId: string) => void;
  getLevels: (structureId: string) => void;
  navigation: NavigationScreenProp<any>;
}> {
  constructor(props) {
    super(props);
    const { structureId, getHomeworks, childId } = props;
    this.state = {
      // fetching next month homeworks only, when screen is focused
      focusListener: this.props.navigation.addListener("willFocus", () => {
        getHomeworks(
          structureId,
          moment().format("YYYY-MM-DD"),
          moment()
            .add(1, "month")
            .format("YYYY-MM-DD")
        );
        this.props.getDevoirs(structureId, childId);
      }),
    };
  }

  public componentDidMount() {
    const { structureId } = this.props;
    this.props.getSubjects(structureId);
    this.props.getTeachers(structureId);
    this.props.getLevels(structureId);
  }

  public render() {
    return <DashboardComponent {...this.props} />;
  }
}

// ------------------------------------------------------------------------------------------------

const mapStateToProps: (state: any) => any = state => {
  const homeworks = getHomeworksListState(state);
  const subjects = getSubjectsListState(state);
  const structureId = getSessionInfo().administrativeStructures[0].id || getSessionInfo().structures[0];
  const childId = getSessionInfo().userId;
  const evaluations = getDevoirListState(state);
  const levels = getLevelsListState(state).data;

  return {
    homeworks,
    subjects,
    structureId,
    childId,
    evaluations,
    levels,
  };
};

const mapDispatchToProps: (dispatch: any) => any = dispatch => {
  return bindActionCreators(
    {
      getSubjects: fetchSubjectListAction,
      getTeachers: fetchPersonnelListAction,
      getHomeworks: fetchHomeworkListAction,
      updateHomeworkProgress: updateHomeworkProgressAction,
      getDevoirs: fetchDevoirListAction,
      getLevels: fetchLevelsAction,
    },
    dispatch
  );
};

export default withViewTracking("viesco")(connect(mapStateToProps, mapDispatchToProps)(Dashboard));
