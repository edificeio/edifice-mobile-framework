import type { NativeStackNavigationOptions, NativeStackScreenProps } from '@react-navigation/native-stack';
import moment, { Moment } from 'moment';
import * as React from 'react';
import { RefreshControl, TouchableOpacity, View } from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { ThunkDispatch } from 'redux-thunk';

import { I18n } from '~/app/i18n';
import { IGlobalState } from '~/app/store';
import { EmptyContentScreen } from '~/framework/components/emptyContentScreen';
import { LoadingIndicator } from '~/framework/components/loading';
import { PageView } from '~/framework/components/page';
import ScrollView from '~/framework/components/scrollView';
import { SmallBoldText } from '~/framework/components/text';
import { getSession } from '~/framework/modules/auth/reducer';
import { UserType } from '~/framework/modules/auth/service';
import ChildPicker from '~/framework/modules/viescolaire/common/components/ChildPicker';
import { getChildStructureId } from '~/framework/modules/viescolaire/common/utils/child';
import dashboardConfig from '~/framework/modules/viescolaire/dashboard/module-config';
import {
  fetchPresencesHistoryAction,
  fetchPresencesSchoolYearAction,
  fetchPresencesTermsAction,
  fetchPresencesUserChildrenAction,
} from '~/framework/modules/viescolaire/presences/actions';
import {
  DepartureCard,
  ForgotNotebookCard,
  IncidentCard,
  LatenessCard,
  NoReasonCard,
  PunishmentCard,
  RegularizedCard,
  UnregularizedCard,
} from '~/framework/modules/viescolaire/presences/components/PresenceCard';
import moduleConfig from '~/framework/modules/viescolaire/presences/module-config';
import { PresencesNavigationParams, presencesRouteNames } from '~/framework/modules/viescolaire/presences/navigation';
import { navBarOptions } from '~/framework/navigation/navBar';
import { tryActionLegacy } from '~/framework/util/redux/actions';
import { AsyncPagedLoadingState } from '~/framework/util/redux/asyncPaged';

