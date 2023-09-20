import type { NativeStackNavigationOptions, NativeStackScreenProps } from '@react-navigation/native-stack';
import moment from 'moment';
import * as React from 'react';
import { FlatList, ScrollView } from 'react-native';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import { I18n } from '~/app/i18n';
import { IGlobalState } from '~/app/store';
import UserList from '~/framework/components/UserList';
import PrimaryButton from '~/framework/components/buttons/primary';
import TertiaryButton from '~/framework/components/buttons/tertiary';
import { EmptyContentScreen, EmptyScreen } from '~/framework/components/empty-screens';
import { PageView } from '~/framework/components/page';
import { HeadingXSText, SmallText } from '~/framework/components/text';
import { ContentLoader, ContentLoaderHandle } from '~/framework/hooks/loader';
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
  Absence,
  CommonEvent,
  Event,
  EventType,
  ForgottenNotebook,
  Incident,
  Punishment,
} from '~/framework/modules/viescolaire/presences/model';
import moduleConfig from '~/framework/modules/viescolaire/presences/module-config';
import { PresencesNavigationParams, presencesRouteNames } from '~/framework/modules/viescolaire/presences/navigation';
import { getPresencesWorkflowInformation } from '~/framework/modules/viescolaire/presences/rights';
import { navBarOptions } from '~/framework/navigation/navBar';
import { tryAction } from '~/framework/util/redux/actions';

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
  const contentLoaderRef = React.useRef<ContentLoaderHandle>(null);
  const [selectedChildId, setSelectedChildId] = React.useState<string>(props.children?.[0]?.id ?? '');
  const [isInitialized, setInitialized] = React.useState(true);

  const fetchEvents = async () => {
    try {
      const { session, userId, userType } = props;
      const structureId = userType === UserType.Student ? session?.user.structures?.[0]?.id : getChildStructureId(selectedChildId);
      const studentId = userType === UserType.Student ? userId : selectedChildId;

      if (!session || !structureId || !studentId || !userId || !userType) throw new Error();
      /*const initialized = await presencesService.initialization.getStructureStatus(session, structureId);
      if (!initialized) {
        setInitialized(false);
        throw new Error();
      }*/
      await props.tryFetchHistory(studentId, structureId, moment().subtract(1, 'month'), moment());
    } catch {
      throw new Error();
    }
  };

  React.useEffect(() => {
    const unsubscribe = props.navigation.addListener('focus', () => {
      contentLoaderRef.current?.refreshSilent();
    });
    return unsubscribe;
  }, [props.navigation, selectedChildId]);

  React.useEffect(() => {
    contentLoaderRef.current?.refresh();
  }, [selectedChildId]);

  const renderHeader = () => {
    const { session, userType } = props;

    return (
      <>
        {userType === UserType.Relative && session && getPresencesWorkflowInformation(session).createAbsenceStatements ? (
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

  const renderHistoryEventListItem = ({ item }: { item: Event }) => {
    switch (item.type) {
      case EventType.NO_REASON:
      case EventType.REGULARIZED:
      case EventType.UNREGULARIZED:
        return <AbsenceCard event={item as CommonEvent} />;
      case EventType.DEPARTURE:
        return <DepartureCard event={item as CommonEvent} />;
      case EventType.FORGOTTEN_NOTEBOOK:
        return <ForgottenNotebookCard event={item as ForgottenNotebook} />;
      case EventType.INCIDENT:
        return <IncidentCard event={item as Incident} />;
      case EventType.LATENESS:
        return <LatenessCard event={item as CommonEvent} />;
      case EventType.PUNISHMENT:
        return <PunishmentCard event={item as Punishment} />;
      case EventType.STATEMENT_ABSENCE:
        return <StatementAbsenceCard event={item as Absence} userType={props.userType} />;
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
              title={I18n.get('presences-history-emptyscreen-default-title')}
              text={I18n.get(
                userType === UserType.Relative
                  ? 'presences-history-emptyscreen-default-text-relative'
                  : 'presences-history-emptyscreen-default-text-student',
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

  return (
    <PageView style={styles.pageContainer}>
      <ContentLoader
        ref={contentLoaderRef}
        loadContent={fetchEvents}
        renderContent={renderHistory}
        renderError={refreshControl => (
          <ScrollView refreshControl={refreshControl}>
            {isInitialized ? (
              <EmptyContentScreen />
            ) : (
              <EmptyScreen
                svgImage="empty-light"
                title={I18n.get('presences-history-emptyscreen-initialization-title')}
                text={I18n.get('presences-history-emptyscreen-initialization-text')}
                customStyle={styles.pageContainer}
              />
            )}
          </ScrollView>
        )}
      />
    </PageView>
  );
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
