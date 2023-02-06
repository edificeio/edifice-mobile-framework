import type { NativeStackNavigationOptions, NativeStackScreenProps } from '@react-navigation/native-stack';
import I18n from 'i18n-js';
import moment from 'moment';
import * as React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { ThunkDispatch } from 'redux-thunk';

import { IGlobalState } from '~/app/store';
import { PageView } from '~/framework/components/page';
import { getSession } from '~/framework/modules/auth/reducer';
import viescoTheme from '~/framework/modules/viescolaire/common/theme';
import {
  fetchDiaryHomeworksAction,
  fetchDiarySessionsAction,
  fetchDiarySlotsAction,
} from '~/framework/modules/viescolaire/diary/actions';
import DiaryTeacherTimetable from '~/framework/modules/viescolaire/diary/components/DiaryTimetableTeachers';
import moduleConfig from '~/framework/modules/viescolaire/diary/module-config';
import { DiaryNavigationParams, diaryRouteNames } from '~/framework/modules/viescolaire/diary/navigation';
import { navBarOptions } from '~/framework/navigation/navBar';
import { tryAction } from '~/framework/util/redux/actions';
import { fetchCourseListFromTeacherAction } from '~/modules/viescolaire/dashboard/actions/courses';
import StructurePicker from '~/modules/viescolaire/dashboard/containers/StructurePicker';
import { getCoursesListState } from '~/modules/viescolaire/dashboard/state/courses';
import { getSelectedStructure } from '~/modules/viescolaire/dashboard/state/structure';

import type { DiaryTimetableScreenPrivateProps } from './types';

export type TimetableState = {
  startDate: moment.Moment;
  selectedDate: moment.Moment;
};

export const computeNavBar = ({
  navigation,
  route,
}: NativeStackScreenProps<DiaryNavigationParams, typeof diaryRouteNames.timetable>): NativeStackNavigationOptions => ({
  ...navBarOptions({
    navigation,
    route,
  }),
  title: I18n.t('Homework'),
  headerStyle: {
    backgroundColor: viescoTheme.palette.diary,
  },
});

class DiaryTimetableScreen extends React.PureComponent<DiaryTimetableScreenPrivateProps, TimetableState> {
  constructor(props) {
    super(props);
    this.state = {
      startDate: moment().startOf('week'),
      selectedDate: moment(),
    };
  }

  fetchCourses = () => {
    const { startDate } = this.state;
    const { fetchTeacherCourses, fetchHomeworks, fetchSessions, structure, teacherId } = this.props;
    fetchTeacherCourses(structure.id, startDate, startDate.clone().endOf('week'), teacherId);
    fetchSessions(structure.id, startDate.format('YYYY-MM-DD'), startDate.clone().endOf('week').format('YYYY-MM-DD'));
    fetchHomeworks(structure.id, startDate.format('YYYY-MM-DD'), startDate.clone().endOf('week').format('YYYY-MM-DD'));
  };

  componentDidMount() {
    const { structure } = this.props;
    this.fetchCourses();
    this.props.fetchSlots(structure.id);
  }

  componentDidUpdate(prevProps, prevState) {
    const { startDate, selectedDate } = this.state;
    const { structure, fetchSlots } = this.props;

    // on selected date change
    if (!prevState.selectedDate.isSame(selectedDate, 'day')) this.setState({ startDate: selectedDate.clone().startOf('week') });

    // on week, structure change
    if (!prevState.startDate.isSame(startDate, 'day') || structure.id !== prevProps.structure.id) this.fetchCourses();

    // on structure change
    if (structure.id !== prevProps.structure.id) fetchSlots(structure.id);
  }

  updateSelectedDate = (newDate: moment.Moment) => {
    this.setState({
      selectedDate: newDate,
      startDate: newDate.clone().startOf('week'),
    });
  };

  public render() {
    return (
      <PageView>
        <StructurePicker />
        <DiaryTeacherTimetable
          {...this.props}
          startDate={this.state.startDate}
          selectedDate={this.state.selectedDate}
          updateSelectedDate={this.updateSelectedDate}
        />
      </PageView>
    );
  }
}

export default connect(
  (state: IGlobalState) => () => {
    const diaryState = moduleConfig.getState(state);
    const session = getSession(state);
    return {
      courses: getCoursesListState(state),
      slots: diaryState.slots,
      structure: { id: getSelectedStructure(state) },
      teacherId: session?.user.id,
      sessions: diaryState.sessions,
      homeworks: diaryState.homeworks,
    };
  },
  (dispatch: ThunkDispatch<any, any, any>) =>
    bindActionCreators(
      {
        fetchTeacherCourses: tryAction(fetchCourseListFromTeacherAction, undefined, true),
        fetchHomeworks: tryAction(fetchDiaryHomeworksAction, undefined, true),
        fetchSessions: tryAction(fetchDiarySessionsAction, undefined, true),
        fetchSlots: tryAction(fetchDiarySlotsAction, undefined, true),
      },
      dispatch,
    ),
)(DiaryTimetableScreen);
