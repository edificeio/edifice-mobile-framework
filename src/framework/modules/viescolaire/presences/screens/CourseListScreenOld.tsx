import { NativeStackScreenProps } from '@react-navigation/native-stack';
import I18n from 'i18n-js';
import moment from 'moment';
import * as React from 'react';
import { RefreshControl } from 'react-native';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { ThunkDispatch } from 'redux-thunk';

import { IGlobalState } from '~/app/store';
import { EmptyContentScreen } from '~/framework/components/emptyContentScreen';
import { LoadingIndicator } from '~/framework/components/loading';
import ScrollView from '~/framework/components/scrollView';
import Toast from '~/framework/components/toast';
import { ISession } from '~/framework/modules/auth/model';
import { getSession } from '~/framework/modules/auth/reducer';
import { getSelectedStructure } from '~/framework/modules/viescolaire/dashboard/state/structure';
import {
  fetchPresencesCoursesAction,
  fetchPresencesMultipleSlotSettingAction,
  fetchPresencesRegisterPreferenceAction,
} from '~/framework/modules/viescolaire/presences/actions';
import CourseList from '~/framework/modules/viescolaire/presences/components/CourseListOld';
import { ICourse } from '~/framework/modules/viescolaire/presences/model';
import moduleConfig from '~/framework/modules/viescolaire/presences/module-config';
import { PresencesNavigationParams, presencesRouteNames } from '~/framework/modules/viescolaire/presences/navigation';
import { presencesService } from '~/framework/modules/viescolaire/presences/service';
import { tryActionLegacy } from '~/framework/util/redux/actions';
import { AsyncPagedLoadingState } from '~/framework/util/redux/asyncPaged';

type IPresencesCourseListScreenOldProps = {
  allowMultipleSlots: boolean;
  courses: ICourse[];
  initialLoadingState: AsyncPagedLoadingState;
  registerId: string;
  registerPreference: string;
  session?: ISession;
  structureId?: string;
  teacherId?: string;
  fetchCourses: (
    teacherId: string,
    structureId: string,
    startDate: string,
    endDate: string,
    multipleSlot?: boolean,
  ) => Promise<ICourse[]>;
  fetchMultipleSlotsSetting: (structureId: string) => Promise<boolean>;
  fetchRegisterPreference: () => Promise<string>;
} & NativeStackScreenProps<PresencesNavigationParams, typeof presencesRouteNames.memento>;

const PresencesCourseListScreenOld = (props: IPresencesCourseListScreenOldProps) => {
  const [loadingState, setLoadingState] = React.useState(props.initialLoadingState ?? AsyncPagedLoadingState.PRISTINE);
  const loadingRef = React.useRef<AsyncPagedLoadingState>();
  loadingRef.current = loadingState;
  // /!\ Need to use Ref of the state because of hooks Closure issue. @see https://stackoverflow.com/a/56554056/6111343

  const fetchCourses = async () => {
    try {
      const { structureId, teacherId } = props;

      if (!structureId || !teacherId) throw new Error();
      const allowMultipleSlots = await props.fetchMultipleSlotsSetting(structureId);
      const registerPreference = await props.fetchRegisterPreference();
      const today = moment().format('YYYY-MM-DD');
      let multipleSlot = true;
      if (allowMultipleSlots && registerPreference) {
        multipleSlot = JSON.parse(registerPreference).multipleSlot;
      }
      await props.fetchCourses(teacherId, structureId, today, today, multipleSlot);
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

  const openCall = async (course: ICourse) => {
    try {
      let { registerId } = course;

      if (!registerId) {
        const { allowMultipleSlots, session, teacherId } = props;
        if (!session || !teacherId) throw new Error();
        const courseRegister = await presencesService.courseRegister.create(session, course, teacherId, allowMultipleSlots);
        registerId = courseRegister.id;
      }
      props.navigation.navigate(presencesRouteNames.call, {
        classroom: course.roomLabels[0],
        id: registerId,
        name: course.classes[0] ?? course.groups[0],
      });
    } catch {
      Toast.showError(I18n.t('common.error.text'));
    }
  };

  const renderError = () => {
    return (
      <ScrollView
        refreshControl={<RefreshControl refreshing={loadingState === AsyncPagedLoadingState.RETRY} onRefresh={() => reload()} />}>
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
    const session = getSession();

    return {
      allowMultipleSlots: presencesState.allowMultipleSlots.data,
      courses: presencesState.courses.data.filter(course => course.allowRegister === true),
      initialLoadingState: presencesState.courses.isPristine ? AsyncPagedLoadingState.PRISTINE : AsyncPagedLoadingState.DONE,
      registerPreference: presencesState.registerPreference.data,
      session,
      structureId: getSelectedStructure(state),
      teacherId: session?.user.id,
    };
  },
  (dispatch: ThunkDispatch<any, any, any>) =>
    bindActionCreators(
      {
        fetchCourses: tryActionLegacy(fetchPresencesCoursesAction, undefined, true),
        fetchMultipleSlotsSetting: tryActionLegacy(fetchPresencesMultipleSlotSettingAction, undefined, true),
        fetchRegisterPreference: tryActionLegacy(fetchPresencesRegisterPreferenceAction, undefined, true),
      },
      dispatch,
    ),
)(PresencesCourseListScreenOld);
