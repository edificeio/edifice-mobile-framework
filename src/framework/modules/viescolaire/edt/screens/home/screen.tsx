import type { NativeStackNavigationOptions, NativeStackScreenProps } from '@react-navigation/native-stack';
import moment, { Moment } from 'moment';
import * as React from 'react';
import { RefreshControl, ScrollView, View } from 'react-native';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import { I18n } from '~/app/i18n';
import { IGlobalState } from '~/app/store';
import DateTimePicker from '~/framework/components/dateTimePicker';
import { EmptyContentScreen } from '~/framework/components/emptyContentScreen';
import { LoadingIndicator } from '~/framework/components/loading';
import { PageView } from '~/framework/components/page';
import { Icon } from '~/framework/components/picture/Icon';
import { HeadingXSText, SmallBoldItalicText, SmallText } from '~/framework/components/text';
import { getSession } from '~/framework/modules/auth/reducer';
import { UserType } from '~/framework/modules/auth/service';
import ChildPicker from '~/framework/modules/viescolaire/common/components/ChildPicker';
import StructurePicker from '~/framework/modules/viescolaire/common/components/StructurePicker';
import Timetable from '~/framework/modules/viescolaire/common/components/Timetable';
import viescoTheme from '~/framework/modules/viescolaire/common/theme';
import { getChildStructureId } from '~/framework/modules/viescolaire/common/utils/child';
import dashboardConfig from '~/framework/modules/viescolaire/dashboard/module-config';
import {
  fetchEdtClassGroupsAction,
  fetchEdtCoursesAction,
  fetchEdtSlotsAction,
  fetchEdtTeacherCoursesAction,
  fetchEdtTeachersAction,
  fetchEdtUserChildrenAction,
} from '~/framework/modules/viescolaire/edt/actions';
import { IEdtCourse } from '~/framework/modules/viescolaire/edt/model';
import moduleConfig from '~/framework/modules/viescolaire/edt/module-config';
import { EdtNavigationParams, edtRouteNames } from '~/framework/modules/viescolaire/edt/navigation';
import { navBarOptions } from '~/framework/navigation/navBar';
import { tryAction } from '~/framework/util/redux/actions';
import { AsyncPagedLoadingState } from '~/framework/util/redux/asyncPaged';

import styles from './styles';
import { EdtHomeScreenDispatchProps, EdtHomeScreenPrivateProps } from './types';

export const computeNavBar = ({
  navigation,
  route,
}: NativeStackScreenProps<EdtNavigationParams, typeof edtRouteNames.home>): NativeStackNavigationOptions => ({
  ...navBarOptions({
    navigation,
    route,
    title: I18n.get('edt-home-title'),
  }),
});

