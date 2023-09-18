import { NativeStackScreenProps } from '@react-navigation/native-stack';
import moment from 'moment';
import * as React from 'react';
import { RefreshControl, ScrollView } from 'react-native';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import { I18n } from '~/app/i18n';
import { IGlobalState } from '~/app/store';
import { EmptyContentScreen } from '~/framework/components/empty-screens';
import { LoadingIndicator } from '~/framework/components/loading';
import Toast from '~/framework/components/toast';
import { ISession } from '~/framework/modules/auth/model';
import { getSession } from '~/framework/modules/auth/reducer';
import dashboardConfig from '~/framework/modules/viescolaire/dashboard/module-config';
import {
  fetchPresencesCoursesAction,
  fetchPresencesEventReasonsAction,
  fetchPresencesMultipleSlotSettingAction,
  fetchPresencesRegisterPreferenceAction,
} from '~/framework/modules/viescolaire/presences/actions';
import CourseList from '~/framework/modules/viescolaire/presences/components/CourseListOld';
import { Course, EventReason } from '~/framework/modules/viescolaire/presences/model';
import moduleConfig from '~/framework/modules/viescolaire/presences/module-config';
import { PresencesNavigationParams, presencesRouteNames } from '~/framework/modules/viescolaire/presences/navigation';
import { presencesService } from '~/framework/modules/viescolaire/presences/service';
import { tryAction } from '~/framework/util/redux/actions';
import { AsyncPagedLoadingState } from '~/framework/util/redux/asyncPaged';

interface PresencesCourseListScreenOldDispatchProps {
  tryFetchCourses: (...args: Parameters<typeof fetchPresencesCoursesAction>) => Promise<Course[]>;
  tryFetchMultipleSlotsSetting: (...args: Parameters<typeof fetchPresencesMultipleSlotSettingAction>) => Promise<boolean>;
  tryFetchRegisterPreference: (...args: Parameters<typeof fetchPresencesRegisterPreferenceAction>) => Promise<string>;
  tryFetchEventReasons: (...args: Parameters<typeof fetchPresencesEventReasonsAction>) => Promise<EventReason[]>;
}

type PresencesCourseListScreenOldProps = {
  allowMultipleSlots: boolean;
  courses: Course[];
  initialLoadingState: AsyncPagedLoadingState;
  registerId: string;
  registerPreference: string;
  session?: ISession;
  structureId?: string;
  teacherId?: string;
} & PresencesCourseListScreenOldDispatchProps &
  NativeStackScreenProps<PresencesNavigationParams, typeof presencesRouteNames.courseList>;

const PresencesCourseListScreenOld = (props: PresencesCourseListScreenOldProps) => {
  const [loadingState, setLoadingState] = React.useState(props.initialLoadingState ?? AsyncPagedLoadingState.PRISTINE);
  const loadingRef = React.useRef<AsyncPagedLoadingState>();
  loadingRef.current = loadingState;
  // /!\ Need to use Ref of the state because of hooks Closure issue. @see https://stackoverflow.com/a/56554056/6111343

  const fetchCourses = async () => {
    try {
      const { structureId, teacherId } = props;

      if (!structureId || !teacherId) throw new Error();
      const allowMultipleSlots = await props.tryFetchMultipleSlotsSetting(structureId);
      const registerPreference = await props.tryFetchRegisterPreference();
      await props.tryFetchEventReasons(structureId);
      const today = moment().format('YYYY-MM-DD');
      let multipleSlot = true;
      if (allowMultipleSlots && registerPreference) {
        multipleSlot = JSON.parse(registerPreference).multipleSlot;
      }
      await props.tryFetchCourses(teacherId, [structureId], today, multipleSlot);
    } catch {
      throw new Error();
    }
  };

  const init = () => {
    setLoadingState(AsyncPagedLoadingState.INIT);
    fetchCourses()
      .then(() => setLoadingState(AsyncPagedLoadingState.DONE))
      .catch(() => setLoadingState(AsyncPagedLoadingState.INIT_FAILED));
  };

  const reload = () => {
    setLoadingState(AsyncPagedLoadingState.RETRY);
    fetchCourses()
      .then(() => setLoadingState(AsyncPagedLoadingState.DONE))
      .catch(() => setLoadingState(AsyncPagedLoadingState.INIT_FAILED));
  };

  const refresh = () => {
    setLoadingState(AsyncPagedLoadingState.REFRESH);
    fetchCourses()
      .then(() => setLoadingState(AsyncPagedLoadingState.DONE))
      .catch(() => setLoadingState(AsyncPagedLoadingState.REFRESH_FAILED));
  };

  const refreshSilent = () => {
    setLoadingState(AsyncPagedLoadingState.REFRESH_SILENT);
    fetchCourses()
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
  }, [props.navigation, props.structureId]);

  React.useEffect(() => {
    if (loadingRef.current === AsyncPagedLoadingState.DONE) refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.structureId]);

  const openCall = async (course: Course) => {
    try {
      let { callId } = course;

      if (!callId) {
        const { allowMultipleSlots, session, teacherId } = props;
        if (!session || !teacherId) throw new Error();
        callId = await presencesService.call.create(session, course, teacherId, allowMultipleSlots);
      }
      props.navigation.navigate(presencesRouteNames.call, {
        course,
        id: callId,
      });
    } catch {
      Toast.showError(I18n.get('presences-courselistold-error-text'));
    }
  };

  const renderError = () => {
    return (
      <ScrollView refreshControl={<RefreshControl refreshing={loadingState === AsyncPagedLoadingState.RETRY} onRefresh={reload} />}>
        <EmptyContentScreen />
      </ScrollView>
    );
  };

  const renderCourseList = () => {
    return (
      <CourseList courses={props.courses} isFetching={loadingState === AsyncPagedLoadingState.REFRESH} onCoursePress={openCall} />
    );
  };

  const renderPage = () => {
    switch (loadingState) {
      case AsyncPagedLoadingState.DONE:
      case AsyncPagedLoadingState.REFRESH:
      case AsyncPagedLoadingState.REFRESH_FAILED:
      case AsyncPagedLoadingState.REFRESH_SILENT:
        return renderCourseList();
      case AsyncPagedLoadingState.PRISTINE:
      case AsyncPagedLoadingState.INIT:
        return <LoadingIndicator />;
      case AsyncPagedLoadingState.INIT_FAILED:
      case AsyncPagedLoadingState.RETRY:
        return renderError();
    }
  };

  return renderPage();
};

export default connect(
  (state: IGlobalState) => {
    const presencesState = moduleConfig.getState(state);
    const dashboardState = dashboardConfig.getState(state);
    const session = getSession();

    return {
      allowMultipleSlots: presencesState.allowMultipleSlots.data,
      courses: presencesState.courses.data,
      initialLoadingState: presencesState.courses.isPristine ? AsyncPagedLoadingState.PRISTINE : AsyncPagedLoadingState.DONE,
      registerPreference: presencesState.registerPreference.data,
      session,
      structureId: dashboardState.selectedStructureId,
      teacherId: session?.user.id,
    };
  },
  dispatch =>
    bindActionCreators<PresencesCourseListScreenOldDispatchProps>(
      {
        tryFetchCourses: tryAction(fetchPresencesCoursesAction),
        tryFetchMultipleSlotsSetting: tryAction(fetchPresencesMultipleSlotSettingAction),
        tryFetchRegisterPreference: tryAction(fetchPresencesRegisterPreferenceAction),
        tryFetchEventReasons: tryAction(fetchPresencesEventReasonsAction),
      },
      dispatch,
    ),
)(PresencesCourseListScreenOld);
