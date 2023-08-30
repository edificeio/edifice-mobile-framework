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
import { EmptyContentScreen } from '~/framework/components/emptyContentScreen';
import { EmptyScreen } from '~/framework/components/emptyScreen';
import { LoadingIndicator } from '~/framework/components/loading';
import BottomSheetModal, { BottomSheetModalMethods } from '~/framework/components/modals/bottom-sheet';
import { PageView } from '~/framework/components/page';
import DayPicker from '~/framework/components/pickers/day';
import { BodyBoldText, BodyText, HeadingSText } from '~/framework/components/text';
import Toast from '~/framework/components/toast';
import { getSession } from '~/framework/modules/auth/reducer';
import {
  fetchPresencesCoursesAction,
  fetchPresencesMultipleSlotSettingAction,
  fetchPresencesRegisterPreferenceAction,
} from '~/framework/modules/viescolaire/presences/actions';
import { CallCard } from '~/framework/modules/viescolaire/presences/components/CallCard';
import { CallSummary } from '~/framework/modules/viescolaire/presences/components/CallSummary';
import { IClassCall, ICourse } from '~/framework/modules/viescolaire/presences/model';
import moduleConfig from '~/framework/modules/viescolaire/presences/module-config';
import { PresencesNavigationParams, presencesRouteNames } from '~/framework/modules/viescolaire/presences/navigation';
import { presencesService } from '~/framework/modules/viescolaire/presences/service';
import { navBarOptions } from '~/framework/navigation/navBar';
import appConf from '~/framework/util/appConf';
import { tryAction } from '~/framework/util/redux/actions';
import { AsyncPagedLoadingState } from '~/framework/util/redux/asyncPaged';

import styles from './styles';
import type { PresencesCourseListScreenDispatchProps, PresencesCourseListScreenPrivateProps } from './types';

export const computeNavBar = ({
  navigation,
  route,
}: NativeStackScreenProps<PresencesNavigationParams, typeof presencesRouteNames.courseList>): NativeStackNavigationOptions => ({
  ...navBarOptions({
    navigation,
    route,
    title: I18n.get('presences-courselist-title'),
  }),
});