const EdtHomeScreen = (props: EdtHomeScreenPrivateProps) => {
  const [date, setDate] = React.useState<Moment>(moment());
  const [startDate, setStartDate] = React.useState<Moment>(moment().startOf('week'));
  const [loadingState, setLoadingState] = React.useState(props.initialLoadingState ?? AsyncPagedLoadingState.PRISTINE);
  const loadingRef = React.useRef<AsyncPagedLoadingState>();
  loadingRef.current = loadingState;
  // /!\ Need to use Ref of the state because of hooks Closure issue. @see https://stackoverflow.com/a/56554056/6111343

  const fetchTimetable = async () => {
    try {
      const { childId, classes, structureId, userId, userType } = props;
      const endDate = startDate.clone().endOf('week');

      if (!structureId || !userId || !userType) throw new Error();
      if (userType === UserType.Teacher) {
        await props.tryFetchTeacherCourses(structureId, startDate, endDate, userId);
      } else {
        let childClasses = classes;
        if (userType === UserType.Relative) {
          const children = await props.tryFetchUserChildren();
          childClasses = children.find(c => c.id === childId)?.idClasses;
        }
        const classGroups = await props.tryFetchClassGroups(childClasses ?? [], childId);
        await props.tryFetchCourses(structureId, startDate, endDate, classGroups);
      }
      await props.tryFetchTeachers(structureId);
      await props.tryFetchSlots(structureId);
    } catch {
      throw new Error();
    }
  };

  const init = () => {
    setLoadingState(AsyncPagedLoadingState.INIT);
    fetchTimetable()
      .then(() => setLoadingState(AsyncPagedLoadingState.DONE))
      .catch(() => setLoadingState(AsyncPagedLoadingState.INIT_FAILED));
  };

  const reload = () => {
    setLoadingState(AsyncPagedLoadingState.RETRY);
    fetchTimetable()
      .then(() => setLoadingState(AsyncPagedLoadingState.DONE))
      .catch(() => setLoadingState(AsyncPagedLoadingState.INIT_FAILED));
  };

  const refresh = () => {
    setLoadingState(AsyncPagedLoadingState.REFRESH);
    fetchTimetable()
      .then(() => setLoadingState(AsyncPagedLoadingState.DONE))
      .catch(() => setLoadingState(AsyncPagedLoadingState.REFRESH_FAILED));
  };

  const refreshSilent = () => {
    setLoadingState(AsyncPagedLoadingState.REFRESH_SILENT);
    fetchTimetable()
      .then(() => setLoadingState(AsyncPagedLoadingState.DONE))
      .catch(() => setLoadingState(AsyncPagedLoadingState.REFRESH_FAILED));
  };

  React.useEffect(() => {
    const unsubscribe = props.navigation.addListener('focus', () => {
      if (loadingRef.current === AsyncPagedLoadingState.PRISTINE) init();
      else refreshSilent();
    });
    return unsubscribe;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.navigation]);

  React.useEffect(() => {
    if (loadingRef.current === AsyncPagedLoadingState.DONE) init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.childId, props.structureId]);

  React.useEffect(() => {
    if (loadingRef.current === AsyncPagedLoadingState.DONE) refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startDate]);

  const updateSelectedDate = (newDate: Moment) => {
    const newStartDate = newDate.clone().startOf('week');
    setDate(newDate);
    if (!newStartDate.isSame(startDate, 'day')) setStartDate(newStartDate);
  };

  const renderError = () => {
    return (
      <ScrollView refreshControl={<RefreshControl refreshing={loadingState === AsyncPagedLoadingState.RETRY} onRefresh={reload} />}>
        <EmptyContentScreen />
      </ScrollView>
    );
  };

  const getTeacherName = (teacherIds: string[]): string => {
    return props.teachers.find(teacher => teacher.id === teacherIds[0])?.displayName ?? '';
  };

  const renderCourse = (course: IEdtCourse) => {
    const isTeacher = props.userType === UserType.Teacher;
    const className = course.classes.length ? course.classes[0] : course.groups[0];
    const firstText = isTeacher ? className : course.subject.name;
    const secondText = isTeacher ? course.subject.name : getTeacherName(course.teacherIds);
    const hasTag = course.tags.length > 0 && course.tags[0].label.toLocaleUpperCase() !== 'ULIS';
    const isActive = moment().isBetween(course.startDate, course.endDate);

    return (
      <View style={[styles.courseView, hasTag && styles.taggedCourseBackground, isActive && styles.activeCourseBorder]}>
        <View style={styles.subjectView}>
          <HeadingXSText numberOfLines={1}>{firstText}</HeadingXSText>
          <SmallText numberOfLines={1}>{secondText}</SmallText>
        </View>
        <View>
          {course.roomLabels[0]?.length ? (
            <View style={styles.roomView}>
              <Icon name="pin_drop" size={16} />
              <SmallText numberOfLines={1}>&nbsp;{`${I18n.get('edt-home-course-room')} ${course.roomLabels[0]}`}</SmallText>
            </View>
          ) : null}
          {course.tags.length ? <SmallBoldItalicText numberOfLines={1}>{course.tags[0].label}</SmallBoldItalicText> : null}
        </View>
      </View>
    );
  };

  const renderHalfCourse = (course: IEdtCourse) => {
    const isTeacher = props.userType === UserType.Teacher;
    const className = course.classes.length ? course.classes[0] : course.groups[0];
    const firstText = isTeacher ? className : course.subject.name;
    const secondText = isTeacher ? course.subject.name : getTeacherName(course.teacherIds);
    const hasTag = course.tags.length > 0 && course.tags[0].label.toLocaleUpperCase() !== 'ULIS';
    const isActive = moment().isBetween(course.startDate, course.endDate);

    return (
      <View style={[styles.halfCourseView, hasTag && styles.taggedCourseBackground, isActive && styles.activeCourseBorder]}>
        <View style={styles.halfSplitLineView}>
          <HeadingXSText style={styles.halfTextStyle} numberOfLines={1}>
            {firstText}
          </HeadingXSText>
          {course.roomLabels[0]?.length ? (
            <View style={styles.halfRoomLabelContainer}>
              <Icon name="pin_drop" size={16} />
              <SmallText numberOfLines={1}>{course.roomLabels[0]}</SmallText>
            </View>
          ) : null}
        </View>
        <View style={styles.halfSplitLineView}>
          <SmallText style={styles.halfTextStyle} numberOfLines={1}>
            {secondText}
          </SmallText>
          {course.tags.length ? <SmallBoldItalicText numberOfLines={1}>{course.tags[0].label}</SmallBoldItalicText> : null}
        </View>
      </View>
    );
  };

  const renderTimetable = () => {
    return (
      <>
        <View style={styles.weekPickerView}>
          <SmallText style={styles.weekText}>{I18n.get('edt-home-week')}</SmallText>
          <DateTimePicker mode="date" value={startDate} onChangeValue={updateSelectedDate} iconColor={viescoTheme.palette.edt} />
        </View>
        {loadingState === AsyncPagedLoadingState.REFRESH ? (
          <LoadingIndicator />
        ) : (
          <Timetable
            courses={props.courses}
            mainColor={viescoTheme.palette.edt}
            slots={props.slots}
            startDate={startDate}
            initialSelectedDate={date}
            renderCourse={renderCourse}
            renderCourseHalf={renderHalfCourse}
          />
        )}
      </>
    );
  };

  const renderPage = () => {
    switch (loadingState) {
      case AsyncPagedLoadingState.DONE:
      case AsyncPagedLoadingState.REFRESH:
      case AsyncPagedLoadingState.REFRESH_FAILED:
      case AsyncPagedLoadingState.REFRESH_SILENT:
        return renderTimetable();
      case AsyncPagedLoadingState.PRISTINE:
      case AsyncPagedLoadingState.INIT:
        return <LoadingIndicator />;
      case AsyncPagedLoadingState.INIT_FAILED:
      case AsyncPagedLoadingState.RETRY:
        return renderError();
    }
  };

  return (
    <PageView>
      {props.userType === UserType.Teacher ? <StructurePicker /> : null}
      {props.userType === UserType.Relative ? <ChildPicker /> : null}
      {renderPage()}
    </PageView>
  );
};

