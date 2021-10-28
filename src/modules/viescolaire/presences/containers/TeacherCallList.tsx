import moment from "moment";
import * as React from "react";
import { NavigationFocusInjectedProps } from "react-navigation";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";

import { getSessionInfo } from "../../../../App";
import { INavigationProps } from "../../../../types";
import { getSelectedStructure } from "../../viesco/state/structure";
import { fetchMultipleSlotsAction } from "../actions/multipleSlots";
import { fetchRegiterPreferencesAction } from "../actions/registerPreferences";
import { fetchCoursesRegisterAction } from "../actions/teacherCourseRegister";
import { fetchCoursesAction } from "../actions/teacherCourses";
import TeacherCallListComponent from "../components/TeacherCallList";
import { getMultipleSlotsState, IMultipleSlotsState } from "../state/multipleSlots";
import { getRegisterPreferencesState, IRegisterPreferencesState } from "../state/registerPreferences";
import { getCoursesRegisterState } from "../state/teacherCourseRegister";
import { getCoursesListState, ICourses } from "../state/teacherCourses";

export enum SwitchState {
  DEFAULT,
  COLOR,
}

export type ICourse = {
  id: string;
  classroom: string;
  grade: string;
  registerId: string;
};

type ICallListContainerProps = {
  courses: ICourses[];
  registerId: string;
  teacherId: string;
  structureId: string;
  isFetching: boolean;
  multipleSlots: IMultipleSlotsState;
  registerPreferences: IRegisterPreferencesState;
  getMultipleSlots: (structureId: string) => void;
  getRegisterPreferences: () => void;
  fetchCourses: (teacherId: string, structureId: string, startDate: string, endDate: string, multipleSlot?: boolean) => void;
  fetchRegisterId: (any: any) => void;
} & INavigationProps &
  NavigationFocusInjectedProps;

class TeacherCallList extends React.PureComponent<ICallListContainerProps> {
  componentDidMount() {
    this.props.getMultipleSlots(this.props.structureId);
    this.props.getRegisterPreferences();
    this.fetchTodayCourses();
  }

  componentDidUpdate(prevProps) {
    const { isFocused, structureId, multipleSlots, registerPreferences } = this.props;

    if (
      (isFocused && prevProps.isFocused !== isFocused) ||
      prevProps.structureId !== structureId ||
      prevProps.multipleSlots.data !== multipleSlots.data ||
      prevProps.registerPreferences.data !== registerPreferences.data
    ) {
      this.fetchTodayCourses();
    }
  }

  fetchTodayCourses = () => {
    let multipleSlot = true as boolean;
    if (
      this.props.multipleSlots &&
      this.props.multipleSlots.data.allow_multiple_slots &&
      this.props.registerPreferences &&
      this.props.registerPreferences.data.preference
    ) {
      multipleSlot = JSON.parse(this.props.registerPreferences.data.preference).multipleSlot;
    }

    const today = moment().format("YYYY-MM-DD");
    this.props.fetchCourses(this.props.teacherId, this.props.structureId, today, today, multipleSlot);
  };

  openCall = (course: ICourses) => {
    let courseRegisterInfos = {
      id: course.id,
      classroom: course.roomLabels[0],
      grade: course.classes[0] !== undefined ? course.classes[0] : course.groups[0],
      registerId: course.registerId,
    } as ICourse;

    if (course.registerId === null) {
      const courseData = JSON.stringify({
        course_id: course.id,
        structure_id: course.structureId,
        start_date: moment(course.startDate).format("YYYY-MM-DD HH:mm:ss"),
        end_date: moment(course.endDate).format("YYYY-MM-DD HH:mm:ss"),
        subject_id: course.subjectId,
        groups: course.groups,
        classes: course.classes !== undefined ? course.classes : course.groups,
        split_slot: true,
      });

      this.props.fetchRegisterId(courseData);
    }

    this.props.navigation.navigate("CallSheetPage", { courseInfos: courseRegisterInfos });
  };

  render() {
    return (
      <TeacherCallListComponent
        onCoursePress={this.openCall}
        courseList={this.props.courses}
        isFetching={this.props.isFetching}
      />
    );
  }
}

const mapStateToProps: (state: any) => any = state => {
  const coursesData = getCoursesListState(state);
  const registerData = getCoursesRegisterState(state);

  return {
    courses: coursesData.data,
    teacherId: getSessionInfo().id,
    structureId: getSelectedStructure(state),
    isFetching: coursesData.isFetching || registerData.isFetching,
    multipleSlots: getMultipleSlotsState(state),
    registerPreferences: getRegisterPreferencesState(state),
  };
};

const mapDispatchToProps: (dispatch: any) => any = dispatch => {
  return bindActionCreators(
    {
      fetchCourses: fetchCoursesAction,
      fetchRegisterId: fetchCoursesRegisterAction,
      getMultipleSlots: fetchMultipleSlotsAction,
      getRegisterPreferences: fetchRegiterPreferencesAction, },
    dispatch
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(TeacherCallList);
