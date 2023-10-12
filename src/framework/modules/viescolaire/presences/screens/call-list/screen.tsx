import type { NativeStackNavigationOptions, NativeStackScreenProps } from '@react-navigation/native-stack';
import moment, { Moment } from 'moment';
import * as React from 'react';
import { Alert, FlatList, RefreshControl, ScrollView, View } from 'react-native';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import { I18n } from '~/app/i18n';
import { IGlobalState } from '~/app/store';
import PrimaryButton from '~/framework/components/buttons/primary';
import { UI_STYLES } from '~/framework/components/constants';
import { EmptyContentScreen, EmptyScreen } from '~/framework/components/empty-screens';
import BottomSheetModal, { BottomSheetModalMethods } from '~/framework/components/modals/bottom-sheet';
import { PageView } from '~/framework/components/page';
import DayPicker from '~/framework/components/pickers/day';
import { BodyBoldText, BodyText, HeadingSText } from '~/framework/components/text';
import Toast from '~/framework/components/toast';
import { getSession } from '~/framework/modules/auth/reducer';
import {
  fetchPresencesCallAction,
  fetchPresencesCoursesAction,
  fetchPresencesMultipleSlotSettingAction,
  fetchPresencesRegisterPreferenceAction,
} from '~/framework/modules/viescolaire/presences/actions';
import CallCard from '~/framework/modules/viescolaire/presences/components/call-card';
import CallSummary from '~/framework/modules/viescolaire/presences/components/call-summary';
import CallListPlaceholder from '~/framework/modules/viescolaire/presences/components/placeholders/call-list';
import CallSummaryPlaceholder from '~/framework/modules/viescolaire/presences/components/placeholders/call-summary';
import { Call, CallState, Course } from '~/framework/modules/viescolaire/presences/model';
import moduleConfig from '~/framework/modules/viescolaire/presences/module-config';
import { PresencesNavigationParams, presencesRouteNames } from '~/framework/modules/viescolaire/presences/navigation';
import { presencesService } from '~/framework/modules/viescolaire/presences/service';
import { navBarOptions } from '~/framework/navigation/navBar';
import appConf from '~/framework/util/appConf';
import { subtractTime } from '~/framework/util/date';
import { tryAction } from '~/framework/util/redux/actions';
import { AsyncPagedLoadingState } from '~/framework/util/redux/asyncPaged';
import { Trackers } from '~/framework/util/tracker';

import styles from './styles';
import type { PresencesCallListScreenDispatchProps, PresencesCallListScreenPrivateProps } from './types';

export const computeNavBar = ({
  navigation,
  route,
}: NativeStackScreenProps<PresencesNavigationParams, typeof presencesRouteNames.callList>): NativeStackNavigationOptions => ({
  ...navBarOptions({
    navigation,
    route,
    title: I18n.get('presences-calllist-title'),
  }),
});