export default connect(
  (state: IGlobalState) => {
    const edtState = moduleConfig.getState(state);
    const dashboardState = dashboardConfig.getState(state);
    const session = getSession();
    const userId = session?.user.id;
    const userType = session?.user.type;

    return {
      childId: userType === UserType.Student ? userId : dashboardState.selectedChildId,
      classes: session?.user.classes,
      courses: edtState.courses.data,
      initialLoadingState: edtState.courses.isPristine ? AsyncPagedLoadingState.PRISTINE : AsyncPagedLoadingState.DONE,
      slots: edtState.slots.data,
      structureId:
        userType === UserType.Student
          ? session?.user.structures?.[0]?.id
          : userType === UserType.Relative
          ? getChildStructureId(dashboardState.selectedChildId)
          : dashboardState.selectedStructureId,
      teachers: edtState.teachers.data,
      userId,
      userType,
    };
  },
  dispatch =>
    bindActionCreators<EdtHomeScreenDispatchProps>(
      {
        tryFetchClassGroups: tryAction(fetchEdtClassGroupsAction),
        tryFetchCourses: tryAction(fetchEdtCoursesAction),
        tryFetchSlots: tryAction(fetchEdtSlotsAction),
        tryFetchTeacherCourses: tryAction(fetchEdtTeacherCoursesAction),
        tryFetchTeachers: tryAction(fetchEdtTeachersAction),
        tryFetchUserChildren: tryAction(fetchEdtUserChildrenAction),
      },
      dispatch,
    ),
)(EdtHomeScreen);
