import type { NativeStackNavigationOptions, NativeStackScreenProps } from '@react-navigation/native-stack';
import moment from 'moment';
import * as React from 'react';
import { FlatList, ScrollView, ScrollViewProps, View } from 'react-native';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import { I18n } from '~/app/i18n';
import { IGlobalState } from '~/app/store';
import PrimaryButton from '~/framework/components/buttons/primary';
import { EmptyContentScreen } from '~/framework/components/empty-screens';
import BottomSheetModal, { BottomSheetModalMethods } from '~/framework/components/modals/bottom-sheet';
import { PageView } from '~/framework/components/page';
import Toast from '~/framework/components/toast';
import { ContentLoader, ContentLoaderHandle } from '~/framework/hooks/loader';
import usePreventBack from '~/framework/hooks/prevent-back';
import { getSession } from '~/framework/modules/auth/reducer';
import { fetchPresencesCallAction, fetchPresencesEventReasonsAction } from '~/framework/modules/viescolaire/presences/actions';
import CallCard from '~/framework/modules/viescolaire/presences/components/call-card';
import CallSummary from '~/framework/modules/viescolaire/presences/components/call-summary';
import CallPlaceholder from '~/framework/modules/viescolaire/presences/components/placeholders/call';
import StudentListItem from '~/framework/modules/viescolaire/presences/components/student-list-item';
import StudentStatus from '~/framework/modules/viescolaire/presences/components/student-status';
import { CallEventType, CallState, CallStudent } from '~/framework/modules/viescolaire/presences/model';
import moduleConfig from '~/framework/modules/viescolaire/presences/module-config';
import { PresencesNavigationParams, presencesRouteNames } from '~/framework/modules/viescolaire/presences/navigation';
import { getPresencesWorkflowInformation } from '~/framework/modules/viescolaire/presences/rights';
import { presencesService } from '~/framework/modules/viescolaire/presences/service';
import { navBarOptions } from '~/framework/navigation/navBar';
import { tryAction } from '~/framework/util/redux/actions';
import { Trackers } from '~/framework/util/tracker';

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
  const contentLoaderRef = React.useRef<ContentLoaderHandle>(null);
  const [selectedStudentId, setSelectedStudentId] = React.useState<string | null>(null);
  const [isValidating, setValidating] = React.useState<boolean>(false);
  const bottomSheetModalRef = React.useRef<BottomSheetModalMethods>(null);

  const fetchCall = async () => {
    try {
      const { eventReasons, session } = props;
      const { id } = props.route.params;
      const structureCount = session?.user.structures?.length ?? 1;

      if (!id) throw new Error();
      const call = await props.tryFetchCall(id);
      if (!eventReasons.length || structureCount > 1) {
        await props.tryFetchEventReasons(call.structureId);
      }
    } catch {
      throw new Error();
    }
  };

  React.useEffect(() => {
    const unsubscribe = props.navigation.addListener('focus', () => {
      contentLoaderRef.current?.refreshSilent();
    });
    return unsubscribe;
  }, [props.navigation]);

  const dismissBottomSheet = () => bottomSheetModalRef.current?.dismiss();

  const openEvent = (student: CallStudent, type: CallEventType) => {
    const { call, eventReasons } = props;
    const { course, id } = props.route.params;

    if (!call) return Toast.showError(I18n.get('presences-call-error-text'));
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
      const { call, session } = props;
      const { id } = props.route.params;

      if (!call || !session) throw new Error();
      await presencesService.event.create(session, studentId, id, CallEventType.ABSENCE, call.startDate, call.endDate, null);
      await presencesService.call.updateState(session, id, CallState.IN_PROGRESS);
      contentLoaderRef.current?.refreshSilent();
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
      await presencesService.call.updateState(session, id, CallState.IN_PROGRESS);
      contentLoaderRef.current?.refreshSilent();
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
      await presencesService.call.updateState(session, id, CallState.DONE);
      navigation.goBack();

      //Tracking
      const now = moment();
      const isPast = now.isAfter(course.endDate);
      const isDone = course.callStateId === CallState.DONE;
      const event = (): string => {
        if (isPast && isDone) return 'ancien-validé';
        if (isPast && !isDone) return 'ancien-non-validé';
        if (!isPast && isDone) return 'courant-validé';
        return 'courant-non-validé';
      };
      Trackers.trackEvent('Présences', 'faire-appel', event());

      Toast.showSuccess(
        I18n.get('presences-call-successmessage', { class: course.classes.length ? course.classes : course.groups }),
      );
    } catch {
      setValidating(false);
      Toast.showError(I18n.get('presences-call-error-text'));
    }
  };

  const renderBottomSheet = () => {
    const { session } = props;
    const student = props.call!.students.find(s => s.id === selectedStudentId);
    const hasPresencesManagementRights = session && getPresencesWorkflowInformation(session).managePresences;

    return (
      <BottomSheetModal ref={bottomSheetModalRef} onDismiss={unselectStudent}>
        <StudentStatus
          student={student}
          hasAbsenceViewAccess={
            hasPresencesManagementRights === true &&
            props.eventReasons.some(reason => reason.reasonTypeId === CallEventType.ABSENCE)
          }
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
          <CallSummary call={props.call!} />
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

  const renderCall = (refreshControl: ScrollViewProps['refreshControl']) => {
    const { call } = props;
    const { course } = props.route.params;
    const students = call!.students
      .sort((a, b) => a.name.localeCompare(b.name))
      .map(student => ({
        key: student.id,
        ...student,
      }));

    return (
      <>
        <FlatList
          data={students}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <StudentListItem
              student={item}
              isSelected={item.id === selectedStudentId}
              callState={call!.stateId}
              onPress={() => openStudentStatus(item.id)}
            />
          )}
          refreshControl={refreshControl}
          ListHeaderComponent={<CallCard course={course} showStatus disabled />}
          ListFooterComponent={renderFooter()}
          ListHeaderComponentStyle={styles.listHeaderContainer}
        />
        {renderBottomSheet()}
      </>
    );
  };

  const isCallLackingValidation =
    props.call !== undefined && props.call.stateId !== CallState.DONE && props.call.students.some(student => student.events.length);

  usePreventBack({
    title: I18n.get('presences-call-leavealert-title'),
    text: I18n.get('presences-call-leavealert-text'),
    showAlert: isCallLackingValidation && !isValidating,
  });

  return (
    <PageView style={styles.pageContainer}>
      <ContentLoader
        ref={contentLoaderRef}
        loadContent={fetchCall}
        renderContent={renderCall}
        renderError={refreshControl => (
          <ScrollView refreshControl={refreshControl}>
            <EmptyContentScreen />
          </ScrollView>
        )}
        renderLoading={() => <CallPlaceholder />}
      />
    </PageView>
  );
};

export default connect(
  (state: IGlobalState) => {
    const presencesState = moduleConfig.getState(state);
    const session = getSession();
    const call = presencesState.call.data;

    return {
      call,
      eventReasons: presencesState.eventReasons.data,
      session,
    };
  },
  dispatch =>
    bindActionCreators<PresencesCallScreenDispatchProps>(
      {
        tryFetchCall: tryAction(fetchPresencesCallAction),
        tryFetchEventReasons: tryAction(fetchPresencesEventReasonsAction),
      },
      dispatch,
    ),
)(PresencesCallScreen);
