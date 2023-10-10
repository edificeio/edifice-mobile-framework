import { useIsFocused } from '@react-navigation/native';
import type { NativeStackNavigationOptions, NativeStackScreenProps } from '@react-navigation/native-stack';
import moment, { Moment } from 'moment';
import * as React from 'react';
import { View } from 'react-native';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import { I18n } from '~/app/i18n';
import { IGlobalState } from '~/app/store';
import { ModalBoxHandle } from '~/framework/components/ModalBox';
import PrimaryButton from '~/framework/components/buttons/primary';
import { EmptyScreen } from '~/framework/components/empty-screens';
import FlatList from '~/framework/components/list/flat-list';
import { LoadingIndicator } from '~/framework/components/loading';
import { PageView } from '~/framework/components/page';
import ScrollView from '~/framework/components/scrollView';
import { BodyBoldText, SmallText } from '~/framework/components/text';
import { getSession } from '~/framework/modules/auth/reducer';
import ChildPicker from '~/framework/modules/viescolaire/common/components/ChildPicker';
import viescoTheme from '~/framework/modules/viescolaire/common/theme';
import { getChildStructureId } from '~/framework/modules/viescolaire/common/utils/child';
import { homeworkListDetailsAdapter, isHomeworkDone } from '~/framework/modules/viescolaire/common/utils/diary';
import {
  clearCompetencesLevelsAction,
  fetchCompetencesAction,
  fetchCompetencesDevoirsAction,
  fetchCompetencesSubjectsAction,
  fetchCompetencesUserChildrenAction,
} from '~/framework/modules/viescolaire/competences/actions';
import { DashboardAssessmentCard } from '~/framework/modules/viescolaire/competences/components/Item';
import { IDevoir } from '~/framework/modules/viescolaire/competences/model';
import competencesConfig from '~/framework/modules/viescolaire/competences/module-config';
import { competencesRouteNames } from '~/framework/modules/viescolaire/competences/navigation';
import { concatDevoirs } from '~/framework/modules/viescolaire/competences/service';
import { ModuleIconButton } from '~/framework/modules/viescolaire/dashboard/components/ModuleIconButton';
import dashboardConfig from '~/framework/modules/viescolaire/dashboard/module-config';
import { DashboardNavigationParams, dashboardRouteNames } from '~/framework/modules/viescolaire/dashboard/navigation';
import { fetchDiaryHomeworksFromChildAction, fetchDiaryTeachersAction } from '~/framework/modules/viescolaire/diary/actions';
import { HomeworkItem } from '~/framework/modules/viescolaire/diary/components/Items';
import { IHomework } from '~/framework/modules/viescolaire/diary/model';
import diaryConfig from '~/framework/modules/viescolaire/diary/module-config';
import { diaryRouteNames } from '~/framework/modules/viescolaire/diary/navigation';
import { edtRouteNames } from '~/framework/modules/viescolaire/edt/navigation';
import { fetchPresencesChildrenEventsAction } from '~/framework/modules/viescolaire/presences/actions';
import ChildrenEventsModal from '~/framework/modules/viescolaire/presences/components/ChildrenEventsModal';
import { ChildEvents } from '~/framework/modules/viescolaire/presences/model';
import presencesConfig from '~/framework/modules/viescolaire/presences/module-config';
import { presencesRouteNames } from '~/framework/modules/viescolaire/presences/navigation';
import { getPresencesWorkflowInformation } from '~/framework/modules/viescolaire/presences/rights';
import { navBarOptions } from '~/framework/navigation/navBar';
import { handleAction, tryAction } from '~/framework/util/redux/actions';
import { AsyncPagedLoadingState } from '~/framework/util/redux/asyncPaged';
import { Trackers } from '~/framework/util/tracker';

import styles from './styles';
import type { DashboardRelativeScreenDispatchProps, DashboardRelativeScreenPrivateProps } from './types';

type IHomeworkByDateList = {
  [key: string]: IHomework[];
};

