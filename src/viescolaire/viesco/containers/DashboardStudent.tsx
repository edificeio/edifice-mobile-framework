import moment from "moment";
import * as React from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";

import { getSessionInfo } from "../../../App";
import { fetchHomeworkListAction, updateHomeworkProgressAction } from "../../cdt/actions/homeworks";
import { getHomeworksListState } from "../../cdt/state/homeworks";
import { fetchPersonnelListAction } from "../actions/personnel";
import { fetchSubjectListAction } from "../actions/subjects";
import DashboardComponent from "../components/DashboardStudent";
import { getSubjectsListState } from "../state/subjects";

class Dashboard extends React.PureComponent<{
  homeworks: any[];
  structureId: string;
  getSubjects: any;
  getTeachers: any;
  getHomeworks: any;
}> {
  public componentDidMount() {
    const structureId = getSessionInfo().administrativeStructures[0].id;
    this.props.getSubjects(structureId);
    this.props.getTeachers(structureId);
    this.props.getHomeworks(
      structureId,
      moment().format("YYYY-MM-DD"),
      moment()
        .add(1, "M")
        .format("YYYY-MM-DD")
    );
  }

  public render() {
    return <DashboardComponent {...this.props} />;
  }
}

// ------------------------------------------------------------------------------------------------

const mapStateToProps: (state: any) => any = state => {
  const homeworks = getHomeworksListState(state);
  const subjects = getSubjectsListState(state);

  return {
    homeworks,
    subjects,
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

export default connect(mapStateToProps, mapDispatchToProps)(Dashboard);
