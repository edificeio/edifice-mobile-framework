import type { NativeStackNavigationOptions, NativeStackScreenProps } from '@react-navigation/native-stack';
import moment from 'moment';
import * as React from 'react';
import { RefreshControl, ScrollView, View } from 'react-native';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import { I18n } from '~/app/i18n';
import { IGlobalState } from '~/app/store';
import { EmptyContentScreen } from '~/framework/components/empty-screens';
import { LoadingIndicator } from '~/framework/components/loading';
import { PageView } from '~/framework/components/page';
import DropdownPicker from '~/framework/components/pickers/dropdown';
import { getSession } from '~/framework/modules/auth/reducer';
import { UserType } from '~/framework/modules/auth/service';
import { getChildStructureId } from '~/framework/modules/viescolaire/common/utils/child';
import {
  fetchPresencesSchoolYearAction,
  fetchPresencesStatisticsAction,
  fetchPresencesTermsAction,
  fetchPresencesUserChildrenAction,
} from '~/framework/modules/viescolaire/presences/actions';
import StatisticsCard from '~/framework/modules/viescolaire/presences/components/statistics-card';
import { HistoryEventType } from '~/framework/modules/viescolaire/presences/model';
import moduleConfig from '~/framework/modules/viescolaire/presences/module-config';
import { PresencesNavigationParams, presencesRouteNames } from '~/framework/modules/viescolaire/presences/navigation';
import { getPresencesWorkflowInformation } from '~/framework/modules/viescolaire/presences/rights';
import { navBarOptions } from '~/framework/navigation/navBar';
import { tryAction } from '~/framework/util/redux/actions';
import { AsyncPagedLoadingState } from '~/framework/util/redux/asyncPaged';

import styles from './styles';
import type { PresencesStatisticsScreenDispatchProps, PresencesStatisticsScreenPrivateProps } from './types';

export const computeNavBar = ({
  navigation,
  route,
}: NativeStackScreenProps<PresencesNavigationParams, typeof presencesRouteNames.statistics>): NativeStackNavigationOptions => ({
  ...navBarOptions({
    navigation,
    route,
    title: I18n.get('presences-statistics-title'),
  }),
});

