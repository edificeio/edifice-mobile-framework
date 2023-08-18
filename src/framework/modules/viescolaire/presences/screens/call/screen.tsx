import type { NativeStackNavigationOptions, NativeStackScreenProps } from '@react-navigation/native-stack';
import * as React from 'react';
import { FlatList, RefreshControl, ScrollView, View } from 'react-native';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import { I18n } from '~/app/i18n';
import { IGlobalState } from '~/app/store';
import PrimaryButton from '~/framework/components/buttons/primary';
import { EmptyContentScreen } from '~/framework/components/emptyContentScreen';
import { LoadingIndicator } from '~/framework/components/loading';
import { PageView } from '~/framework/components/page';
import { Icon } from '~/framework/components/picture/Icon';
import { SmallBoldText, SmallText } from '~/framework/components/text';
import Toast from '~/framework/components/toast';
import { getSession } from '~/framework/modules/auth/reducer';
import viescoTheme from '~/framework/modules/viescolaire/common/theme';
import { LeftColoredItem } from '~/framework/modules/viescolaire/dashboard/components/Item';
import { fetchPresencesClassCallAction } from '~/framework/modules/viescolaire/presences/actions';
import StudentListItem from '~/framework/modules/viescolaire/presences/components/StudentListItem';
import { EventType } from '~/framework/modules/viescolaire/presences/model';
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
      Toast.showError(I18n.get('presences-call-error-text'));
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
      Toast.showError(I18n.get('presences-call-error-text'));
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

  const renderClassCall = () => {
    const { classCall } = props;
    const { classroom, name } = props.route.params;
    const students = classCall!.students
      .sort((a, b) => a.name.localeCompare(b.name))
      .map(student => ({
        key: student.id,
        ...student,
      }));

    return classCall ? (
      <FlatList
        data={students}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <StudentListItem
            student={item}
            isSelected={item.id === selectedStudentId}
            onPress={() => setSelectedStudentId(item.id)}
          />
        )}
        refreshControl={<RefreshControl refreshing={loadingState === AsyncPagedLoadingState.REFRESH} onRefresh={refresh} />}
        ListHeaderComponent={
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
        }
        ListFooterComponent={
          <PrimaryButton
            text={I18n.get('presences-call-action')}
            action={validateCall}
            loading={isValidating}
            iconLeft="ui-check"
            style={styles.validateButton}
          />
        }
        contentContainerStyle={styles.listContentContainer}
      />
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
