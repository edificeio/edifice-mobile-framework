import type { NativeStackNavigationOptions, NativeStackScreenProps } from '@react-navigation/native-stack';
import I18n from 'i18n-js';
import moment from 'moment';
import * as React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { ThunkDispatch } from 'redux-thunk';

import { IGlobalState } from '~/app/store';
import { UI_STYLES } from '~/framework/components/constants';
import { PageView } from '~/framework/components/page';
import { getSession } from '~/framework/modules/auth/reducer';
import StructurePicker from '~/framework/modules/viescolaire/common/components/StructurePicker';
import viescoTheme from '~/framework/modules/viescolaire/common/theme';
import { fetchCourseListFromTeacherAction } from '~/framework/modules/viescolaire/dashboard/actions/courses';
import { getCoursesListState } from '~/framework/modules/viescolaire/dashboard/state/courses';
import { getSelectedStructure } from '~/framework/modules/viescolaire/dashboard/state/structure';
import {
  fetchDiaryHomeworksAction,
  fetchDiarySessionsAction,
  fetchDiarySlotsAction,
} from '~/framework/modules/viescolaire/diary/actions';
import DiaryTeacherTimetable from '~/framework/modules/viescolaire/diary/components/DiaryTimetableTeachers';
import moduleConfig from '~/framework/modules/viescolaire/diary/module-config';
import { DiaryNavigationParams, diaryRouteNames } from '~/framework/modules/viescolaire/diary/navigation';
import { navBarOptions } from '~/framework/navigation/navBar';
import { tryActionLegacy } from '~/framework/util/redux/actions';

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
    const { fetchTeacherCourses, fetchHomeworks, fetchSessions, structureId, userId } = this.props;
    fetchTeacherCourses(structureId, startDate, startDate.clone().endOf('week'), userId);
    fetchSessions(structureId, startDate.format('YYYY-MM-DD'), startDate.clone().endOf('week').format('YYYY-MM-DD'));
    fetchHomeworks(structureId, startDate.format('YYYY-MM-DD'), startDate.clone().endOf('week').format('YYYY-MM-DD'));
  };

  componentDidMount() {
    const { structureId } = this.props;
    this.fetchCourses();
    this.props.fetchSlots(structureId);
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

  updateSelectedDate = (newDate: moment.Moment) => {
    this.setState({
      selectedDate: newDate,
      startDate: newDate.clone().startOf('week'),
    });
  };

  public render() {
    return (
      <GestureHandlerRootView style={UI_STYLES.flex1}>
        <PageView>
          <StructurePicker />
          <DiaryTeacherTimetable
            {...this.props}
            startDate={this.state.startDate}
            selectedDate={this.state.selectedDate}
            updateSelectedDate={this.updateSelectedDate}
          />
        </PageView>
      </GestureHandlerRootView>
    );
  }
}

export default connect(
  (state: IGlobalState) => {
    const diaryState = moduleConfig.getState(state);
    const session = getSession();

    return {
      courses: getCoursesListState(state),
      homeworks: diaryState.homeworks,
      sessions: diaryState.sessions,
      slots: diaryState.slots,
      structureId: getSelectedStructure(state),
      userId: session?.user.id,
    };
  },
  (dispatch: ThunkDispatch<any, any, any>) =>
    bindActionCreators(
      {
        fetchHomeworks: tryActionLegacy(
          fetchDiaryHomeworksAction,
          undefined,
          true,
        ) as unknown as DiaryTimetableScreenPrivateProps['fetchHomeworks'],
        fetchSessions: tryActionLegacy(
          fetchDiarySessionsAction,
          undefined,
          true,
        ) as unknown as DiaryTimetableScreenPrivateProps['fetchSessions'],
        fetchSlots: tryActionLegacy(
          fetchDiarySlotsAction,
          undefined,
          true,
        ) as unknown as DiaryTimetableScreenPrivateProps['fetchSlots'],
        fetchTeacherCourses: tryActionLegacy(
          fetchCourseListFromTeacherAction,
          undefined,
          true,
        ) as unknown as DiaryTimetableScreenPrivateProps['fetchTeacherCourses'],
      },
      dispatch,
    ),
)(DiaryTimetableScreen);
