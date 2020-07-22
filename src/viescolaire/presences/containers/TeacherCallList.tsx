import * as React from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";

import { getSessionInfo } from "../../../App";
import { getSelectedStructure } from "../../viesco/state/structure";
import { fetchCoursesAction, fetchCoursesRegisterAction } from "../actions/teacherCourses";
import TeacherCallList from "../components/TeacherCallList";
import { getCoursesListState, getCoursesRegisterState } from "../state/teacherCourses";

class CallList extends React.PureComponent<any> {
  public render() {
    return <TeacherCallList {...this.props} />;
  }
}

const mapStateToProps: (state: any) => any = state => {
  return {
    courses: getCoursesListState(state),
    register: getCoursesRegisterState(state),
    teacher_id: getSessionInfo().id,
    structure_id:
      getSelectedStructure(state) !== undefined ? getSelectedStructure(state) : getSessionInfo().structures[0],
  };
};

const mapDispatchToProps: (dispatch: any) => any = dispatch => {
  return bindActionCreators(
    { fetchCourses: fetchCoursesAction, fetchRegisterId: fetchCoursesRegisterAction },
    dispatch
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(CallList);
