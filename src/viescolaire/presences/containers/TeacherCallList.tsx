import * as React from "react";
import { connect } from "react-redux";

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
  };
};

const mapDispatchToProps: (dispatch: any) => any = dispatch => {
  return {
    fetchCourses: (teacherId, structureId, startDate, endDate) => {
      dispatch(fetchCoursesAction(teacherId, structureId, startDate, endDate));
    },
    fetchRegisterId: (course_data) => {
      dispatch(fetchCoursesRegisterAction(course_data));
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(CallList);
