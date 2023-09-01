import type { NativeStackNavigationOptions, NativeStackScreenProps } from '@react-navigation/native-stack';
import moment, { Moment } from 'moment';
import * as React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import { I18n } from '~/app/i18n';
import { IGlobalState } from '~/app/store';
import { PageView } from '~/framework/components/page';
import { getSession } from '~/framework/modules/auth/reducer';
import StructurePicker from '~/framework/modules/viescolaire/common/components/StructurePicker';
import dashboardConfig from '~/framework/modules/viescolaire/dashboard/module-config';
import {
  fetchDiaryCoursesAction,
  fetchDiaryHomeworksAction,
  fetchDiarySessionsAction,
  fetchDiarySlotsAction,
} from '~/framework/modules/viescolaire/diary/actions';
import DiaryTeacherTimetable from '~/framework/modules/viescolaire/diary/components/DiaryTimetableTeachers';
import moduleConfig from '~/framework/modules/viescolaire/diary/module-config';
import { DiaryNavigationParams, diaryRouteNames } from '~/framework/modules/viescolaire/diary/navigation';
import { navBarOptions } from '~/framework/navigation/navBar';
import { tryAction } from '~/framework/util/redux/actions';

import type { DiaryTimetableScreenDispatchProps, DiaryTimetableScreenPrivateProps } from './types';

export type TimetableState = {
  startDate: Moment;
  selectedDate: Moment;
};

export const computeNavBar = ({
  navigation,
  route,
}: NativeStackScreenProps<DiaryNavigationParams, typeof diaryRouteNames.timetable>): NativeStackNavigationOptions => ({
  ...navBarOptions({
    navigation,
    route,
    title: I18n.get('diary-timetable-title'),
  }),
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
    const { structureId, userId } = this.props;
    this.props.tryFetchCourses(structureId, userId, startDate, startDate.clone().endOf('week'));
    this.props.tryFetchSessions(structureId, startDate.format('YYYY-MM-DD'), startDate.clone().endOf('week').format('YYYY-MM-DD'));
    this.props.tryFetchHomeworks(structureId, startDate.format('YYYY-MM-DD'), startDate.clone().endOf('week').format('YYYY-MM-DD'));
  };

  componentDidMount() {
    const { structureId } = this.props;
    this.fetchCourses();
    this.props.tryFetchSlots(structureId);
  }

  componentDidUpdate(prevProps, prevState) {
    const { startDate, selectedDate } = this.state;
    const { structureId, fetchSlots } = this.props;

    // on selected date change
    if (!prevState.selectedDate.isSame(selectedDate, 'day')) this.setState({ startDate: selectedDate.clone().startOf('week') });

    // on week, structure change
    if (!prevState.startDate.isSame(startDate, 'day') || structureId !== prevProps.structureId) this.fetchCourses();

    // on structure change
    if (structureId !== prevProps.structureId) fetchSlots(structureId);
  }

  updateSelectedDate = (newDate: Moment) => {
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
  (state: IGlobalState) => {
    const diaryState = moduleConfig.getState(state);
    const dashboardState = dashboardConfig.getState(state);
    const session = getSession();

    return {
      courses: diaryState.courses,
      homeworks: diaryState.homeworks,
      sessions: diaryState.sessions,
      slots: diaryState.slots,
      structureId: dashboardState.selectedStructureId,
      userId: session?.user.id,
    };
  },
  dispatch =>
    bindActionCreators<DiaryTimetableScreenDispatchProps>(
      {
        tryFetchCourses: tryAction(fetchDiaryCoursesAction),
        tryFetchHomeworks: tryAction(fetchDiaryHomeworksAction),
        tryFetchSessions: tryAction(fetchDiarySessionsAction),
        tryFetchSlots: tryAction(fetchDiarySlotsAction),
      },
      dispatch,
    ),
)(DiaryTimetableScreen);
