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
  fetchPresencesHistoryAction,
  fetchPresencesSchoolYearAction,
  fetchPresencesTermsAction,
  fetchPresencesUserChildrenAction,
} from '~/framework/modules/viescolaire/presences/actions';
import StatisticsCard from '~/framework/modules/viescolaire/presences/components/statistics-card';
import { HistoryEventType } from '~/framework/modules/viescolaire/presences/model';
import moduleConfig from '~/framework/modules/viescolaire/presences/module-config';
import { PresencesNavigationParams, presencesRouteNames } from '~/framework/modules/viescolaire/presences/navigation';
import { navBarOptions } from '~/framework/navigation/navBar';
import appConf from '~/framework/util/appConf';
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
      const terms = await props.tryFetchTerms(structureId, groupId ?? '');
      const currentTerm = terms.find(term => moment().isBetween(term.startDate, term.endDate));
      if (currentTerm && selectedTerm === 'year') setSelectedTerm(currentTerm.order.toString());
      const schoolYear = await props.tryFetchSchoolYear(structureId);
      const startDate = currentTerm?.startDate ?? schoolYear.startDate;
      const endDate = currentTerm?.endDate ?? schoolYear.endDate;
      await props.tryFetchHistory(studentId, structureId, startDate.format('YYYY-MM-DD'), endDate.format('YYYY-MM-DD'));
    } catch {
      throw new Error();
    }
  };

  const refreshEvents = async () => {
    try {
      const { schoolYear, session, terms, userId, userType } = props;
      const structureId =
        userType === UserType.Student ? session?.user.structures?.[0]?.id : getChildStructureId(props.route.params.studentId);
      const studentId = userType === UserType.Student ? userId : props.route.params.studentId;

      if (!schoolYear || !structureId || !studentId) throw new Error();
      const term = selectedTerm !== 'year' ? terms.find(t => t.order.toString() === selectedTerm) : undefined;
      const startDate = term?.startDate ?? schoolYear.startDate;
      const endDate = term?.endDate ?? schoolYear.endDate;
      await props.tryFetchHistory(studentId, structureId, startDate.format('YYYY-MM-DD'), endDate.format('YYYY-MM-DD'));
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
    refreshEvents()
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
  }, [props.navigation]);

  React.useEffect(() => {
    if (loadingState === AsyncPagedLoadingState.DONE) refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTerm]);

  const renderError = () => {
    return (
      <ScrollView refreshControl={<RefreshControl refreshing={loadingState === AsyncPagedLoadingState.RETRY} onRefresh={reload} />}>
        <EmptyContentScreen />
      </ScrollView>
    );
  };

  const renderHistory = () => {
    const { history, terms } = props;
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
        <StatisticsCard type={HistoryEventType.NO_REASON} {...history.NO_REASON} />
        <StatisticsCard type={HistoryEventType.UNREGULARIZED} {...history.UNREGULARIZED} />
        <StatisticsCard type={HistoryEventType.REGULARIZED} {...history.REGULARIZED} />
        <StatisticsCard type={HistoryEventType.LATENESS} {...history.LATENESS} />
        <StatisticsCard type={HistoryEventType.DEPARTURE} {...history.DEPARTURE} />
        {appConf.is2d ? (
          <>
            <StatisticsCard type={HistoryEventType.FORGOTTEN_NOTEBOOK} {...history.FORGOTTEN_NOTEBOOK} />
            <StatisticsCard type={HistoryEventType.INCIDENT} {...history.INCIDENT} />
            <StatisticsCard type={HistoryEventType.PUNISHMENT} {...history.PUNISHMENT} />
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
      history: presencesState.history.data,
      initialLoadingState: AsyncPagedLoadingState.PRISTINE,
      schoolYear: presencesState.schoolYear.data,
      session,
      terms: presencesState.terms.data,
      userId,
      userType,
    };
  },
  dispatch =>
    bindActionCreators<PresencesStatisticsScreenDispatchProps>(
      {
        tryFetchHistory: tryAction(fetchPresencesHistoryAction),
        tryFetchSchoolYear: tryAction(fetchPresencesSchoolYearAction),
        tryFetchTerms: tryAction(fetchPresencesTermsAction),
        tryFetchUserChildren: tryAction(fetchPresencesUserChildrenAction),
      },
      dispatch,
    ),
)(PresencesStatisticsScreen);
