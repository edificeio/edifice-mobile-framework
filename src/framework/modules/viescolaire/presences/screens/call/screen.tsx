import type { NativeStackNavigationOptions, NativeStackScreenProps } from '@react-navigation/native-stack';
import * as React from 'react';
import { FlatList, RefreshControl, ScrollView, View } from 'react-native';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import { I18n } from '~/app/i18n';
import { IGlobalState } from '~/app/store';
import PrimaryButton from '~/framework/components/buttons/primary';
import { EmptyContentScreen } from '~/framework/components/empty-screens';
import BottomSheetModal, { BottomSheetModalMethods } from '~/framework/components/modals/bottom-sheet';
import { PageView } from '~/framework/components/page';
import Toast from '~/framework/components/toast';
import usePreventBack from '~/framework/hooks/usePreventBack';
import { getSession } from '~/framework/modules/auth/reducer';
import { fetchPresencesClassCallAction, fetchPresencesEventReasonsAction } from '~/framework/modules/viescolaire/presences/actions';
import CallCard from '~/framework/modules/viescolaire/presences/components/call-card';
import CallSummary from '~/framework/modules/viescolaire/presences/components/call-summary';
import CallPlaceholder from '~/framework/modules/viescolaire/presences/components/placeholders/call';
import StudentListItem from '~/framework/modules/viescolaire/presences/components/student-list-item';
import StudentStatus from '~/framework/modules/viescolaire/presences/components/student-status';
import { EventType, IClassCallStudent } from '~/framework/modules/viescolaire/presences/model';
import moduleConfig from '~/framework/modules/viescolaire/presences/module-config';
import { PresencesNavigationParams, presencesRouteNames } from '~/framework/modules/viescolaire/presences/navigation';
import { presencesService } from '~/framework/modules/viescolaire/presences/service';
import { navBarOptions } from '~/framework/navigation/navBar';
import { tryAction } from '~/framework/util/redux/actions';
import { AsyncPagedLoadingState } from '~/framework/util/redux/asyncPaged';

import styles from './styles';
import type { PresencesCallScreenDispatchProps, PresencesCallScreenPrivateProps } from './types';

export const computeNavBar = ({
  navigation,
  route,
}: NativeStackScreenProps<PresencesNavigationParams, typeof presencesRouteNames.call>): NativeStackNavigationOptions => ({
  ...navBarOptions({
    navigation,
    route,
    title: I18n.get('presences-call-title'),
  }),
});

