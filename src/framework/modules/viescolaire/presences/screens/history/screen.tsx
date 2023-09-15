import type { NativeStackNavigationOptions, NativeStackScreenProps } from '@react-navigation/native-stack';
import moment from 'moment';
import * as React from 'react';
import { FlatList, RefreshControl, ScrollView } from 'react-native';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import { I18n } from '~/app/i18n';
import { IGlobalState } from '~/app/store';
import UserList from '~/framework/components/UserList';
import PrimaryButton from '~/framework/components/buttons/primary';
import TertiaryButton from '~/framework/components/buttons/tertiary';
import { EmptyContentScreen, EmptyScreen } from '~/framework/components/empty-screens';
import { LoadingIndicator } from '~/framework/components/loading';
import { PageView } from '~/framework/components/page';
import { HeadingXSText, SmallText } from '~/framework/components/text';
import { getFlattenedChildren } from '~/framework/modules/auth/model';
import { getSession } from '~/framework/modules/auth/reducer';
import { UserType } from '~/framework/modules/auth/service';
import { getChildStructureId } from '~/framework/modules/viescolaire/common/utils/child';
import { fetchPresencesHistoryAction } from '~/framework/modules/viescolaire/presences/actions';
import {
  AbsenceCard,
  DepartureCard,
  ForgottenNotebookCard,
  IncidentCard,
  LatenessCard,
  PunishmentCard,
  StatementAbsenceCard,
} from '~/framework/modules/viescolaire/presences/components/history-event-card/variants';
import {
  HistoryEventType,
  IAbsence,
  IForgottenNotebook,
  IHistoryEvent,
  IIncident,
  IPunishment,
} from '~/framework/modules/viescolaire/presences/model';
import moduleConfig from '~/framework/modules/viescolaire/presences/module-config';
import { PresencesNavigationParams, presencesRouteNames } from '~/framework/modules/viescolaire/presences/navigation';
import { getPresencesWorkflowInformation } from '~/framework/modules/viescolaire/presences/rights';
import { navBarOptions } from '~/framework/navigation/navBar';
import { tryAction } from '~/framework/util/redux/actions';
import { AsyncPagedLoadingState } from '~/framework/util/redux/asyncPaged';

import styles from './styles';
import type { PresencesHistoryScreenDispatchProps, PresencesHistoryScreenPrivateProps } from './types';

export const computeNavBar = ({
  navigation,
  route,
}: NativeStackScreenProps<PresencesNavigationParams, typeof presencesRouteNames.history>): NativeStackNavigationOptions => ({
  ...navBarOptions({
    navigation,
    route,
    title: I18n.get('presences-history-title'),
  }),
});

