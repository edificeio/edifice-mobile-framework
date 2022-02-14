import moment from 'moment';
import * as React from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { NavigationFocusInjectedProps } from 'react-navigation';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import { getSessionInfo } from '~/App';
import { fetchMultipleSlotsAction } from '~/modules/viescolaire/presences/actions/multipleSlots';
import { fetchRegiterPreferencesAction } from '~/modules/viescolaire/presences/actions/registerPreferences';
import { fetchCoursesRegisterAction } from '~/modules/viescolaire/presences/actions/teacherCourseRegister';
import { fetchCoursesAction } from '~/modules/viescolaire/presences/actions/teacherCourses';
import TeacherCallListComponent from '~/modules/viescolaire/presences/components/TeacherCallList';
import { getMultipleSlotsState, IMultipleSlotsState } from '~/modules/viescolaire/presences/state/multipleSlots';
import { getRegisterPreferencesState, IRegisterPreferencesState } from '~/modules/viescolaire/presences/state/registerPreferences';
import { getCoursesRegisterState } from '~/modules/viescolaire/presences/state/teacherCourseRegister';
import { getCoursesListState, ICourses } from '~/modules/viescolaire/presences/state/teacherCourses';
import { getSelectedStructure } from '~/modules/viescolaire/viesco/state/structure';
import { INavigationProps } from '~/types';

export enum SwitchState {
  DEFAULT,
  COLOR,
}

export type ICourseData = {
  classes: string[];
  course_id: string;
  structure_id: string;
  start_date: string;
  end_date: string;
  subject_id: string;
  teacherIds: string[];
  groups: string[];
  split_slot: boolean;
};

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
  multipleSlots: IMultipleSlotsState; // multipleSlot preference set on web
  registerPreferences: IRegisterPreferencesState; // CPE multipleSlot preference
  getMultipleSlots: (structureId: string) => void; // get multipleSlot preference set on web
  getRegisterPreferences: () => void; // get CPE multipleSlot preference
  fetchCourses: (teacherId: string, structureId: string, startDate: string, endDate: string, multipleSlot?: boolean) => void;
  fetchRegisterId: (any: any) => void;
} & INavigationProps &
  NavigationFocusInjectedProps;

class TeacherCallList extends React.PureComponent<ICallListContainerProps> {
  componentDidMount() {
    this.props.getMultipleSlots(this.props.structureId);
    this.props.getRegisterPreferences();
    this.fetchTodayCourses();
    AppState.addEventListener('change', this.handleAppStateChange);
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

  private handleAppStateChange = (nextAppState: AppStateStatus) => {
    if (nextAppState === 'active') {
      this.props.getRegisterPreferences();
      this.props.getMultipleSlots(this.props.structureId);
      this.fetchTodayCourses();
    }
  };

  componentWillUnmount() {
    AppState.removeEventListener('change', this.handleAppStateChange);
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

    const today = moment().format('YYYY-MM-DD');
    this.props.fetchCourses(this.props.teacherId, this.props.structureId, today, today, multipleSlot);
  };

  openCall = (course: ICourses) => {
    const courseRegisterInfos = {
      id: course.id,
      classroom: course.roomLabels[0],
      grade: course.classes[0] !== undefined ? course.classes[0] : course.groups[0],
      registerId: course.registerId,
    } as ICourse;

    if (course.registerId === null) {
      const rawCourseData = {
        course_id: course.id,
        structure_id: course.structureId,
        start_date: moment(course.startDate).format('YYYY-MM-DD HH:mm:ss'),
        end_date: moment(course.endDate).format('YYYY-MM-DD HH:mm:ss'),
        subject_id: course.subjectId,
        groups: course.groups,
        classes: course.classes !== undefined ? course.classes : course.groups,
        teacherIds: [this.props.teacherId],
        split_slot: this.props.multipleSlots.data.allow_multiple_slots,
      } as ICourseData;
      const courseData = JSON.stringify(rawCourseData) as string;

      this.props.fetchRegisterId(courseData);
    }

    this.props.navigation.navigate('CallSheetPage', { courseInfos: courseRegisterInfos });
  };

  render() {
    return (
      <TeacherCallListComponent
        {...this.props}
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
      getRegisterPreferences: fetchRegiterPreferencesAction,
    },
    dispatch,
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(TeacherCallList);
