import moment from "moment";
import * as React from "react";
import { NavigationScreenProp } from "react-navigation";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";

import { getSessionInfo } from "../../../App";
import withViewTracking from "../../../infra/tracker/withViewTracking";
import { fetchHomeworkListAction, updateHomeworkProgressAction } from "../../cdt/actions/homeworks";
import { getHomeworksListState } from "../../cdt/state/homeworks";
import { fetchDevoirListAction } from "../../competences/actions/devoirs";
import { getDevoirListState } from "../../competences/state/devoirs";
import { fetchPersonnelListAction } from "../actions/personnel";
import { fetchSubjectListAction } from "../actions/subjects";
import DashboardComponent from "../components/DashboardStudent";
import { getSubjectsListState } from "../state/subjects";

class Dashboard extends React.PureComponent<{
  homeworks: any[];
  structureId: string;
  childId: string;
  getSubjects: (structureId: string) => any;
  getTeachers: (structureId: string) => any;
  getHomeworks: (structureId: string, startDate: string, endDate: string) => any;
  getDevoirs: (structureId: string, childId: string) => void;
  navigation: NavigationScreenProp<any>;
}> {
  constructor(props) {
    super(props);
    const { structureId, getHomeworks } = props;
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
      }),
    };
  }

  public componentDidMount() {
    const { structureId, childId } = this.props;
    this.props.getSubjects(structureId);
    this.props.getTeachers(structureId);
    this.props.getDevoirs(structureId, childId);
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

  return {
    homeworks,
    subjects,
    structureId,
    childId,
    evaluations,
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
    },
    dispatch
  );
};

export default withViewTracking("viesco")(connect(mapStateToProps, mapDispatchToProps)(Dashboard));