const PresencesHistoryScreen = (props: PresencesHistoryScreenPrivateProps) => {
  const [selectedChildId, setSelectedChildId] = React.useState<string>(props.children?.[0]?.id ?? '');
  const [loadingState, setLoadingState] = React.useState(props.initialLoadingState ?? AsyncPagedLoadingState.PRISTINE);
  const loadingRef = React.useRef<AsyncPagedLoadingState>();
  loadingRef.current = loadingState;
  // /!\ Need to use Ref of the state because of hooks Closure issue. @see https://stackoverflow.com/a/56554056/6111343

  const fetchEvents = async () => {
    try {
      const { session, userId, userType } = props;
      const structureId = userType === UserType.Student ? session?.user.structures?.[0]?.id : getChildStructureId(selectedChildId);
      const studentId = userType === UserType.Student ? userId : selectedChildId;

      if (!structureId || !studentId || !userId || !userType) throw new Error();
      await props.tryFetchHistory(studentId, structureId, moment().subtract(1, 'month'), moment());
    } catch {
      throw new Error();
    }
  };

  const init = () => {
    setLoadingState(AsyncPagedLoadingState.INIT);
    fetchEvents()
      .then(() => setLoadingState(AsyncPagedLoadingState.DONE))
      .catch(() => setLoadingState(AsyncPagedLoadingState.INIT_FAILED));
  };

  const reload = () => {
    setLoadingState(AsyncPagedLoadingState.RETRY);
    fetchEvents()
      .then(() => setLoadingState(AsyncPagedLoadingState.DONE))
      .catch(() => setLoadingState(AsyncPagedLoadingState.INIT_FAILED));
  };

  const refresh = () => {
    setLoadingState(AsyncPagedLoadingState.REFRESH);
    fetchEvents()
      .then(() => setLoadingState(AsyncPagedLoadingState.DONE))
      .catch(() => setLoadingState(AsyncPagedLoadingState.REFRESH_FAILED));
  };

  const refreshSilent = () => {
    setLoadingState(AsyncPagedLoadingState.REFRESH_SILENT);
    fetchEvents()
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
  }, [props.navigation, selectedChildId]);

  React.useEffect(() => {
    if (loadingRef.current === AsyncPagedLoadingState.DONE) refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedChildId]);

  const renderError = () => {
    return (
      <ScrollView refreshControl={<RefreshControl refreshing={loadingState === AsyncPagedLoadingState.RETRY} onRefresh={reload} />}>
        <EmptyContentScreen />
      </ScrollView>
    );
  };

  const renderHeader = () => {
    const { userType } = props;

    return (
      <>
        {userType === UserType.Relative && props.hasPresencesCreateAbsenceRight ? (
          <PrimaryButton
            text={I18n.get('presences-history-reportabsence')}
            iconLeft="ui-plus"
            action={() => props.navigation.navigate(presencesRouteNames.declareAbsence, { childId: selectedChildId })}
            style={styles.absenceActionContainer}
          />
        ) : null}
        <HeadingXSText>{I18n.get('presences-history-heading')}</HeadingXSText>
        {props.events.length ? (
          <SmallText style={styles.informationText}>
            {I18n.get(
              userType === UserType.Relative ? 'presences-history-description-relative' : 'presences-history-description-student',
            )}
          </SmallText>
        ) : null}
      </>
    );
  };

  const renderHistoryEventListItem = ({
    item,
  }: {
    item: IAbsence | IHistoryEvent | IIncident | IPunishment | IForgottenNotebook;
  }) => {
    switch (item.type) {
      case HistoryEventType.NO_REASON:
      case HistoryEventType.REGULARIZED:
      case HistoryEventType.UNREGULARIZED:
        return <AbsenceCard event={item as IHistoryEvent} />;
      case HistoryEventType.DEPARTURE:
        return <DepartureCard event={item as IHistoryEvent} />;
      case HistoryEventType.FORGOTTEN_NOTEBOOK:
        return <ForgottenNotebookCard event={item as IForgottenNotebook} />;
      case HistoryEventType.INCIDENT:
        return <IncidentCard event={item as IIncident} />;
      case HistoryEventType.LATENESS:
        return <LatenessCard event={item as IHistoryEvent} />;
      case HistoryEventType.PUNISHMENT:
        return <PunishmentCard event={item as IPunishment} />;
      case HistoryEventType.STATEMENT_ABSENCE:
        return <StatementAbsenceCard event={item as IAbsence} userType={props.userType} />;
    }
  };

  const renderHistory = () => {
    const { userType } = props;

    return (
      <>
        {userType === UserType.Relative && props.children!.length > 1 ? (
          <UserList
            horizontal
            data={props.children!}
            selectedId={selectedChildId}
            onSelect={id => setSelectedChildId(id)}
            style={styles.childListContainer}
            contentContainerStyle={styles.childListContentContainer}
          />
        ) : null}
        <FlatList
          data={props.events}
          keyExtractor={item => item.type + item.id}
          renderItem={renderHistoryEventListItem}
          ListHeaderComponent={renderHeader()}
          ListFooterComponent={
            <TertiaryButton
              text={I18n.get('presences-history-bottomaction')}
              iconRight="ui-arrowRight"
              action={() => props.navigation.navigate(presencesRouteNames.statistics, { studentId: selectedChildId })}
              style={styles.detailsActionContainer}
            />
          }
          ListEmptyComponent={
            <EmptyScreen
              svgImage="empty-zimbra"
              title={I18n.get('presences-history-emptyscreen-title')}
              text={I18n.get(
                userType === UserType.Relative
                  ? 'presences-history-emptyscreen-text-relative'
                  : 'presences-history-emptyscreen-text-student',
              )}
              customStyle={styles.emptyScreenContainer}
              customTitleStyle={styles.emptyScreenTitle}
            />
          }
          alwaysBounceVertical={false}
          contentContainerStyle={styles.listContentContainer}
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
        return renderHistory();
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
    const userId = session?.user.id;
    const userType = session?.user.type;

    return {
      children:
        userType === UserType.Relative
          ? getFlattenedChildren(session?.user.children)
              ?.filter(child => child.classesNames.length)
              .map(child => ({ id: child.id, name: child.firstName })) ?? []
          : undefined,
      events: presencesState.history.data,
      hasPresencesCreateAbsenceRight: session && getPresencesWorkflowInformation(session).createAbsence,
      initialLoadingState: AsyncPagedLoadingState.PRISTINE,
      session,
      userId,
      userType,
    };
  },
  dispatch =>
    bindActionCreators<PresencesHistoryScreenDispatchProps>(
      {
        tryFetchHistory: tryAction(fetchPresencesHistoryAction),
      },
      dispatch,
    ),
)(PresencesHistoryScreen);
