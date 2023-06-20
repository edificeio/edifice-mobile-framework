import type { NativeStackNavigationOptions, NativeStackScreenProps } from '@react-navigation/native-stack';
import moment from 'moment';
import * as React from 'react';
import { RefreshControl, ScrollView, TouchableOpacity, View } from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import { I18n } from '~/app/i18n';
import { IGlobalState } from '~/app/store';
import { EmptyContentScreen } from '~/framework/components/emptyContentScreen';
import { LoadingIndicator } from '~/framework/components/loading';
import { PageView } from '~/framework/components/page';
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
  const [isDropdownOpen, setDropdownOpen] = React.useState<boolean>(false);
  const [selectedTerm, setSelectedTerm] = React.useState<string>('year');

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
      const { schoolYear, structureId, studentId, terms } = props;

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
    if (loadingRef.current === AsyncPagedLoadingState.DONE) init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.studentId]);

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
        {loadingState === AsyncPagedLoadingState.REFRESH ? (
          <LoadingIndicator />
        ) : (
          <View style={{ zIndex: -1 }}>
            <NoReasonCard elements={history.NO_REASON.events} total={history.NO_REASON.total} />
            <UnregularizedCard elements={history.UNREGULARIZED.events} total={history.UNREGULARIZED.total} />
            <RegularizedCard elements={history.REGULARIZED.events} total={history.REGULARIZED.total} />
            <LatenessCard elements={history.LATENESS.events} total={history.LATENESS.total} />
            <IncidentCard elements={history.INCIDENT.events} total={history.INCIDENT.total} />
            <PunishmentCard elements={history.PUNISHMENT.events} total={history.PUNISHMENT.total} />
            <ForgotNotebookCard elements={history.FORGOTTEN_NOTEBOOK.events} total={history.FORGOTTEN_NOTEBOOK.total} />
            <DepartureCard elements={history.DEPARTURE.events} total={history.DEPARTURE.total} />
          </View>
        )}
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
      initialLoadingState: AsyncPagedLoadingState.PRISTINE,
      schoolYear: presencesState.schoolYear.data,
      structureId:
        userType === UserType.Student ? session?.user.structures?.[0]?.id : getChildStructureId(dashboardState.selectedChildId),
      studentId: userType === UserType.Student ? userId : dashboardState.selectedChildId,
      terms: presencesState.terms.data,
      userId,
      userType,
    };
  },
  dispatch =>
    bindActionCreators<PresencesHistoryScreenDispatchProps>(
      {
        tryFetchHistory: tryAction(fetchPresencesHistoryAction),
        tryFetchSchoolYear: tryAction(fetchPresencesSchoolYearAction),
        tryFetchTerms: tryAction(fetchPresencesTermsAction),
        tryFetchUserChildren: tryAction(fetchPresencesUserChildrenAction),
      },
      dispatch,
    ),
)(PresencesHistoryScreen);