const PresencesCourseListScreen = (props: PresencesCourseListScreenPrivateProps) => {
  const [date, setDate] = React.useState<Moment>(moment());
  const [selectedCourseId, setSelectedCourseId] = React.useState<string | null>(null);
  const bottomSheetModalRef = React.useRef<BottomSheetModalMethods>(null);
  const [bottomSheetCall, setBottomSheetCall] = React.useState<IClassCall | null>(null);
  const [loadingState, setLoadingState] = React.useState(props.initialLoadingState ?? AsyncPagedLoadingState.PRISTINE);
  const loadingRef = React.useRef<AsyncPagedLoadingState>();
  loadingRef.current = loadingState;
  // /!\ Need to use Ref of the state because of hooks Closure issue. @see https://stackoverflow.com/a/56554056/6111343

  const fetchCourses = async () => {
    try {
      const { structureIds, teacherId } = props;

      if (!structureIds.length || !teacherId) throw new Error();
      /*const allowMultipleSlots = await props.tryFetchMultipleSlotsSetting(structureId);
      const registerPreference = await props.tryFetchRegisterPreference();
      let multipleSlot = true;
      if (allowMultipleSlots && registerPreference) {
        multipleSlot = JSON.parse(registerPreference).multipleSlot;
      }*/
      await props.tryFetchCourses(teacherId, structureIds, date.format('YYYY-MM-DD'), false);
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
  }, [props.navigation, date]);

  React.useEffect(() => {
    if (loadingRef.current === AsyncPagedLoadingState.DONE) refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date]);

  const openCall = async (course?: ICourse) => {
    try {
      if (!course) throw new Error();
      let { callId } = course;

      if (!callId) {
        const { allowMultipleSlots, session, teacherId } = props;
        if (!session || !teacherId) throw new Error();
        callId = await presencesService.classCall.create(session, course, teacherId, allowMultipleSlots);
      }
      bottomSheetModalRef.current?.dismiss();
      props.navigation.navigate(presencesRouteNames.call, {
        course,
        id: callId,
      });
    } catch {
      Toast.showError(I18n.get('presences-courselist-error-text'));
    }
  };

  const onPressCourse = async (course: ICourse) => {
    if (moment().isBefore(course.startDate)) {
      Alert.alert(
        I18n.get('presences-courselist-unavailablealert-title'),
        I18n.get('presences-courselist-unavailablealert-message'),
      );
    } else if (course.registerStateId === 3 || moment().isAfter(course.endDate)) {
      setSelectedCourseId(course.id);
      bottomSheetModalRef.current?.present();
      if (course.registerStateId === 3 && props.session) {
        const call = await presencesService.classCall.get(props.session, course.callId);
        setBottomSheetCall(call);
      }
    } else {
      openCall(course);
    }
  };

  const clearBottomSheetContent = () => {
    setSelectedCourseId(null);
    setBottomSheetCall(null);
  };

  const renderError = () => {
    return (
      <ScrollView refreshControl={<RefreshControl refreshing={loadingState === AsyncPagedLoadingState.RETRY} onRefresh={reload} />}>
        <EmptyContentScreen />
      </ScrollView>
    );
  };

  const renderBottomSheet = () => {
    const course = props.courses.find(c => c.id === selectedCourseId);
    const isValidated = course?.registerStateId === 3;

    return (
      <BottomSheetModal ref={bottomSheetModalRef} onDismiss={clearBottomSheetContent}>
        <View style={styles.bottomSheetContainer}>
          {isValidated ? (
            bottomSheetCall ? (
              <CallSummary call={bottomSheetCall} />
            ) : (
              <LoadingIndicator />
            )
          ) : (
            <View style={styles.bottomSheetMissedCallContainer}>
              <HeadingSText>{I18n.get('presences-courselist-bottomsheet-heading')}</HeadingSText>
              <BodyText style={styles.bottomSheetMissedCallText}>
                {I18n.get('presences-courselist-bottomsheet-missedcall')}
              </BodyText>
            </View>
          )}
          <PrimaryButton
            text={I18n.get(
              isValidated ? 'presences-courselist-bottomsheet-action-edit' : 'presences-courselist-bottomsheet-action-new',
            )}
            iconLeft={isValidated ? 'ui-edit' : 'presences'}
            action={() => openCall(course)}
          />
        </View>
      </BottomSheetModal>
    );
  };

  const renderCourseList = () => {
    return (
      <View style={UI_STYLES.flex1}>
        <DayPicker initialSelectedDate={date} onDateChange={setDate} style={styles.dayPickerContainer} />
        <FlatList
          data={props.courses}
          renderItem={({ item }) => <CallCard course={item} onPress={() => onPressCourse(item)} />}
          keyExtractor={item => item.id + item.startDate}
          refreshControl={<RefreshControl refreshing={loadingState === AsyncPagedLoadingState.REFRESH} onRefresh={refresh} />}
          ListHeaderComponent={
            appConf.is2d && props.courses.length ? <BodyBoldText>{I18n.get('presences-courselist-heading')}</BodyBoldText> : null
          }
          ListEmptyComponent={
            <EmptyScreen
              svgImage="empty-presences"
              title={I18n.get('presences-courselist-emptyscreen-title')}
              text={I18n.get('presences-courselist-emptyscreen-text')}
              customStyle={styles.emptyScreenContainer}
            />
          }
          contentContainerStyle={styles.listContentContainer}
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
        return renderCourseList();
      case AsyncPagedLoadingState.PRISTINE:
      case AsyncPagedLoadingState.INIT:
        return <LoadingIndicator />;
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
    bindActionCreators<PresencesCourseListScreenDispatchProps>(
      {
        tryFetchCourses: tryAction(fetchPresencesCoursesAction),
        tryFetchMultipleSlotsSetting: tryAction(fetchPresencesMultipleSlotSettingAction),
        tryFetchRegisterPreference: tryAction(fetchPresencesRegisterPreferenceAction),
      },
      dispatch,
    ),
)(PresencesCourseListScreen);
