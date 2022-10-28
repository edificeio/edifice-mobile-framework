import I18n from 'i18n-js';
import moment from 'moment';
import * as React from 'react';
import { NavigationInjectedProps } from 'react-navigation';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import { PageView } from '~/framework/components/page';
import { AsyncState } from '~/framework/util/redux/async';
import { getUserSession } from '~/framework/util/session';
import { fetchCourseListFromTeacherAction } from '~/modules/viescolaire/dashboard/actions/courses';
import StructurePicker from '~/modules/viescolaire/dashboard/containers/StructurePicker';
import { ICourseListState, getCoursesListState } from '~/modules/viescolaire/dashboard/state/courses';
import { getSelectedStructure } from '~/modules/viescolaire/dashboard/state/structure';
import { viescoTheme } from '~/modules/viescolaire/dashboard/utils/viescoTheme';
import { fetchDiaryHomeworksAction, fetchDiarySessionsAction, fetchDiarySlotsAction } from '~/modules/viescolaire/diary/actions';
import DiaryTeacherTimetable from '~/modules/viescolaire/diary/components/DiaryTimetableTeachers';
import moduleConfig from '~/modules/viescolaire/diary/moduleConfig';
import { IHomeworkMap, ISession } from '~/modules/viescolaire/diary/reducer';
import { ISlot } from '~/modules/viescolaire/edt/reducer';

export type TimetableProps = {
  courses: ICourseListState;
  sessions: AsyncState<ISession[]>;
  homeworks: AsyncState<IHomeworkMap>;
  slots: AsyncState<ISlot[]>;
  structure: { id: string };
  teacherId: string;
  fetchTeacherCourses: (structureId: string, startDate: moment.Moment, endDate: moment.Moment, teacherId: string) => void;
  fetchHomeworks: (structureId: string, startDate: string, endDAte: string) => void;
  fetchSessions: (structureId: string, startDate: string, endDAte: string) => void;
  fetchSlots: (structureId: string) => void;
} & NavigationInjectedProps;

export type TimetableState = {
  startDate: moment.Moment;
  selectedDate: moment.Moment;
};

class TeacherTimetableContainer extends React.PureComponent<TimetableProps, TimetableState> {
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
      <PageView
        navigation={this.props.navigation}
        navBarWithBack={{
          title: I18n.t('Homework'),
          style: {
            backgroundColor: viescoTheme.palette.diary,
          },
        }}>
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

const mapStateToProps = (gs: any): any => {
  const state = moduleConfig.getState(gs);
  return {
    courses: getCoursesListState(gs),
    slots: state.slots,
    structure: { id: getSelectedStructure(gs) },
    teacherId: getUserSession().user.id,
    sessions: state.sessions,
    homeworks: state.homeworks,
  };
};

const mapDispatchToProps = (dispatch: any): any =>
  bindActionCreators(
    {
      fetchTeacherCourses: fetchCourseListFromTeacherAction,
      fetchHomeworks: fetchDiaryHomeworksAction,
      fetchSessions: fetchDiarySessionsAction,
      fetchSlots: fetchDiarySlotsAction,
    },
    dispatch,
  );

export default connect(mapStateToProps, mapDispatchToProps)(TeacherTimetableContainer);
