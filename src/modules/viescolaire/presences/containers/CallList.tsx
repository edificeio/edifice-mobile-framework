import I18n from 'i18n-js';
import moment from 'moment';
import * as React from 'react';
import { AppState, AppStateStatus, RefreshControl, StyleSheet } from 'react-native';
import { NavigationFocusInjectedProps } from 'react-navigation';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import { UI_SIZES } from '~/framework/components/constants';
import { EmptyScreen } from '~/framework/components/emptyScreen';
import FlatList from '~/framework/components/flatList';
import { LoadingIndicator } from '~/framework/components/loading';
import { PageView } from '~/framework/components/page';
import { SmallBoldText } from '~/framework/components/text';
import { getUserSession } from '~/framework/util/session';
import StructurePicker from '~/modules/viescolaire/dashboard/containers/StructurePicker';
import { getSelectedStructure } from '~/modules/viescolaire/dashboard/state/structure';
import { viescoTheme } from '~/modules/viescolaire/dashboard/utils/viescoTheme';
import { fetchMultipleSlotsAction } from '~/modules/viescolaire/presences/actions/multipleSlots';
import { fetchRegiterPreferencesAction } from '~/modules/viescolaire/presences/actions/registerPreferences';
import { fetchCoursesRegisterAction } from '~/modules/viescolaire/presences/actions/teacherCourseRegister';
import { fetchCoursesAction } from '~/modules/viescolaire/presences/actions/teacherCourses';
import { CallCard } from '~/modules/viescolaire/presences/components/CallCard';
import presencesConfig from '~/modules/viescolaire/presences/moduleConfig';
import { IMultipleSlotsState, getMultipleSlotsState } from '~/modules/viescolaire/presences/state/multipleSlots';
import { IRegisterPreferencesState, getRegisterPreferencesState } from '~/modules/viescolaire/presences/state/registerPreferences';
import { getCoursesRegisterState } from '~/modules/viescolaire/presences/state/teacherCourseRegister';
import { ICourses, getCoursesListState } from '~/modules/viescolaire/presences/state/teacherCourses';

const styles = StyleSheet.create({
  mainContainer: {
    flexGrow: 1,
  },
  courseContainer: {
    marginHorizontal: UI_SIZES.spacing.medium,
    marginBottom: UI_SIZES.spacing.medium,
  },
  dateText: {
    marginLeft: UI_SIZES.spacing.medium,
    marginVertical: UI_SIZES.spacing.small,
  },
});

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
} & NavigationFocusInjectedProps;

type ICallListContainerState = {
  isFetchData: boolean;
};

class CallList extends React.PureComponent<ICallListContainerProps, ICallListContainerState> {
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
    const { isFocused, structureId, multipleSlots, registerPreferences } = this.props;

    if (this.state.isFetchData) {
      this.props.getRegisterPreferences();
      this.props.getMultipleSlots(this.props.structureId);
      this.fetchTodayCourses();
      this.setState({ isFetchData: false });
    } else if (
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
      this.setState({ isFetchData: true });
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
      split_slot: this.props.multipleSlots.data.allow_multiple_slots,
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

    this.props.navigation.navigate(`${presencesConfig.routeName}/call`, { courseInfos: courseRegisterInfos });
  };

  render() {
    const { isFetching, courses } = this.props;
    const dateText = `${I18n.t('viesco-register-date')} ${moment().format('DD MMMM YYYY')}`;
    return (
      <PageView
        navigation={this.props.navigation}
        navBarWithBack={{
          title: I18n.t('viesco-presences'),
          style: {
            backgroundColor: viescoTheme.palette.presences,
          },
        }}
        style={styles.mainContainer}>
        <StructurePicker />
        <SmallBoldText style={styles.dateText}>{dateText}</SmallBoldText>
        {!courses.length && isFetching ? (
          <LoadingIndicator />
        ) : (
          <FlatList
            data={courses}
            renderItem={({ item }) => <CallCard course={item} onPress={() => this.openCall(item)} style={styles.courseContainer} />}
            keyExtractor={item => item.id + item.startDate}
            refreshControl={<RefreshControl refreshing={isFetching} onRefresh={this.fetchTodayCourses} />}
            ListEmptyComponent={<EmptyScreen svgImage="empty-absences" title={I18n.t('viesco-no-register-today')} />}
          />
        )}
      </PageView>
    );
  }
}

const mapStateToProps = (gs: any): any => {
  const courses = getCoursesListState(gs);
  const registerData = getCoursesRegisterState(gs);

  return {
    courses: courses.data.filter(course => course.allowRegister === true),
    teacherId: getUserSession().user.id,
    structureId: getSelectedStructure(gs),
    isFetching: courses.isFetching || registerData.isFetching,
    multipleSlots: getMultipleSlotsState(gs),
    registerPreferences: getRegisterPreferencesState(gs),
  };
};

const mapDispatchToProps = (dispatch: any): any => {
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

export default connect(mapStateToProps, mapDispatchToProps)(CallList);