import styles from './styles';
import { PresencesHistoryScreenPrivateProps } from './types';

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
  const [isDropdownOpen, setDropdownOpen] = React.useState<boolean>(false);
  const [selectedTerm, setSelectedTerm] = React.useState<string>('year');
  const [startDate, setStartDate] = React.useState<Moment>(moment());
  const [endDate, setEndDate] = React.useState<Moment>(moment());

  const [loadingState, setLoadingState] = React.useState(props.initialLoadingState ?? AsyncPagedLoadingState.PRISTINE);
  const loadingRef = React.useRef<AsyncPagedLoadingState>();
  loadingRef.current = loadingState;
  // /!\ Need to use Ref of the state because of hooks Closure issue. @see https://stackoverflow.com/a/56554056/6111343

  const fetchEvents = async () => {
    try {
      const { classes, structureId, studentId, userId, userType } = props;

      if (!structureId || !studentId || !userId || !userType) throw new Error();
      let groupId = classes?.[0];
      if (userType === UserType.Relative) {
        const children = await props.fetchUserChildren(userId);
        groupId = children.find(child => child.id === studentId)?.structures[0].classes[0].id;
      }
      if (selectedTerm !== 'year') setSelectedTerm('year');
      await props.fetchTerms(structureId, groupId ?? '');
      const schoolYear = await props.fetchSchoolYear(structureId);
      setStartDate(schoolYear.startDate);
      setEndDate(schoolYear.endDate);
      const start = schoolYear.startDate.format('YYYY-MM-DD');
      const end = schoolYear.endDate.format('YYYY-MM-DD');
      await props.fetchHistory(studentId, structureId, start, end);
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

  React.useEffect(() => {
    if (loadingRef.current === AsyncPagedLoadingState.DONE) init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.studentId]);

  React.useEffect(() => {
    const { schoolYear } = props;

    if (selectedTerm === 'year' && schoolYear) {
      setStartDate(schoolYear.startDate);
      setEndDate(schoolYear.endDate);
    } else {
      const term = props.terms.find(t => t.order.toString() === selectedTerm);
      if (term) {
        setStartDate(term.startDate);
        setEndDate(term.endDate);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTerm]);

  const renderError = () => {
    return (
      <ScrollView
        refreshControl={<RefreshControl refreshing={loadingState === AsyncPagedLoadingState.RETRY} onRefresh={() => reload()} />}>
        <EmptyContentScreen />
      </ScrollView>
    );
  };

  const renderHistory = () => {
    const { history, terms } = props;
    const dropdownTerms = [
      { label: I18n.get('presences-history-year'), value: 'year' },
      ...terms.map(term => ({
        label: `${I18n.get('presences-history-trimester')} ${term.order}`,
        value: term.order.toString(),
      })),
    ];

    return (
      <ScrollView contentContainerStyle={styles.container}>
        {dropdownTerms.length > 1 ? (
          <DropDownPicker
            open={isDropdownOpen}
            value={selectedTerm}
            items={dropdownTerms}
            setOpen={setDropdownOpen}
            setValue={setSelectedTerm}
            style={[styles.dropdown, styles.dropdownMargin]}
            dropDownContainerStyle={styles.dropdown}
            textStyle={styles.dropdownText}
          />
        ) : null}
        <View style={{ zIndex: -1 }}>
          <NoReasonCard elements={history.noReason.filter(e => e.start_date.isBetween(startDate, endDate))} />
          <UnregularizedCard elements={history.unregularized.filter(e => e.start_date.isBetween(startDate, endDate))} />
          <RegularizedCard elements={history.regularized.filter(e => e.start_date.isBetween(startDate, endDate))} />
          <LatenessCard elements={history.latenesses.filter(e => e.start_date.isBetween(startDate, endDate))} />
          <IncidentCard elements={history.incidents.filter(e => e.date.isBetween(startDate, endDate))} />
          <PunishmentCard elements={history.punishments.filter(e => e.start_date.isBetween(startDate, endDate))} />
          <ForgotNotebookCard elements={history.forgottenNotebooks.filter(e => e.date.isBetween(startDate, endDate))} />
          <DepartureCard elements={history.departures.filter(e => e.start_date.isBetween(startDate, endDate))} />
        </View>
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

  return (
    <PageView>
      {props.userType === UserType.Relative ? (
        <ChildPicker>
          {props.hasRightToCreateAbsence ? (
            <TouchableOpacity
              onPress={() => props.navigation.navigate(presencesRouteNames.declareAbsence)}
              style={styles.declareAbsenceButton}>
              <SmallBoldText style={styles.declareAbscenceText}>{I18n.get('presences-history-reportabsence')}</SmallBoldText>
            </TouchableOpacity>
          ) : null}
        </ChildPicker>
      ) : null}
      {renderPage()}
    </PageView>
  );
};

export default connect(
  (state: IGlobalState) => {
    const presencesState = moduleConfig.getState(state);
    const dashboardState = dashboardConfig.getState(state);
    const session = getSession();
    const userId = session?.user.id;
    const userType = session?.user.type;

    return {
      classes: session?.user.classes,
      hasRightToCreateAbsence: session?.authorizedActions.some(
        action => action.displayName === 'presences.absence.statements.create',
      ),
      history: presencesState.history.data,
      initialLoadingState: presencesState.history.isPristine ? AsyncPagedLoadingState.PRISTINE : AsyncPagedLoadingState.DONE,
      schoolYear: presencesState.schoolYear.data,
      structureId:
        userType === UserType.Student ? session?.user.structures?.[0]?.id : getChildStructureId(dashboardState.selectedChildId),
      studentId: userType === UserType.Student ? userId : dashboardState.selectedChildId,
      terms: presencesState.terms.data,
      userId,
      userType,
    };
  },
  (dispatch: ThunkDispatch<any, any, any>) =>
    bindActionCreators(
      {
        fetchHistory: tryActionLegacy(
          fetchPresencesHistoryAction,
          undefined,
          true,
        ) as unknown as PresencesHistoryScreenPrivateProps['fetchHistory'],
        fetchSchoolYear: tryActionLegacy(
          fetchPresencesSchoolYearAction,
          undefined,
          true,
        ) as unknown as PresencesHistoryScreenPrivateProps['fetchSchoolYear'],
        fetchTerms: tryActionLegacy(
          fetchPresencesTermsAction,
          undefined,
          true,
        ) as unknown as PresencesHistoryScreenPrivateProps['fetchTerms'],
        fetchUserChildren: tryActionLegacy(
          fetchPresencesUserChildrenAction,
          undefined,
          true,
        ) as unknown as PresencesHistoryScreenPrivateProps['fetchUserChildren'],
      },
      dispatch,
    ),
)(PresencesHistoryScreen);