const getStudentsEventsCount = (data: { [key: string]: ChildEvents }): number => {
  let count = 0;

  for (const childEvents of Object.values(data)) {
    count +=
      childEvents.DEPARTURE.length +
      childEvents.LATENESS.length +
      childEvents.NO_REASON.length +
      childEvents.REGULARIZED.length +
      childEvents.UNREGULARIZED.length;
  }
  return count;
};

export const computeNavBar = ({
  navigation,
  route,
}: NativeStackScreenProps<DashboardNavigationParams, typeof dashboardRouteNames.relative>): NativeStackNavigationOptions => ({
  ...navBarOptions({
    navigation,
    route,
    title: I18n.get('dashboard-relative-title'),
  }),
});

const DashboardRelativeScreen = (props: DashboardRelativeScreenPrivateProps) => {
  const scrollRef = React.useRef<typeof ScrollView>();
  const eventsModalRef = React.useRef<ModalBoxHandle>(null);
  const isFocused = useIsFocused();
  const [loadingState, setLoadingState] = React.useState(AsyncPagedLoadingState.PRISTINE);
  const loadingRef = React.useRef<AsyncPagedLoadingState>();
  loadingRef.current = loadingState;
  // /!\ Need to use Ref of the state because of hooks Closure issue. @see https://stackoverflow.com/a/56554056/6111343

  const fetchContent = async () => {
    try {
      const { selectedChildId, structureId, userId } = props;

      if (!structureId || !userId) throw new Error();
      await props.tryFetchHomeworks(
        selectedChildId,
        structureId,
        moment().add(1, 'day').format('YYYY-MM-DD'),
        moment().add(1, 'month').format('YYYY-MM-DD'),
      );
      await props.tryFetchTeachers(structureId);
      await props.tryFetchDevoirs(structureId, selectedChildId);
      await props.tryFetchSubjects(structureId);
      const children = await props.tryFetchUserChildren(structureId, userId);
      await props.tryFetchChildrenEvents(
        structureId,
        children.map(child => child.id),
      );
      const childClasses = children.find(c => c.id === selectedChildId)?.classId;
      await props.tryFetchCompetences(selectedChildId, childClasses ?? '');
    } catch {
      throw new Error();
    }
  };

  const fetchEvents = async () => {
    try {
      const { structureId, userId } = props;

      if (!structureId || !userId) throw new Error();
      const children = await props.tryFetchUserChildren(structureId, userId);
      await props.tryFetchChildrenEvents(
        structureId,
        children.map(c => c.id),
      );
    } catch {
      throw new Error();
    }
  };

  const init = () => {
    setLoadingState(AsyncPagedLoadingState.INIT);
    fetchContent()
      .then(() => setLoadingState(AsyncPagedLoadingState.DONE))
      .catch(() => setLoadingState(AsyncPagedLoadingState.INIT_FAILED));
  };

  const refreshEvents = () => {
    setLoadingState(AsyncPagedLoadingState.REFRESH);
    fetchEvents()
      .then(() => setLoadingState(AsyncPagedLoadingState.DONE))
      .catch(() => setLoadingState(AsyncPagedLoadingState.REFRESH_FAILED));
  };

  React.useEffect(() => {
    const unsubscribe = props.navigation.addListener('focus', () => {
      if (loadingRef.current === AsyncPagedLoadingState.PRISTINE) init();
      else refreshEvents();
    });
    return unsubscribe;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.navigation]);

  React.useEffect(() => {
    init();
    props.handleClearLevels();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.selectedChildId]);

  React.useEffect(() => {
    if (props.eventCount && isFocused) eventsModalRef.current?.doShowModal();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.eventCount]);

  const openAbsenceDeclaration = () => {
    props.navigation.navigate(presencesRouteNames.declareAbsence, { childId: props.selectedChildId });
    Trackers.trackEvent('Présences', 'déclarer-absence', 'init');
  };

  const openAssessment = (assessment: IDevoir) => {
    const { navigation, selectedChildId, userChildren } = props;

    navigation.navigate(competencesRouteNames.assessment, {
      assessment,
      studentClass: userChildren.find(child => child.id === selectedChildId)?.classId ?? '',
    });
  };

  const renderNavigationGrid = () => {
    const { authorizedViescoApps, navigation } = props;
    const nbModules = Object.values(authorizedViescoApps).filter(x => x).length;

    return (
      <View style={nbModules === 4 ? styles.gridAllModules : styles.gridModulesLine}>
        {authorizedViescoApps.presences ? (
          <ModuleIconButton
            onPress={() => navigation.navigate(presencesRouteNames.history)}
            text={I18n.get('dashboard-relative-presences')}
            color={viescoTheme.palette.presences}
            icon="access_time"
            nbModules={nbModules}
          />
        ) : null}
        {authorizedViescoApps.edt ? (
          <ModuleIconButton
            onPress={() => navigation.navigate(edtRouteNames.home)}
            text={I18n.get('dashboard-relative-edt')}
            color={viescoTheme.palette.edt}
            icon="calendar_today"
            nbModules={nbModules}
          />
        ) : null}
        {authorizedViescoApps.diary ? (
          <ModuleIconButton
            onPress={() => navigation.navigate(diaryRouteNames.homeworkList)}
            text={I18n.get('dashboard-relative-diary')}
            color={viescoTheme.palette.diary}
            icon="checkbox-multiple-marked"
            nbModules={nbModules}
          />
        ) : null}
        {authorizedViescoApps.competences ? (
          <ModuleIconButton
            onPress={() => navigation.navigate(competencesRouteNames.home)}
            text={I18n.get('dashboard-relative-competences')}
            color={viescoTheme.palette.competences}
            icon="equalizer"
            nbModules={nbModules}
          />
        ) : null}
      </View>
    );
  };

  const renderHomework = () => {
    const { homeworks } = props;
    let homeworksByDate = {} as IHomeworkByDateList;
    Object.values(homeworks.data).forEach(hm => {
      const key = moment(hm.due_date).format('YYYY-MM-DD');
      if (typeof homeworksByDate[key] === 'undefined') homeworksByDate[key] = [];
      homeworksByDate[key].push(hm);
    });

    const tomorrowDate = moment().add(1, 'day') as Moment;

    homeworksByDate = Object.keys(homeworksByDate)
      .filter(date => moment(date).isAfter(moment()))
      .sort()
      .slice(0, 5)
      .reduce(function (memo, current) {
        memo[current] = homeworksByDate[current];
        return memo;
      }, {});

    return (
      <View>
        <BodyBoldText>{I18n.get('dashboard-relative-homework-recent')}</BodyBoldText>
        {!Object.keys(homeworksByDate).length ? (
          <EmptyScreen svgImage="empty-homework" title={I18n.get('dashboard-relative-homework-emptyscreen-title')} />
        ) : null}
        {Object.keys(homeworksByDate).map(date => (
          <>
            <SmallText style={styles.subtitle}>
              {moment(date).isSame(tomorrowDate, 'day')
                ? I18n.get('dashboard-relative-homework-duetomorrow')
                : I18n.get('dashboard-relative-homework-duedate', { date: moment(date).format('DD/MM/YYYY') })}
            </SmallText>
            {homeworksByDate[date].map(homework => (
              <HomeworkItem
                disabled
                checked={isHomeworkDone(homework)}
                title={homework.subject_id !== 'exceptional' ? homework.subject.name : homework.exceptional_label}
                subtitle={homework.type}
                onPress={() =>
                  props.navigation.navigate(diaryRouteNames.homework, homeworkListDetailsAdapter(homework, homeworks.data))
                }
              />
            ))}
          </>
        ))}
      </View>
    );
  };

  const renderAssessments = () => {
    const { devoirs, isFetchingDevoirs, subjects } = props;

    return isFetchingDevoirs ? (
      <LoadingIndicator />
    ) : (
      <FlatList
        data={devoirs.slice(0, 5)}
        keyExtractor={item => item.id.toString()}
        renderItem={({ item }) => (
          <DashboardAssessmentCard
            devoir={item}
            hasCompetences={props.competences.some(c => c.devoirId === item.id)}
            subject={subjects.find(s => s.id === item.subjectId)}
            openAssessment={() => openAssessment(item)}
          />
        )}
        ListHeaderComponent={<BodyBoldText>{I18n.get('dashboard-relative-assessments-recent')}</BodyBoldText>}
        ListEmptyComponent={
          <EmptyScreen svgImage="empty-evaluations" title={I18n.get('dashboard-relative-assessments-emptyscreen-title')} />
        }
        scrollEnabled={false}
      />
    );
  };

  const renderDashboard = () => {
    const { authorizedViescoApps, childrenEvents, session, userChildren } = props;
    const hasAbsenceStatementCreationRights = session && getPresencesWorkflowInformation(session).createAbsenceStatements;

    return (
      <ScrollView ref={scrollRef} contentContainerStyle={styles.scrollViewContentContainer}>
        {renderNavigationGrid()}
        <ChildPicker />
        {hasAbsenceStatementCreationRights ? (
          <PrimaryButton text={I18n.get('dashboard-relative-reportabsence')} iconLeft="ui-plus" action={openAbsenceDeclaration} />
        ) : null}
        {authorizedViescoApps.diary ? renderHomework() : null}
        {authorizedViescoApps.competences ? renderAssessments() : null}
        <ChildrenEventsModal ref={eventsModalRef} childrenEvents={childrenEvents} userChildren={userChildren} />
      </ScrollView>
    );
  };

  return <PageView>{renderDashboard()}</PageView>;
};

