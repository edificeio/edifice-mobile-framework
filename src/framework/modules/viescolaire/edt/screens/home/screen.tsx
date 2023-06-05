import type { NativeStackNavigationOptions, NativeStackScreenProps } from '@react-navigation/native-stack';
import moment, { Moment } from 'moment';
import * as React from 'react';
import { RefreshControl } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { ThunkDispatch } from 'redux-thunk';

import { I18n } from '~/app/i18n';
import { IGlobalState } from '~/app/store';
import { UI_STYLES } from '~/framework/components/constants';
import { EmptyContentScreen } from '~/framework/components/emptyContentScreen';
import { LoadingIndicator } from '~/framework/components/loading';
import { PageView } from '~/framework/components/page';
import ScrollView from '~/framework/components/scrollView';
import { getSession } from '~/framework/modules/auth/reducer';
import { UserType } from '~/framework/modules/auth/service';
import ChildPicker from '~/framework/modules/viescolaire/common/components/ChildPicker';
import StructurePicker from '~/framework/modules/viescolaire/common/components/StructurePicker';
import { getSelectedChild, getSelectedChildStructure } from '~/framework/modules/viescolaire/dashboard/state/children';
import { getSelectedStructure } from '~/framework/modules/viescolaire/dashboard/state/structure';
import {
  fetchEdtClassGroupsAction,
  fetchEdtCoursesAction,
  fetchEdtSlotsAction,
  fetchEdtTeacherCoursesAction,
  fetchEdtTeachersAction,
  fetchEdtUserChildrenAction,
} from '~/framework/modules/viescolaire/edt/actions';
import Timetable from '~/framework/modules/viescolaire/edt/components/Timetable';
import moduleConfig from '~/framework/modules/viescolaire/edt/module-config';
import { EdtNavigationParams, edtRouteNames } from '~/framework/modules/viescolaire/edt/navigation';
import { navBarOptions } from '~/framework/navigation/navBar';
import { tryActionLegacy } from '~/framework/util/redux/actions';
import { AsyncPagedLoadingState } from '~/framework/util/redux/asyncPaged';

import { EdtHomeScreenPrivateProps } from './types';

export const computeNavBar = ({
  navigation,
  route,
}: NativeStackScreenProps<EdtNavigationParams, typeof edtRouteNames.home>): NativeStackNavigationOptions => ({
  ...navBarOptions({
    navigation,
    route,
    title: I18n.get('viesco-timetable'),
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
        await props.fetchTeacherCourses(structureId, startDate, endDate, userId);
      } else {
        let childClasses = classes;
        if (userType === UserType.Relative) {
          const children = await props.fetchUserChildren();
          childClasses = children.find(c => c.id === childId)?.idClasses;
        }
        const classGroups = await props.fetchClassGroups(childClasses ?? [], childId);
        await props.fetchChildCourses(structureId, startDate, endDate, classGroups);
      }
      await props.fetchTeachers(structureId);
      await props.fetchSlots(structureId);
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
      <ScrollView
        refreshControl={<RefreshControl refreshing={loadingState === AsyncPagedLoadingState.RETRY} onRefresh={() => reload()} />}>
        <EmptyContentScreen />
      </ScrollView>
    );
  };

  const renderTimetable = () => {
    return (
      <Timetable
        {...props}
        startDate={startDate}
        date={date}
        isRefreshing={loadingRef.current === AsyncPagedLoadingState.REFRESH}
        updateSelectedDate={updateSelectedDate}
      />
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
    <GestureHandlerRootView style={UI_STYLES.flex1}>
      <PageView>
        {props.userType === UserType.Teacher ? <StructurePicker /> : null}
        {props.userType === UserType.Relative ? <ChildPicker /> : null}
        {renderPage()}
      </PageView>
    </GestureHandlerRootView>
  );
};

export default connect(
  (state: IGlobalState) => {
    const edtState = moduleConfig.getState(state);
    const session = getSession();
    const userId = session?.user.id;
    const userType = session?.user.type;

    return {
      childId: userType === UserType.Student ? userId : getSelectedChild(state)?.id,
      classes: session?.user.classes,
      courses: edtState.courses.data,
      initialLoadingState: edtState.courses.isPristine ? AsyncPagedLoadingState.PRISTINE : AsyncPagedLoadingState.DONE,
      slots: edtState.slots.data,
      structureId:
        userType === UserType.Student
          ? session?.user.structures?.[0]?.id
          : userType === UserType.Relative
          ? getSelectedChildStructure(state)?.id
          : getSelectedStructure(state),
      teachers: edtState.teachers.data,
      userId,
      userType,
    };
  },
  (dispatch: ThunkDispatch<any, any, any>) =>
    bindActionCreators(
      {
        fetchChildCourses: tryActionLegacy(
          fetchEdtCoursesAction,
          undefined,
          true,
        ) as unknown as EdtHomeScreenPrivateProps['fetchChildCourses'],
        fetchClassGroups: tryActionLegacy(
          fetchEdtClassGroupsAction,
          undefined,
          true,
        ) as unknown as EdtHomeScreenPrivateProps['fetchClassGroups'],
        fetchSlots: tryActionLegacy(fetchEdtSlotsAction, undefined, true) as unknown as EdtHomeScreenPrivateProps['fetchSlots'],
        fetchTeacherCourses: tryActionLegacy(
          fetchEdtTeacherCoursesAction,
          undefined,
          true,
        ) as unknown as EdtHomeScreenPrivateProps['fetchTeacherCourses'],
        fetchTeachers: tryActionLegacy(
          fetchEdtTeachersAction,
          undefined,
          true,
        ) as unknown as EdtHomeScreenPrivateProps['fetchTeachers'],
        fetchUserChildren: tryActionLegacy(
          fetchEdtUserChildrenAction,
          undefined,
          true,
        ) as unknown as EdtHomeScreenPrivateProps['fetchUserChildren'],
      },
      dispatch,
    ),
)(EdtHomeScreen);