const PresencesCallScreen = (props: PresencesCallScreenPrivateProps) => {
  const [selectedStudentId, setSelectedStudentId] = React.useState<string | null>(null);
  const [isValidating, setValidating] = React.useState<boolean>(false);
  const bottomSheetModalRef = React.useRef<BottomSheetModalMethods>(null);
  const [loadingState, setLoadingState] = React.useState(props.initialLoadingState ?? AsyncPagedLoadingState.PRISTINE);
  const loadingRef = React.useRef<AsyncPagedLoadingState>();
  loadingRef.current = loadingState;
  // /!\ Need to use Ref of the state because of hooks Closure issue. @see https://stackoverflow.com/a/56554056/6111343

  const fetchCall = async () => {
    try {
      const { eventReasons, session } = props;
      const { id } = props.route.params;
      const structureCount = session?.user.structures?.length;

      if (!id) throw new Error();
      const call = await props.tryFetchClassCall(id);
      if (!eventReasons.length || structureCount !== 1) {
        await props.tryFetchEventReasons(call.structureId);
      }
    } catch {
      throw new Error();
    }
  };

  const init = () => {
    setLoadingState(AsyncPagedLoadingState.INIT);
    fetchCall()
      .then(() => setLoadingState(AsyncPagedLoadingState.DONE))
      .catch(() => setLoadingState(AsyncPagedLoadingState.INIT_FAILED));
  };

  const reload = () => {
    setLoadingState(AsyncPagedLoadingState.RETRY);
    fetchCall()
      .then(() => setLoadingState(AsyncPagedLoadingState.DONE))
      .catch(() => setLoadingState(AsyncPagedLoadingState.INIT_FAILED));
  };

  const refresh = () => {
    setLoadingState(AsyncPagedLoadingState.REFRESH);
    fetchCall()
      .then(() => setLoadingState(AsyncPagedLoadingState.DONE))
      .catch(() => setLoadingState(AsyncPagedLoadingState.REFRESH_FAILED));
  };

  const refreshSilent = () => {
    setLoadingState(AsyncPagedLoadingState.REFRESH_SILENT);
    fetchCall()
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

  const dismissBottomSheet = () => bottomSheetModalRef.current?.dismiss();

  const openEvent = (student: IClassCallStudent, type: EventType) => {
    const { classCall, eventReasons } = props;
    const { course, id } = props.route.params;

    if (!classCall) return Toast.showError(I18n.get('presences-call-error-text'));
    dismissBottomSheet();
    props.navigation.navigate(presencesRouteNames.declareEvent, {
      callId: id,
      course,
      event: student.events.find(event => event.typeId === type),
      reasons: eventReasons.filter(reason => reason.reasonTypeId === type),
      student,
      type,
    });
  };

  const createAbsence = async (studentId: string) => {
    try {
      const { classCall, session } = props;
      const { id } = props.route.params;

      if (!classCall || !session) throw new Error();
      await presencesService.event.create(session, studentId, id, EventType.ABSENCE, classCall.startDate, classCall.endDate, null);
      await presencesService.classCall.updateStatus(session, id, 2);
      refreshSilent();
    } catch {
      Toast.showError(I18n.get('presences-call-error-text'));
    }
  };

  const deleteAbsence = async (eventId: number) => {
    try {
      const { session } = props;
      const { id } = props.route.params;

      if (!session) throw new Error();
      await presencesService.event.delete(session, eventId);
      await presencesService.classCall.updateStatus(session, id, 2);
      refreshSilent();
    } catch {
      Toast.showError(I18n.get('presences-call-error-text'));
    }
  };

  const openStudentStatus = (id: string) => {
    setSelectedStudentId(id);
    bottomSheetModalRef.current?.present();
  };

  const unselectStudent = () => setSelectedStudentId(null);

  const validateCall = async () => {
    try {
      const { navigation, session } = props;
      const { course, id } = props.route.params;

      setValidating(true);
      if (!session) throw new Error();
      await presencesService.classCall.updateStatus(session, id, 3);
      navigation.goBack();
      Toast.showSuccess(
        I18n.get('presences-call-successmessage', { class: course.classes.length ? course.classes : course.groups }),
      );
    } catch {
      setValidating(false);
      Toast.showError(I18n.get('presences-call-error-text'));
    }
  };

  const renderError = () => {
    return (
      <ScrollView refreshControl={<RefreshControl refreshing={loadingState === AsyncPagedLoadingState.RETRY} onRefresh={reload} />}>
        <EmptyContentScreen />
      </ScrollView>
    );
  };

  const renderBottomSheet = () => {
    const student = props.classCall!.students.find(s => s.id === selectedStudentId);
    return (
      <BottomSheetModal ref={bottomSheetModalRef} onDismiss={unselectStudent}>
        <StudentStatus
          student={student}
          hasAbsenceReasons={props.eventReasons.some(reason => reason.reasonTypeId === EventType.ABSENCE)}
          createAbsence={createAbsence}
          deleteAbsence={deleteAbsence}
          dismissBottomSheet={dismissBottomSheet}
          openEvent={openEvent}
        />
      </BottomSheetModal>
    );
  };

  const renderFooter = () => {
    return (
      <View style={styles.listFooterContainer}>
        <View style={styles.separatorContainer} />
        <View style={styles.summaryContainer}>
          <CallSummary call={props.classCall!} />
        </View>
        <View style={styles.separatorContainer} />
        <PrimaryButton
          text={I18n.get('presences-call-action')}
          action={validateCall}
          loading={isValidating}
          iconLeft="ui-check"
          style={styles.validateContainer}
        />
      </View>
    );
  };

  const renderClassCall = () => {
    const { classCall } = props;
    const { course } = props.route.params;
    const students = classCall!.students
      .sort((a, b) => a.name.localeCompare(b.name))
      .map(student => ({
        key: student.id,
        ...student,
      }));

    return classCall ? (
      <>
        <FlatList
          data={students}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <StudentListItem student={item} isSelected={item.id === selectedStudentId} onPress={() => openStudentStatus(item.id)} />
          )}
          refreshControl={<RefreshControl refreshing={loadingState === AsyncPagedLoadingState.REFRESH} onRefresh={refresh} />}
          ListHeaderComponent={<CallCard course={course} showStatus disabled />}
          ListFooterComponent={renderFooter()}
          ListHeaderComponentStyle={styles.listHeaderContainer}
        />
        {renderBottomSheet()}
      </>
    ) : null;
  };

  const renderPage = () => {
    switch (loadingState) {
      case AsyncPagedLoadingState.DONE:
      case AsyncPagedLoadingState.REFRESH:
      case AsyncPagedLoadingState.REFRESH_FAILED:
      case AsyncPagedLoadingState.REFRESH_SILENT:
        return renderClassCall();
      case AsyncPagedLoadingState.PRISTINE:
      case AsyncPagedLoadingState.INIT:
        return <CallPlaceholder />;
      case AsyncPagedLoadingState.INIT_FAILED:
      case AsyncPagedLoadingState.RETRY:
        return renderError();
    }
  };

  const isCallLackingValidation =
    props.classCall !== undefined &&
    props.classCall.stateId === 1 &&
    props.classCall.students.some(student => student.events.length);

  usePreventBack({
    title: I18n.get('presences-call-leavealert-title'),
    text: I18n.get('presences-call-leavealert-text'),
    showAlert: isCallLackingValidation && !isValidating,
  });

  return <PageView style={styles.pageContainer}>{renderPage()}</PageView>;
};

export default connect(
  (state: IGlobalState, props: PresencesCallScreenPrivateProps) => {
    const presencesState = moduleConfig.getState(state);
    const session = getSession();
    const classCall = presencesState.classCall.data;
    const { course } = props.route.params;

    return {
      classCall,
      eventReasons: presencesState.eventReasons.data,
      initialLoadingState: classCall?.courseId === course.id ? AsyncPagedLoadingState.DONE : AsyncPagedLoadingState.PRISTINE,
      session,
    };
  },
  dispatch =>
    bindActionCreators<PresencesCallScreenDispatchProps>(
      {
        tryFetchClassCall: tryAction(fetchPresencesClassCallAction),
        tryFetchEventReasons: tryAction(fetchPresencesEventReasonsAction),
      },
      dispatch,
    ),
)(PresencesCallScreen);