export default connect(
  (state: IGlobalState) => {
    const competencesState = competencesConfig.getState(state);
    const dashboardState = dashboardConfig.getState(state);
    const presencesState = presencesConfig.getState(state);
    const diaryState = diaryConfig.getState(state);
    const session = getSession();

    return {
      authorizedViescoApps: {
        competences: session?.apps.some(app => app.address === '/competences'),
        diary: session?.apps.some(app => app.address === '/diary'),
        edt: session?.apps.some(app => app.address === '/edt'),
        presences: session?.apps.some(app => app.address === '/presences'),
      },
      childrenEvents: presencesState.childrenEvents.data,
      competences: competencesState.competences.data,
      devoirs: concatDevoirs(competencesState.devoirs.data, competencesState.competences.data),
      eventCount: getStudentsEventsCount(presencesState.childrenEvents.data),
      homeworks: diaryState.homeworks,
      isFetchingDevoirs: competencesState.devoirs.isFetching,
      selectedChildId: dashboardState.selectedChildId,
      session,
      structureId: getChildStructureId(dashboardState.selectedChildId),
      subjects: competencesState.subjects.data,
      userChildren: competencesState.userChildren.data,
      userId: session?.user.id,
    };
  },
  dispatch =>
    bindActionCreators<DashboardRelativeScreenDispatchProps>(
      {
        handleClearLevels: handleAction(clearCompetencesLevelsAction),
        tryFetchChildrenEvents: tryAction(fetchPresencesChildrenEventsAction),
        tryFetchCompetences: tryAction(fetchCompetencesAction),
        tryFetchDevoirs: tryAction(fetchCompetencesDevoirsAction),
        tryFetchHomeworks: tryAction(fetchDiaryHomeworksFromChildAction),
        tryFetchSubjects: tryAction(fetchCompetencesSubjectsAction),
        tryFetchTeachers: tryAction(fetchDiaryTeachersAction),
        tryFetchUserChildren: tryAction(fetchCompetencesUserChildrenAction),
      },
      dispatch,
    ),
)(DashboardRelativeScreen);
