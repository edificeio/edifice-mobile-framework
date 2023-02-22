import moment from 'moment';
import * as React from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { ThunkDispatch } from 'redux-thunk';

import { IGlobalState } from '~/app/store';
import { getSession } from '~/framework/modules/auth/reducer';
import { getSelectedStructure } from '~/framework/modules/viescolaire/dashboard/state/structure';
import TeacherCallListComponent from '~/framework/modules/viescolaire/presences/components/TeacherCallListOld';
import moduleConfig from '~/framework/modules/viescolaire/presences/module-config';
import { presencesRouteNames } from '~/framework/modules/viescolaire/presences/navigation';
import { tryAction } from '~/framework/util/redux/actions';
import { fetchMultipleSlotsAction } from '~/modules/viescolaire/presences/actions/multipleSlots';
import { fetchRegiterPreferencesAction } from '~/modules/viescolaire/presences/actions/registerPreferences';
import { fetchCoursesRegisterAction } from '~/modules/viescolaire/presences/actions/teacherCourseRegister';
import { fetchCoursesAction } from '~/modules/viescolaire/presences/actions/teacherCourses';
import { ICourses } from '~/modules/viescolaire/presences/state/teacherCourses';

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
  multipleSlots: boolean; // multipleSlot preference set on web
  registerPreferences: string; // CPE multipleSlot preference
  getMultipleSlots: (structureId: string) => void; // get multipleSlot preference set on web
  getRegisterPreferences: () => void; // get CPE multipleSlot preference
  fetchCourses: (teacherId: string, structureId: string, startDate: string, endDate: string, multipleSlot?: boolean) => void;
  fetchRegisterId: (any: any) => void;
};

type ICallListContainerState = {
  isFetchData: boolean;
};

class TeacherCallList extends React.PureComponent<ICallListContainerProps, ICallListContainerState> {
  constructor(props) {
    super(props);

    this.state = {
      isFetchData: false,
    };
  }

  componentDidMount() {
    this.props.getMultipleSlots(this.props.structureId);
    this.props.getRegisterPreferences();
    this.fetchTodayCourses();
    AppState.addEventListener('change', this.handleAppStateChange);
  }

  componentDidUpdate(prevProps) {
    const { isFocused, structureId } = this.props;

    if (this.state.isFetchData) {
      this.props.getRegisterPreferences();
      this.props.getMultipleSlots(this.props.structureId);
      this.fetchTodayCourses();
      this.setState({ isFetchData: false });
    } else if ((isFocused && prevProps.isFocused !== isFocused) || prevProps.structureId !== structureId) {
      this.fetchTodayCourses();
    }
  }

  private handleAppStateChange = (nextAppState: AppStateStatus) => {
    if (nextAppState === 'active') {
      this.setState({ isFetchData: true });
    }
  };

  componentWillUnmount() {
    AppState.removeEventListener('change', this.handleAppStateChange);
  }

  fetchTodayCourses = () => {
    const today = moment().format('YYYY-MM-DD');
    this.props.fetchCourses(this.props.teacherId, this.props.structureId, today, today, this.props.multipleSlots);
  };

  setCoursesRegisterId = (course: ICourses) => {
    const rawCourseData = {
      course_id: course.id,
      structure_id: course.structureId,
      start_date: moment(course.startDate).format('YYYY-MM-DD HH:mm:ss'),
      end_date: moment(course.endDate).format('YYYY-MM-DD HH:mm:ss'),
      subject_id: course.subjectId,
      groups: course.groups,
      classes: course.classes !== undefined ? course.classes : course.groups,
      teacherIds: [this.props.teacherId],
      split_slot: this.props.multipleSlots,
    } as ICourseData;
    const courseData = JSON.stringify(rawCourseData) as string;

    this.props.fetchRegisterId(courseData);
  };

  openCall = (course: ICourses) => {
    if (course.registerId === null || course.registerId === undefined) {
      this.setCoursesRegisterId(course);
    }

    const courseRegisterInfos = {
      id: course.id,
      classroom: course.roomLabels[0],
      grade: course.classes[0] !== undefined ? course.classes[0] : course.groups[0],
      registerId: course.registerId,
    } as ICourse;

    this.props.navigation.navigate(presencesRouteNames.call, { courseInfos: courseRegisterInfos });
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

export default connect(
  (state: IGlobalState) => {
    const presencesState = moduleConfig.getState(state);
    const session = getSession(state);

    return {
      courses: presencesState.courses.data.filter(course => course.allowRegister === true),
      teacherId: session?.user.id,
      structureId: getSelectedStructure(state),
      isFetching: presencesState.courses.isFetching,
      multipleSlots: presencesState.allowMultipleSlots.data,
      registerPreferences: presencesState.registerPreference.data,
    };
  },
  (dispatch: ThunkDispatch<any, any, any>) =>
    bindActionCreators(
      {
        fetchCourses: tryAction(fetchCoursesAction, undefined, true),
        fetchRegisterId: tryAction(fetchCoursesRegisterAction, undefined, true),
        getMultipleSlots: tryAction(fetchMultipleSlotsAction, undefined, true),
        getRegisterPreferences: tryAction(fetchRegiterPreferencesAction, undefined, true),
      },
      dispatch,
    ),
)(TeacherCallList);
