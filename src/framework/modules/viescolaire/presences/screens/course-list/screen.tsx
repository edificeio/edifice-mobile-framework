import type { NativeStackNavigationOptions, NativeStackScreenProps } from '@react-navigation/native-stack';
import I18n from 'i18n-js';
import moment from 'moment';
import * as React from 'react';
import { AppState, AppStateStatus, RefreshControl, StyleSheet } from 'react-native';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { ThunkDispatch } from 'redux-thunk';

import { IGlobalState } from '~/app/store';
import { UI_SIZES } from '~/framework/components/constants';
import { EmptyScreen } from '~/framework/components/emptyScreen';
import FlatList from '~/framework/components/flatList';
import { LoadingIndicator } from '~/framework/components/loading';
import { PageView } from '~/framework/components/page';
import { SmallBoldText } from '~/framework/components/text';
import { getSession } from '~/framework/modules/auth/reducer';
import StructurePicker from '~/framework/modules/viescolaire/common/components/StructurePicker';
import viescoTheme from '~/framework/modules/viescolaire/common/theme';
import { getSelectedStructure } from '~/framework/modules/viescolaire/dashboard/state/structure';
import { CallCard } from '~/framework/modules/viescolaire/presences/components/CallCard';
import moduleConfig from '~/framework/modules/viescolaire/presences/module-config';
import { PresencesNavigationParams, presencesRouteNames } from '~/framework/modules/viescolaire/presences/navigation';
import { navBarOptions } from '~/framework/navigation/navBar';
import { tryAction } from '~/framework/util/redux/actions';
import { fetchMultipleSlotsAction } from '~/modules/viescolaire/presences/actions/multipleSlots';
import { fetchRegiterPreferencesAction } from '~/modules/viescolaire/presences/actions/registerPreferences';
import { fetchCoursesRegisterAction } from '~/modules/viescolaire/presences/actions/teacherCourseRegister';
import { fetchCoursesAction } from '~/modules/viescolaire/presences/actions/teacherCourses';
import { getCoursesRegisterState } from '~/modules/viescolaire/presences/state/teacherCourseRegister';
import { ICourses, getCoursesListState } from '~/modules/viescolaire/presences/state/teacherCourses';

import { PresencesCourseListScreenPrivateProps } from './types';

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

type PresencesCourseListScreenState = {
  isFetchData: boolean;
};

export const computeNavBar = ({
  navigation,
  route,
}: NativeStackScreenProps<PresencesNavigationParams, typeof presencesRouteNames.courseList>): NativeStackNavigationOptions => ({
  ...navBarOptions({
    navigation,
    route,
  }),
  title: I18n.t('viesco-presences'),
  headerStyle: {
    backgroundColor: viescoTheme.palette.presences,
  },
});

class PresencesCourseListScreen extends React.PureComponent<PresencesCourseListScreenPrivateProps, PresencesCourseListScreenState> {
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
    if (this.props.multipleSlots) {
      multipleSlot = JSON.parse(this.props.registerPreferences).multipleSlot;
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

    this.props.navigation.navigate(`${moduleConfig.routeName}/call`, { courseInfos: courseRegisterInfos });
  };

  render() {
    const { isFetching, courses } = this.props;
    const dateText = `${I18n.t('viesco-register-date')} ${moment().format('DD MMMM YYYY')}`;
    return (
      <PageView style={styles.mainContainer}>
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

export default connect(
  (state: IGlobalState) => {
    const presencesState = moduleConfig.getState(state);
    const session = getSession(state);
    const courses = getCoursesListState(state);
    const registerData = getCoursesRegisterState(state);

    return {
      courses: courses.data.filter(course => course.allowRegister === true),
      teacherId: session?.user.id,
      structureId: getSelectedStructure(state),
      isFetching: courses.isFetching || registerData.isFetching,
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
)(PresencesCourseListScreen);
