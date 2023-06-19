import type { NativeStackNavigationOptions, NativeStackScreenProps } from '@react-navigation/native-stack';
import * as React from 'react';
import { RefreshControl, ScrollView, View } from 'react-native';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import { I18n } from '~/app/i18n';
import { IGlobalState } from '~/app/store';
import { ActionButton } from '~/framework/components/buttons/action';
import { EmptyContentScreen } from '~/framework/components/emptyContentScreen';
import { LoadingIndicator } from '~/framework/components/loading';
import { PageView } from '~/framework/components/page';
import { Icon } from '~/framework/components/picture/Icon';
import SwipeableList from '~/framework/components/swipeableList';
import { SmallBoldText, SmallText } from '~/framework/components/text';
import Toast from '~/framework/components/toast';
import { getSession } from '~/framework/modules/auth/reducer';
import viescoTheme from '~/framework/modules/viescolaire/common/theme';
import { LeftColoredItem } from '~/framework/modules/viescolaire/dashboard/components/Item';
import { fetchPresencesClassCallAction } from '~/framework/modules/viescolaire/presences/actions';
import StudentRow from '~/framework/modules/viescolaire/presences/components/StudentRow';
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
  const [isValidating, setValidating] = React.useState<boolean>(false);
  const [loadingState, setLoadingState] = React.useState(props.initialLoadingState ?? AsyncPagedLoadingState.PRISTINE);
  const loadingRef = React.useRef<AsyncPagedLoadingState>();
  loadingRef.current = loadingState;
  // /!\ Need to use Ref of the state because of hooks Closure issue. @see https://stackoverflow.com/a/56554056/6111343

  const fetchCall = async () => {
    try {
      const { id } = props.route.params;

      if (!id) throw new Error();
      await props.tryFetchClassCall(id);
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

  const createAbsence = async (studentId: string) => {
    try {
      const { classCall, session } = props;
      const { id } = props.route.params;

      if (!classCall || !session) throw new Error();
      await presencesService.event.create(session, studentId, id, EventType.ABSENCE, classCall.startDate, classCall.endDate, null);
      await presencesService.classCall.updateStatus(session, id, 2);
      refreshSilent();
    } catch {
      Toast.showError(I18n.get('common.error.text'));
    }
  };

  const deleteAbsence = async (event: any) => {
    try {
      const { session } = props;
      const { id } = props.route.params;

      if (!session) throw new Error();
      await presencesService.event.delete(session, event.id);
      await presencesService.classCall.updateStatus(session, id, 2);
      refreshSilent();
    } catch {
      Toast.showError(I18n.get('common.error.text'));
    }
  };

  const validateCall = async () => {
    try {
      const { navigation, session } = props;
      const { id } = props.route.params;

      setValidating(true);
      if (!session) throw new Error();
      await presencesService.classCall.updateStatus(session, id, 3);
      navigation.goBack();
      Toast.showSuccess(I18n.get('presences-call-successmessage'));
    } catch {
      setValidating(false);
      Toast.showError(I18n.get('common.error.text'));
    }
  };

  const renderError = () => {
    return (
      <ScrollView refreshControl={<RefreshControl refreshing={loadingState === AsyncPagedLoadingState.RETRY} onRefresh={reload} />}>
        <EmptyContentScreen />
      </ScrollView>
    );
  };

  const renderStudentsList = () => {
    const { classCall, eventReasons, navigation } = props;
    const { id } = props.route.params;
    const students = classCall!.students
      .sort((a, b) => a.name.localeCompare(b.name))
      .map(student => ({
        key: student.id,
        ...student,
      }));

    return classCall && students.length > 0 ? (
      <>
        <SwipeableList<IClassCallStudent & { key: string }>
          data={students}
          keyExtractor={(item: IClassCallStudent) => item.id}
          renderItem={({ item }) => (
            <StudentRow
              student={item}
              checkAbsent={() => createAbsence(item.id)}
              uncheckAbsent={deleteAbsence}
              openMemento={() => props.navigation.navigate(presencesRouteNames.memento, { studentId: item.id })}
              openLateness={() => {
                navigation.navigate(presencesRouteNames.declareEvent, {
                  type: EventType.LATENESS,
                  callId: id,
                  student: item,
                  startDate: classCall.startDate,
                  endDate: classCall.endDate,
                  event: item.events.find(event => event.typeId === EventType.LATENESS),
                });
              }}
              openDeparture={() => {
                navigation.navigate(presencesRouteNames.declareEvent, {
                  type: EventType.DEPARTURE,
                  callId: id,
                  student: item,
                  startDate: classCall.startDate,
                  endDate: classCall.endDate,
                  event: item.events.find(event => event.typeId === EventType.DEPARTURE),
                });
              }}
            />
          )}
          refreshControl={<RefreshControl refreshing={loadingState === AsyncPagedLoadingState.REFRESH} onRefresh={refresh} />}
          swipeActionWidth={70}
          hiddenRowStyle={styles.studentHiddenRowContainer}
          itemSwipeActionProps={({ item }) => ({
            left: [
              {
                action: async row => {
                  navigation.navigate(presencesRouteNames.declareEvent, {
                    type: EventType.DEPARTURE,
                    callId: id,
                    student: item,
                    startDate: classCall.startDate,
                    endDate: classCall.endDate,
                    event: item.events.find(e => e.typeId === EventType.DEPARTURE),
                  });
                  row[item.key]?.closeRow();
                },
                backgroundColor: viescoTheme.palette.presencesEvents.departure,
                actionIcon: 'ui-walk',
                actionIconSize: 28,
              },
              {
                action: async row => {
                  navigation.navigate(presencesRouteNames.declareEvent, {
                    type: EventType.LATENESS,
                    callId: id,
                    student: item,
                    startDate: classCall.startDate,
                    endDate: classCall.endDate,
                    event: item.events.find(e => e.typeId === EventType.LATENESS),
                    reasons: eventReasons.filter(reason => reason.reasonTypeId === 2),
                  });
                  row[item.key]?.closeRow();
                },
                backgroundColor: viescoTheme.palette.presencesEvents.lateness,
                actionIcon: 'ui-clock',
                actionIconSize: 28,
              },
            ],
          })}
        />
        <ActionButton
          text={I18n.get('presences-call-action')}
          action={validateCall}
          loading={isValidating}
          style={styles.validateButton}
        />
      </>
    ) : null;
  };

  const renderClassCall = () => {
    const { classCall } = props;
    const { classroom, name } = props.route.params;

    return classCall ? (
      <>
        <LeftColoredItem shadow style={styles.headerCard} color={viescoTheme.palette.presences}>
          <SmallText>
            {classCall.startDate.format('LT')} - {classCall.endDate.format('LT')}
          </SmallText>
          {classroom ? (
            <View style={styles.classroomContainer}>
              <Icon name="pin_drop" size={18} />
              <SmallText style={styles.classroomText}>{I18n.get('presences-call-room', { name: classroom })}</SmallText>
            </View>
          ) : null}
          <SmallBoldText style={styles.nameText}>{name}</SmallBoldText>
        </LeftColoredItem>
        {renderStudentsList()}
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
        return <LoadingIndicator />;
      case AsyncPagedLoadingState.INIT_FAILED:
      case AsyncPagedLoadingState.RETRY:
        return renderError();
    }
  };

  return <PageView>{renderPage()}</PageView>;
};

export default connect(
  (state: IGlobalState) => {
    const presencesState = moduleConfig.getState(state);
    const session = getSession();

    return {
      classCall: presencesState.classCall.data,
      eventReasons: presencesState.eventReasons.data,
      initialLoadingState: AsyncPagedLoadingState.PRISTINE,
      session,
    };
  },
  dispatch =>
    bindActionCreators<PresencesCallScreenDispatchProps>(
      {
        tryFetchClassCall: tryAction(fetchPresencesClassCallAction),
      },
      dispatch,
    ),
)(PresencesCallScreen);
