import type { NativeStackNavigationOptions, NativeStackScreenProps } from '@react-navigation/native-stack';
import I18n from 'i18n-js';
import moment from 'moment';
import * as React from 'react';
import { RefreshControl } from 'react-native';
import Toast from 'react-native-tiny-toast';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { ThunkDispatch } from 'redux-thunk';

import { IGlobalState } from '~/app/store';
import { UI_ANIMATIONS } from '~/framework/components/constants';
import { EmptyContentScreen } from '~/framework/components/emptyContentScreen';
import { EmptyScreen } from '~/framework/components/emptyScreen';
import FlatList from '~/framework/components/flatList';
import { LoadingIndicator } from '~/framework/components/loading';
import { PageView } from '~/framework/components/page';
import ScrollView from '~/framework/components/scrollView';
import { SmallBoldText } from '~/framework/components/text';
import { getSession } from '~/framework/modules/auth/reducer';
import StructurePicker from '~/framework/modules/viescolaire/common/components/StructurePicker';
import viescoTheme from '~/framework/modules/viescolaire/common/theme';
import { getSelectedStructure } from '~/framework/modules/viescolaire/dashboard/state/structure';
import {
  fetchPresencesCoursesAction,
  fetchPresencesMultipleSlotSettingAction,
  fetchPresencesRegisterPreferenceAction,
} from '~/framework/modules/viescolaire/presences/actions';
import { CallCard } from '~/framework/modules/viescolaire/presences/components/CallCard';
import { ICourse } from '~/framework/modules/viescolaire/presences/model';
import moduleConfig from '~/framework/modules/viescolaire/presences/module-config';
import { PresencesNavigationParams, presencesRouteNames } from '~/framework/modules/viescolaire/presences/navigation';
import { presencesService } from '~/framework/modules/viescolaire/presences/service';
import { navBarOptions } from '~/framework/navigation/navBar';
import { tryActionLegacy } from '~/framework/util/redux/actions';
import { AsyncPagedLoadingState } from '~/framework/util/redux/asyncPaged';

import styles from './styles';
import { PresencesCourseListScreenPrivateProps } from './types';

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

const PresencesCourseListScreen = (props: PresencesCourseListScreenPrivateProps) => {
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

  const fetchOnNavigation = () => {
    if (loadingRef.current === AsyncPagedLoadingState.PRISTINE) init();
    else refreshSilent();
  };

  React.useEffect(() => {
    const unsubscribe = props.navigation.addListener('focus', () => {
      fetchOnNavigation();
    });
    return unsubscribe;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.navigation]);

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
      Toast.show(I18n.t('common.error.text'), { ...UI_ANIMATIONS.toast });
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
    const dateText = `${I18n.t('viesco-register-date')} ${moment().format('DD MMMM YYYY')}`;
    return (
      <>
        <SmallBoldText style={styles.dateText}>{dateText}</SmallBoldText>
        <FlatList
          data={props.courses}
          renderItem={({ item }) => <CallCard course={item} onPress={() => openCall(item)} />}
          keyExtractor={item => item.id + item.startDate}
          refreshControl={
            <RefreshControl refreshing={loadingState === AsyncPagedLoadingState.REFRESH} onRefresh={() => refresh()} />
          }
          ListEmptyComponent={<EmptyScreen svgImage="empty-absences" title={I18n.t('viesco-no-register-today')} />}
        />
      </>
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

  return (
    <PageView>
      <StructurePicker />
      {renderPage()}
    </PageView>
  );
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
        fetchCourses: tryActionLegacy(
          fetchPresencesCoursesAction,
          undefined,
          true,
        ) as unknown as PresencesCourseListScreenPrivateProps['fetchCourses'],
        fetchMultipleSlotsSetting: tryActionLegacy(
          fetchPresencesMultipleSlotSettingAction,
          undefined,
          true,
        ) as unknown as PresencesCourseListScreenPrivateProps['fetchMultipleSlotsSetting'],
        fetchRegisterPreference: tryActionLegacy(
          fetchPresencesRegisterPreferenceAction,
          undefined,
          true,
        ) as unknown as PresencesCourseListScreenPrivateProps['fetchRegisterPreference'],
      },
      dispatch,
    ),
)(PresencesCourseListScreen);
