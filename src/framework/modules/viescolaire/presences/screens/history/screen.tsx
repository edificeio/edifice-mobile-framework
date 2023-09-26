import type { NativeStackNavigationOptions, NativeStackScreenProps } from '@react-navigation/native-stack';
import moment from 'moment';
import * as React from 'react';
import { FlatList, ScrollView, View } from 'react-native';
import { NavigationState, SceneMap, SceneRendererProps, TabBar, TabView } from 'react-native-tab-view';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import { I18n } from '~/app/i18n';
import { IGlobalState } from '~/app/store';
import theme from '~/app/theme';
import UserList from '~/framework/components/UserList';
import PrimaryButton from '~/framework/components/buttons/primary';
import { EmptyContentScreen, EmptyScreen } from '~/framework/components/empty-screens';
import { PageView } from '~/framework/components/page';
import DropdownPicker from '~/framework/components/pickers/dropdown';
import { NamedSVG } from '~/framework/components/picture';
import { SmallBoldText, SmallText } from '~/framework/components/text';
import { ContentLoader, ContentLoaderHandle } from '~/framework/hooks/loader';
import { getFlattenedChildren } from '~/framework/modules/auth/model';
import { getSession } from '~/framework/modules/auth/reducer';
import { UserType } from '~/framework/modules/auth/service';
import { getChildStructureId } from '~/framework/modules/viescolaire/common/utils/child';
import {
  fetchPresencesAbsenceStatementsAction,
  fetchPresencesSchoolYearAction,
  fetchPresencesStatisticsAction,
  fetchPresencesTermsAction,
  fetchPresencesUserChildrenAction,
} from '~/framework/modules/viescolaire/presences/actions';
import {
  AbsenceCard,
  DepartureCard,
  ForgottenNotebookCard,
  IncidentCard,
  LatenessCard,
  PunishmentCard,
  StatementAbsenceCard,
} from '~/framework/modules/viescolaire/presences/components/history-event-card/variants';
import StatisticsCard from '~/framework/modules/viescolaire/presences/components/statistics-card';
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
import { getRecentEvents } from '~/framework/modules/viescolaire/presences/utils/events';
import { navBarOptions } from '~/framework/navigation/navBar';
import { addTime, subtractTime } from '~/framework/util/date';
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
  const [index, setIndex] = React.useState(0);
  const [routes] = React.useState([
    { key: 'statistics', title: I18n.get('presences-history-tab-statistics'), icon: 'ui-trending-up' },
    { key: 'history', title: I18n.get('presences-history-tab-history'), icon: 'ui-upcoming' },
  ]);
  const [isDropdownOpen, setDropdownOpen] = React.useState<boolean>(false);
  const [selectedTerm, setSelectedTerm] = React.useState<string>('year');

  const fetchEvents = async () => {
    try {
      const { classes, session, userId, userType } = props;
      const structureId = userType === UserType.Student ? session?.user.structures?.[0]?.id : getChildStructureId(selectedChildId);
      const studentId = userType === UserType.Student ? userId : selectedChildId;

      if (!structureId || !studentId || !userId || !userType) throw new Error();
      let groupId = classes?.[0];
      if (userType === UserType.Relative) {
        const children = await props.tryFetchUserChildren(userId);
        groupId = children.find(child => child.id === studentId)?.structures[0].classes[0].id;
      }
      const { startDate, endDate } = await props.tryFetchSchoolYear(structureId);
      await props.tryFetchStatistics(studentId, structureId, startDate, endDate);
      await props.tryFetchAbsenceStatements(
        studentId,
        structureId,
        subtractTime(moment(), 1, 'month'),
        addTime(moment(), 1, 'month'),
      );
      const terms = await props.tryFetchTerms(structureId, groupId ?? '');
      const currentTerm = terms.find(term => moment().isBetween(term.startDate, term.endDate));
      if (currentTerm && selectedTerm === 'year') setSelectedTerm(currentTerm.order.toString());
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
    if (selectedChildId) contentLoaderRef.current?.refresh();
  }, [selectedChildId]);

  const openEventList = (events: Event[], key: string) => {
    props.navigation.navigate(presencesRouteNames.eventList, {
      events,
      key,
    });
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
      <FlatList
        data={props.events}
        keyExtractor={item => `${item.id}-${item.type}`}
        renderItem={renderHistoryEventListItem}
        ListHeaderComponent={
          props.events.length ? (
            <SmallText style={styles.historyHeadingText}>
              {I18n.get(
                userType === UserType.Relative ? 'presences-history-description-relative' : 'presences-history-description-student',
              )}
            </SmallText>
          ) : null
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
        contentContainerStyle={styles.eventListContentContainer}
      />
    );
  };

  const getCountMethodText = (recoveryMethod: 'DAY' | 'HALF_DAY' | 'HOUR' | null): string => {
    switch (recoveryMethod) {
      case 'DAY':
        return I18n.get('presences-statistics-count-day');
      case 'HALF_DAY':
        return I18n.get('presences-statistics-count-halfday');
      case 'HOUR':
      default:
        return I18n.get('presences-statistics-count-hour');
    }
  };

  const filterEvents = (stats: { events: Event[] }) => {
    const term = selectedTerm !== 'year' ? props.terms.find(t => t.order.toString() === selectedTerm) : undefined;

    return {
      events: term
        ? stats.events.filter(e => {
            const date = 'startDate' in e ? e.startDate : e.date;
            return date.isSameOrAfter(term.startDate) && date.isSameOrBefore(term.endDate);
          })
        : stats.events,
      recoveryMethod: props.statistics.recoveryMethod,
    };
  };

  const renderStatistics = () => {
    const { session, statistics, terms } = props;
    const dropdownTerms = [
      { label: I18n.get('presences-statistics-year'), value: 'year' },
      ...terms.map(term => ({
        label: `${I18n.get('presences-statistics-trimester')} ${term.order}`,
        value: term.order.toString(),
      })),
    ];

    return (
      <ScrollView contentContainerStyle={styles.statisticsContentContainer}>
        {dropdownTerms.length > 1 ? (
          <View style={styles.dropdownContainer}>
            <DropdownPicker
              open={isDropdownOpen}
              value={selectedTerm}
              items={dropdownTerms}
              setOpen={setDropdownOpen}
              setValue={setSelectedTerm}
            />
          </View>
        ) : null}
        <SmallText style={styles.countMethodText}>{getCountMethodText(statistics.recoveryMethod)}</SmallText>
        <StatisticsCard type={EventType.NO_REASON} {...filterEvents(statistics.NO_REASON)} navigateToEventList={openEventList} />
        <StatisticsCard
          type={EventType.UNREGULARIZED}
          {...filterEvents(statistics.UNREGULARIZED)}
          navigateToEventList={openEventList}
        />
        <StatisticsCard
          type={EventType.REGULARIZED}
          {...filterEvents(statistics.REGULARIZED)}
          navigateToEventList={openEventList}
        />
        <SmallText style={styles.countMethodText}>{I18n.get('presences-statistics-count-occurence')}</SmallText>
        <StatisticsCard type={EventType.LATENESS} {...filterEvents(statistics.LATENESS)} navigateToEventList={openEventList} />
        <StatisticsCard type={EventType.DEPARTURE} {...filterEvents(statistics.DEPARTURE)} navigateToEventList={openEventList} />
        {session && getPresencesWorkflowInformation(session).presences2d ? (
          <>
            <StatisticsCard
              type={EventType.FORGOTTEN_NOTEBOOK}
              {...filterEvents(statistics.FORGOTTEN_NOTEBOOK!)}
              navigateToEventList={openEventList}
            />
            <StatisticsCard type={EventType.INCIDENT} {...filterEvents(statistics.INCIDENT!)} navigateToEventList={openEventList} />
            <StatisticsCard
              type={EventType.PUNISHMENT}
              {...filterEvents(statistics.PUNISHMENT!)}
              navigateToEventList={openEventList}
            />
          </>
        ) : null}
      </ScrollView>
    );
  };

  const renderTabBar = (
    tabBarProps: SceneRendererProps & { navigationState: NavigationState<{ key: string; title: string; icon: string }> },
  ) => {
    return (
      <TabBar
        renderLabel={({ route, focused }) =>
          focused ? (
            <SmallBoldText style={styles.tabBarLabelFocused}>{route.title}</SmallBoldText>
          ) : (
            <SmallText style={styles.tabBarLabel}>{route.title}</SmallText>
          )
        }
        renderIcon={({ route, focused }) => (
          <NamedSVG
            name={route.icon}
            fill={focused ? theme.palette.primary.regular : theme.palette.grey.black}
            height={20}
            width={20}
          />
        )}
        tabStyle={styles.tabBarTabContainer}
        indicatorStyle={styles.tabBarIndicatorContainer}
        style={styles.tabBarContainer}
        pressColor={theme.palette.grey.pearl.toString()}
        {...tabBarProps}
      />
    );
  };

  const renderTabView = () => {
    const { children, session, userType } = props;
    const isChildPickerShown = userType === UserType.Relative && props.children!.length > 1;

    return (
      <>
        {isChildPickerShown ? (
          <UserList
            horizontal
            data={props.children!}
            selectedId={selectedChildId}
            onSelect={setSelectedChildId}
            contentContainerStyle={styles.childListContentContainer}
          />
        ) : null}
        {children?.length && session && getPresencesWorkflowInformation(session).createAbsenceStatements ? (
          <PrimaryButton
            text={I18n.get('presences-history-reportabsence')}
            iconLeft="ui-plus"
            action={() => props.navigation.navigate(presencesRouteNames.declareAbsence, { childId: selectedChildId })}
            style={[styles.absenceActionContainer, !isChildPickerShown && styles.absenceActionTopMargin]}
          />
        ) : null}
        <TabView
          navigationState={{ index, routes }}
          onIndexChange={setIndex}
          renderScene={SceneMap({
            statistics: renderStatistics,
            history: renderHistory,
          })}
          renderTabBar={renderTabBar}
        />
      </>
    );
  };

  return (
    <PageView style={styles.pageContainer}>
      <ContentLoader
        ref={contentLoaderRef}
        loadContent={fetchEvents}
        renderContent={renderTabView}
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
      classes: session?.user.classes,
      events: getRecentEvents(presencesState.statistics.data, presencesState.absenceStatements.data),
      schoolYear: presencesState.schoolYear.data,
      session,
      statistics: presencesState.statistics.data,
      terms: presencesState.terms.data,
      userId,
      userType,
    };
  },
  dispatch =>
    bindActionCreators<PresencesHistoryScreenDispatchProps>(
      {
        tryFetchAbsenceStatements: tryAction(fetchPresencesAbsenceStatementsAction),
        tryFetchSchoolYear: tryAction(fetchPresencesSchoolYearAction),
        tryFetchStatistics: tryAction(fetchPresencesStatisticsAction),
        tryFetchTerms: tryAction(fetchPresencesTermsAction),
        tryFetchUserChildren: tryAction(fetchPresencesUserChildrenAction),
      },
      dispatch,
    ),
)(PresencesHistoryScreen);
