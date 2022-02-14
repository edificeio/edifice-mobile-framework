import I18n from 'i18n-js';
import moment from 'moment';
import * as React from 'react';
import { View } from 'react-native';
import { NavigationScreenProp } from 'react-navigation';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import { getSessionInfo } from '~/App';
import { fetchHomeworkListAction } from '~/modules/viescolaire/cdt/actions/homeworks';
import { fetchSessionListAction } from '~/modules/viescolaire/cdt/actions/sessions';
import { fetchSlotListAction } from '~/modules/viescolaire/cdt/actions/timeSlots';
import TeacherCdtTimetable from '~/modules/viescolaire/cdt/components/CdtTimetableTeachers';
import { getHomeworksListState, IHomeworkListState } from '~/modules/viescolaire/cdt/state/homeworks';
import { getSessionsListState, ISessionListState } from '~/modules/viescolaire/cdt/state/sessions';
import { getSlotsListState, ITimeSlotsState } from '~/modules/viescolaire/cdt/state/timeSlots';
import { fetchCourseListFromTeacherAction } from '~/modules/viescolaire/viesco/actions/courses';
import { getCoursesListState, ICourseListState } from '~/modules/viescolaire/viesco/state/courses';
import { getSelectedStructure } from '~/modules/viescolaire/viesco/state/structure';
import { standardNavScreenOptions } from '~/navigation/helpers/navScreenOptions';
import { INavigationProps } from '~/types';
import { HeaderBackAction } from '~/ui/headers/NewHeader';

export type TimetableProps = {
  courses: ICourseListState;
  sessions: ISessionListState;
  homeworks: IHomeworkListState;
  slots: ITimeSlotsState;
  structure: { id: string };
  teacherId: string;
  fetchTeacherCourses: (structureId: string, startDate: moment.Moment, endDate: moment.Moment, teacherId: string) => void;
  fetchHomeworks: (structureId: string, startDate: string, endDAte: string) => void;
  fetchSessions: (structureId: string, startDate: string, endDAte: string) => void;
  fetchSlots: (structureId: string) => void;
} & INavigationProps;

export type TimetableState = {
  startDate: moment.Moment;
  selectedDate: moment.Moment;
};

class TeacherTimetableContainer extends React.PureComponent<TimetableProps, TimetableState> {
  static navigationOptions = ({ navigation }: { navigation: NavigationScreenProp<object> }) => {
    return standardNavScreenOptions(
      {
        title: I18n.t('viesco-timetable'),
        headerLeft: () => <HeaderBackAction navigation={navigation} />,
        headerRight: () => <View />,
        headerStyle: {
          backgroundColor: '#00AB6F',
        },
      },
      navigation,
    );
  };

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
      <TeacherCdtTimetable
        {...this.props}
        startDate={this.state.startDate}
        selectedDate={this.state.selectedDate}
        updateSelectedDate={this.updateSelectedDate}
      />
    );
  }
}

const mapStateToProps = (state: any): any => {
  return {
    courses: getCoursesListState(state),
    slots: getSlotsListState(state),
    structure: { id: getSelectedStructure(state) },
    teacherId: getSessionInfo().id,
    sessions: getSessionsListState(state),
    homeworks: getHomeworksListState(state),
  };
};

const mapDispatchToProps = (dispatch: any): any =>
  bindActionCreators(
    {
      fetchTeacherCourses: fetchCourseListFromTeacherAction,
      fetchHomeworks: fetchHomeworkListAction,
      fetchSessions: fetchSessionListAction,
      fetchSlots: fetchSlotListAction,
    },
    dispatch,
  );

export default connect(mapStateToProps, mapDispatchToProps)(TeacherTimetableContainer);