const PresencesStatisticsScreen = (props: PresencesStatisticsScreenPrivateProps) => {
  const [isDropdownOpen, setDropdownOpen] = React.useState<boolean>(false);
  const [selectedTerm, setSelectedTerm] = React.useState<string>('year');
  const [loadingState, setLoadingState] = React.useState(props.initialLoadingState ?? AsyncPagedLoadingState.PRISTINE);
  const loadingRef = React.useRef<AsyncPagedLoadingState>();
  loadingRef.current = loadingState;
  // /!\ Need to use Ref of the state because of hooks Closure issue. @see https://stackoverflow.com/a/56554056/6111343

  const fetchEvents = async () => {
    try {
      const { classes, session, userId, userType } = props;
      const structureId =
        userType === UserType.Student ? session?.user.structures?.[0]?.id : getChildStructureId(props.route.params.studentId);
      const studentId = userType === UserType.Student ? userId : props.route.params.studentId;

      if (!structureId || !studentId || !userId || !userType) throw new Error();
      let groupId = classes?.[0];
      if (userType === UserType.Relative) {
        const children = await props.tryFetchUserChildren(userId);
        groupId = children.find(child => child.id === studentId)?.structures[0].classes[0].id;
      }
      const { startDate, endDate } = await props.tryFetchSchoolYear(structureId);
      await props.tryFetchStatistics(studentId, structureId, startDate, endDate);
      const terms = await props.tryFetchTerms(structureId, groupId ?? '');
      const currentTerm = terms.find(term => moment().isBetween(term.startDate, term.endDate));
      if (currentTerm && selectedTerm === 'year') setSelectedTerm(currentTerm.order.toString());
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
  }, [props.navigation]);

  const renderError = () => {
    return (
      <ScrollView refreshControl={<RefreshControl refreshing={loadingState === AsyncPagedLoadingState.RETRY} onRefresh={reload} />}>
        <EmptyContentScreen />
      </ScrollView>
    );
  };

  const filterStatistics = () => {
    const { statistics, terms } = props;
    const term = selectedTerm !== 'year' ? terms.find(t => t.order.toString() === selectedTerm) : undefined;

    if (!term) return statistics;
    return {
      DEPARTURE: {
        events: statistics.DEPARTURE.events.filter(
          e => e.startDate.isSameOrAfter(term.startDate) && e.startDate.isSameOrBefore(term.endDate),
        ),
      },
      FORGOTTEN_NOTEBOOK: {
        events:
          statistics.FORGOTTEN_NOTEBOOK?.events.filter(
            e => e.date.isSameOrAfter(term.startDate) && e.date.isSameOrBefore(term.endDate),
          ) ?? [],
      },
      INCIDENT: {
        events:
          statistics.INCIDENT?.events.filter(e => e.date.isSameOrAfter(term.startDate) && e.date.isSameOrBefore(term.endDate)) ??
          [],
      },
      LATENESS: {
        events: statistics.LATENESS.events.filter(
          e => e.startDate.isSameOrAfter(term.startDate) && e.startDate.isSameOrBefore(term.endDate),
        ),
      },
      NO_REASON: {
        events: statistics.NO_REASON.events.filter(
          e => e.startDate.isSameOrAfter(term.startDate) && e.startDate.isSameOrBefore(term.endDate),
        ),
      },
      PUNISHMENT: {
        events:
          statistics.PUNISHMENT?.events.filter(
            e => e.createdAt.isSameOrAfter(term.startDate) && e.createdAt.isSameOrBefore(term.endDate),
          ) ?? [],
      },
      REGULARIZED: {
        events: statistics.REGULARIZED.events.filter(
          e => e.startDate.isSameOrAfter(term.startDate) && e.startDate.isSameOrBefore(term.endDate),
        ),
      },
      UNREGULARIZED: {
        events: statistics.UNREGULARIZED.events.filter(
          e => e.startDate.isSameOrAfter(term.startDate) && e.startDate.isSameOrBefore(term.endDate),
        ),
      },
    };
  };

  const renderHistory = () => {
    const { session, terms } = props;
    const statistics = filterStatistics();
    const dropdownTerms = [
      { label: I18n.get('presences-statistics-year'), value: 'year' },
      ...terms.map(term => ({
        label: `${I18n.get('presences-statistics-trimester')} ${term.order}`,
        value: term.order.toString(),
      })),
    ];

    return (
      <ScrollView contentContainerStyle={styles.listContentContainer}>
        {dropdownTerms.length > 1 ? (
          <View style={styles.dropdownContainer}>
            <DropdownPicker
              open={isDropdownOpen}
              value={selectedTerm}
              items={dropdownTerms}
              setOpen={setDropdownOpen}
              setValue={setSelectedTerm}
              style={styles.dropdownMargin}
            />
          </View>
        ) : null}
        <StatisticsCard type={HistoryEventType.NO_REASON} {...statistics.NO_REASON} />
        <StatisticsCard type={HistoryEventType.UNREGULARIZED} {...statistics.UNREGULARIZED} />
        <StatisticsCard type={HistoryEventType.REGULARIZED} {...statistics.REGULARIZED} />
        <StatisticsCard type={HistoryEventType.LATENESS} {...statistics.LATENESS} />
        <StatisticsCard type={HistoryEventType.DEPARTURE} {...statistics.DEPARTURE} />
        {session && getPresencesWorkflowInformation(session).presences2d ? (
          <>
            <StatisticsCard type={HistoryEventType.FORGOTTEN_NOTEBOOK} {...statistics.FORGOTTEN_NOTEBOOK!} />
            <StatisticsCard type={HistoryEventType.INCIDENT} {...statistics.INCIDENT!} />
            <StatisticsCard type={HistoryEventType.PUNISHMENT} {...statistics.PUNISHMENT!} />
          </>
        ) : null}
      </ScrollView>
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
      classes: session?.user.classes,
      initialLoadingState: AsyncPagedLoadingState.PRISTINE,
      schoolYear: presencesState.schoolYear.data,
      session,
      statistics: presencesState.statistics.data,
      terms: presencesState.terms.data,
      userId,
      userType,
    };
  },
  dispatch =>
    bindActionCreators<PresencesStatisticsScreenDispatchProps>(
      {
        tryFetchSchoolYear: tryAction(fetchPresencesSchoolYearAction),
        tryFetchStatistics: tryAction(fetchPresencesStatisticsAction),
        tryFetchTerms: tryAction(fetchPresencesTermsAction),
        tryFetchUserChildren: tryAction(fetchPresencesUserChildrenAction),
      },
      dispatch,
    ),
)(PresencesStatisticsScreen);
