import moment from "moment";
import * as React from "react";
import { NavigationScreenProp } from "react-navigation";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";

import { getSessionInfo } from "../../../App";
import { fetchHomeworkListAction, updateHomeworkProgressAction } from "../../cdt/actions/homeworks";
import { getHomeworksListState } from "../../cdt/state/homeworks";
import { fetchPersonnelListAction } from "../actions/personnel";
import { fetchSubjectListAction } from "../actions/subjects";
import DashboardComponent from "../components/DashboardStudent";
import { getSubjectsListState } from "../state/subjects";
import withViewTracking from "../../../infra/tracker/withViewTracking";

class Dashboard extends React.PureComponent<{
  homeworks: any[];
  structureId: string;
  getSubjects: any;
  getTeachers: any;
  getHomeworks: any;
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
    const { structureId } = this.props;
    this.props.getSubjects(structureId);
    this.props.getTeachers(structureId);
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

  return {
    homeworks,
    subjects,
    structureId,
  };
};

const mapDispatchToProps: (dispatch: any) => any = dispatch => {
  return bindActionCreators(
    {
      getSubjects: fetchSubjectListAction,
      getTeachers: fetchPersonnelListAction,
      getHomeworks: fetchHomeworkListAction,
      updateHomeworkProgress: updateHomeworkProgressAction,
    },
    dispatch
  );
};

export default withViewTracking("viesco")(connect(mapStateToProps, mapDispatchToProps)(Dashboard));