const PresencesCallListScreen = (props: PresencesCallListScreenPrivateProps) => {
  const today = new Date();

  const [isInitialized, setInitialized] = React.useState(true);
  const [date, setDate] = React.useState<Moment>(today.getDay() === 0 ? moment().add(1, 'd') : moment());
  const [selectedCourseId, setSelectedCourseId] = React.useState<string | null>(null);
  const bottomSheetModalRef = React.useRef<BottomSheetModalMethods>(null);
  const [bottomSheetCall, setBottomSheetCall] = React.useState<Call | null>(null);
  const [loadingState, setLoadingState] = React.useState(props.initialLoadingState ?? AsyncPagedLoadingState.PRISTINE);
  const loadingRef = React.useRef<AsyncPagedLoadingState>();
  loadingRef.current = loadingState;
  // /!\ Need to use Ref of the state because of hooks Closure issue. @see https://stackoverflow.com/a/56554056/6111343
  const courses = props.courses[date.format('YYYY-MM-DD')] ?? [];

  const fetchCourses = async () => {
    try {
      const { session, structureIds, teacherId } = props;
      const initializedStructureIds: string[] = [];

      if (!session || !structureIds.length || !teacherId) throw new Error();
      /*const allowMultipleSlots = await props.tryFetchMultipleSlotsSetting(structureId);
      const registerPreference = await props.tryFetchRegisterPreference();
      let multipleSlot = true;
      if (allowMultipleSlots && registerPreference) {
        multipleSlot = JSON.parse(registerPreference).multipleSlot;
      }*/
      /*for (const id of structureIds) {
        const initialized = await presencesService.initialization.getStructureStatus(session, id);
        if (initialized) initializedStructureIds.push(id);
      }
      if (!initializedStructureIds.length) {
        setInitialized(false);
        throw new Error();
      }*/
      await props.tryFetchCourses(teacherId, structureIds, date, false);
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

  const fetchNext = () => {
    setLoadingState(AsyncPagedLoadingState.FETCH_NEXT);
    fetchCourses()
      .then(() => setLoadingState(AsyncPagedLoadingState.DONE))
      .catch(() => setLoadingState(AsyncPagedLoadingState.FETCH_NEXT_FAILED));
  };

  React.useEffect(() => {
    const unsubscribe = props.navigation.addListener('focus', () => {
      if (loadingRef.current === AsyncPagedLoadingState.PRISTINE) init();
      else refreshSilent();
    });
    return unsubscribe;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.navigation, date]);

  React.useEffect(() => {
    if (!props.courses[date.format('YYYY-MM-DD')] && loadingRef.current === AsyncPagedLoadingState.DONE) fetchNext();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date]);

  const openCall = async (course?: Course) => {
    try {
      if (!course) throw new Error();
      let { callId } = course;

      if (!callId) {
        const { allowMultipleSlots, session, teacherId } = props;
        if (!session || !teacherId) throw new Error();
        callId = await presencesService.call.create(session, course, teacherId, allowMultipleSlots);
      }
      bottomSheetModalRef.current?.dismiss();
      props.navigation.navigate(presencesRouteNames.call, {
        course,
        id: callId,
      });
    } catch {
      Toast.showError(I18n.get('presences-calllist-error-text'));
    }
  };

  const onPressCourse = async (course: Course) => {
    if (subtractTime(course.startDate, 15, 'minutes').isAfter(moment())) {
      Alert.alert(I18n.get('presences-calllist-unavailablealert-title'), I18n.get('presences-calllist-unavailablealert-message'));
      Trackers.trackEvent('Présences', 'choix-séance', 'futur');
    } else if (course.callStateId === CallState.DONE || moment().isAfter(course.endDate)) {
      setSelectedCourseId(course.id);
      bottomSheetModalRef.current?.present();

      if (course.callStateId === CallState.DONE && props.session) {
        const call = await props.tryFetchCall(course.callId);
        setBottomSheetCall(call);
        if (moment().isAfter(course.endDate)) {
          Trackers.trackEvent('Présences', 'choix-séance', 'ancien-validé');
        } else {
          Trackers.trackEvent('Présences', 'choix-séance', 'courant-validé');
        }
      } else {
        Trackers.trackEvent('Présences', 'choix-séance', 'ancien-non-validé');
      }
    } else {
      openCall(course);
      Trackers.trackEvent('Présences', 'choix-séance', 'courant-non-validé');
    }
  };

  const clearBottomSheetContent = () => {
    setSelectedCourseId(null);
    setBottomSheetCall(null);
  };

  const renderError = () => {
    return (
      <ScrollView refreshControl={<RefreshControl refreshing={loadingState === AsyncPagedLoadingState.RETRY} onRefresh={reload} />}>
        {isInitialized ? (
          <EmptyContentScreen />
        ) : (
          <EmptyScreen
            svgImage="empty-light"
            title={I18n.get('presences-calllist-emptyscreen-initialization-title')}
            text={I18n.get('presences-calllist-emptyscreen-initialization-text')}
            customStyle={styles.pageContainer}
          />
        )}
      </ScrollView>
    );
  };

  const renderBottomSheet = () => {
    const course = courses.find(c => c.id === selectedCourseId);
    const isValidated = course?.callStateId === CallState.DONE;

    return (
      <BottomSheetModal ref={bottomSheetModalRef} onDismiss={clearBottomSheetContent}>
        {isValidated && !bottomSheetCall ? (
          <CallSummaryPlaceholder />
        ) : (
          <View style={styles.bottomSheetContainer}>
            {isValidated ? (
              <CallSummary call={bottomSheetCall!} />
            ) : (
              <View style={styles.bottomSheetMissedCallContainer}>
                <HeadingSText>{I18n.get('presences-calllist-bottomsheet-heading')}</HeadingSText>
                <BodyText style={styles.bottomSheetMissedCallText}>
                  {I18n.get('presences-calllist-bottomsheet-missedcall')}
                </BodyText>
              </View>
            )}
            <PrimaryButton
              text={I18n.get(
                isValidated ? 'presences-calllist-bottomsheet-action-edit' : 'presences-calllist-bottomsheet-action-new',
              )}
              iconLeft={isValidated ? 'ui-edit' : 'presences'}
              action={() => openCall(course)}
            />
          </View>
        )}
      </BottomSheetModal>
    );
  };

  const renderCallList = () => {
    return (
      <View style={UI_STYLES.flex1}>
        <DayPicker initialSelectedDate={date} maximumWeeks={4} onDateChange={setDate} style={styles.dayPickerContainer} />
        <FlatList
          data={courses}
          renderItem={({ item }) => <CallCard course={item} showStatus onPress={() => onPressCourse(item)} />}
          keyExtractor={item => item.callId?.toString() ?? item.id + item.startDate.format()}
          refreshControl={<RefreshControl refreshing={loadingState === AsyncPagedLoadingState.REFRESH} onRefresh={refresh} />}
          ListHeaderComponent={
            appConf.is2d && courses.length ? <BodyBoldText>{I18n.get('presences-calllist-heading')}</BodyBoldText> : null
          }
          ListEmptyComponent={
            loadingState === AsyncPagedLoadingState.FETCH_NEXT ? (
              <CallListPlaceholder />
            ) : (
              <EmptyScreen
                svgImage="empty-presences"
                title={I18n.get('presences-calllist-emptyscreen-default-title')}
                text={I18n.get('presences-calllist-emptyscreen-default-text')}
                customStyle={styles.emptyScreenContainer}
              />
            )
          }
          contentContainerStyle={courses.length ? styles.listContentContainer : UI_STYLES.flexGrow1}
        />
        {renderBottomSheet()}
      </View>
    );
  };

  const renderPage = () => {
    switch (loadingState) {
      case AsyncPagedLoadingState.DONE:
      case AsyncPagedLoadingState.REFRESH:
      case AsyncPagedLoadingState.REFRESH_FAILED:
      case AsyncPagedLoadingState.REFRESH_SILENT:
      case AsyncPagedLoadingState.FETCH_NEXT:
      case AsyncPagedLoadingState.FETCH_NEXT_FAILED:
        return renderCallList();
      case AsyncPagedLoadingState.PRISTINE:
      case AsyncPagedLoadingState.INIT:
        return <CallListPlaceholder showDayPicker />;
      case AsyncPagedLoadingState.INIT_FAILED:
      case AsyncPagedLoadingState.RETRY:
        return renderError();
    }
  };

  return <PageView style={styles.pageContainer}>{renderPage()}</PageView>;
};

export default connect(
  (state: IGlobalState) => {
    const presencesState = moduleConfig.getState(state);
    const session = getSession();

    return {
      allowMultipleSlots: presencesState.allowMultipleSlots.data,
      courses: presencesState.courses.data,
      initialLoadingState: AsyncPagedLoadingState.PRISTINE,
      registerPreference: presencesState.registerPreference.data,
      session,
      structureIds: session?.user.structures?.map(structure => structure.id) ?? [],
      teacherId: session?.user.id,
    };
  },
  dispatch =>
    bindActionCreators<PresencesCallListScreenDispatchProps>(
      {
        tryFetchCall: tryAction(fetchPresencesCallAction),
        tryFetchCourses: tryAction(fetchPresencesCoursesAction),
        tryFetchMultipleSlotsSetting: tryAction(fetchPresencesMultipleSlotSettingAction),
        tryFetchRegisterPreference: tryAction(fetchPresencesRegisterPreferenceAction),
      },
      dispatch,
    ),
)(PresencesCallListScreen);
