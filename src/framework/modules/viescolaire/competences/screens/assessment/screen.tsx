import type { NativeStackNavigationOptions, NativeStackScreenProps } from '@react-navigation/native-stack';
import * as React from 'react';
import { FlatList, RefreshControl, ScrollView, View } from 'react-native';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import { IGlobalState } from '~/app/store';
import { ModalBoxHandle } from '~/framework/components/ModalBox';
import { EmptyContentScreen } from '~/framework/components/emptyContentScreen';
import { LoadingIndicator } from '~/framework/components/loading';
import { NavBarAction } from '~/framework/components/navigation';
import { PageView } from '~/framework/components/page';
import { getSession } from '~/framework/modules/auth/reducer';
import { UserType } from '~/framework/modules/auth/service';
import { getChildStructureId } from '~/framework/modules/viescolaire/common/utils/child';
import {
  fetchCompetencesAction,
  fetchCompetencesDomainesAction,
  fetchCompetencesLevelsAction,
} from '~/framework/modules/viescolaire/competences/actions';
import { DomaineListItem } from '~/framework/modules/viescolaire/competences/components/DomaineListItem';
import LevelLegendModal from '~/framework/modules/viescolaire/competences/components/LevelLegendModal';
import moduleConfig from '~/framework/modules/viescolaire/competences/module-config';
import { CompetencesNavigationParams, competencesRouteNames } from '~/framework/modules/viescolaire/competences/navigation';
import dashboardConfig from '~/framework/modules/viescolaire/dashboard/module-config';
import { navBarOptions } from '~/framework/navigation/navBar';
import { tryAction } from '~/framework/util/redux/actions';
import { AsyncPagedLoadingState } from '~/framework/util/redux/asyncPaged';

import styles from './styles';
import type { CompetencesAssessmentScreenDispatchProps, CompetencesAssessmentScreenPrivateProps } from './types';

export const computeNavBar = ({
  navigation,
  route,
}: NativeStackScreenProps<CompetencesNavigationParams, typeof competencesRouteNames.assessment>): NativeStackNavigationOptions => ({
  ...navBarOptions({
    navigation,
    route,
    title: route.params.assessment.name,
  }),
});

const CompetencesAssessmentScreen = (props: CompetencesAssessmentScreenPrivateProps) => {
  const legendModalRef = React.useRef<ModalBoxHandle>(null);
  const [loadingState, setLoadingState] = React.useState(props.initialLoadingState ?? AsyncPagedLoadingState.PRISTINE);
  const loadingRef = React.useRef<AsyncPagedLoadingState>();
  loadingRef.current = loadingState;
  // /!\ Need to use Ref of the state because of hooks Closure issue. @see https://stackoverflow.com/a/56554056/6111343

  const fetchCompetences = async () => {
    try {
      const { structureId, studentId } = props;
      const { studentClass } = props.route.params;

      if (!structureId || !studentId) throw new Error();
      await props.tryFetchCompetences(studentId, studentClass);
      await props.tryFetchDomaines(studentClass);
      await props.tryFetchLevels(structureId);
    } catch {
      throw new Error();
    }
  };

  const init = () => {
    setLoadingState(AsyncPagedLoadingState.INIT);
    fetchCompetences()
      .then(() => setLoadingState(AsyncPagedLoadingState.DONE))
      .catch(() => setLoadingState(AsyncPagedLoadingState.INIT_FAILED));
  };

  const reload = () => {
    setLoadingState(AsyncPagedLoadingState.RETRY);
    fetchCompetences()
      .then(() => setLoadingState(AsyncPagedLoadingState.DONE))
      .catch(() => setLoadingState(AsyncPagedLoadingState.INIT_FAILED));
  };

  React.useEffect(() => {
    const unsubscribe = props.navigation.addListener('focus', () => {
      if (loadingRef.current === AsyncPagedLoadingState.PRISTINE) init();
    });
    return unsubscribe;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.navigation]);

  React.useEffect(() => {
    const { levels, navigation } = props;

    if (loadingState !== AsyncPagedLoadingState.DONE || !levels.length) return;
    navigation.setOptions({
      // eslint-disable-next-line react/no-unstable-nested-components
      headerRight: () => <NavBarAction icon="ui-infoCircle" onPress={() => legendModalRef.current?.doShowModal()} />,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadingState]);

  const renderError = () => {
    return (
      <ScrollView refreshControl={<RefreshControl refreshing={loadingState === AsyncPagedLoadingState.RETRY} onRefresh={reload} />}>
        <EmptyContentScreen />
      </ScrollView>
    );
  };

  const renderAssessment = () => {
    const { domaines, levels } = props;
    const { assessment } = props.route.params;
    const competences = props.competences.filter(competence => competence.devoirId === assessment.id);

    return (
      <>
        <FlatList
          data={domaines}
          keyExtractor={item => item.id.toString()}
          renderItem={({ item }) => <DomaineListItem competences={competences} domaine={item} levels={levels} />}
          contentContainerStyle={styles.listContentContainer}
        />
        <LevelLegendModal ref={legendModalRef} levels={levels} />
      </>
    );
  };

  const renderPage = () => {
    switch (loadingState) {
      case AsyncPagedLoadingState.DONE:
        return renderAssessment();
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
    const competencesState = moduleConfig.getState(state);
    const dashboardState = dashboardConfig.getState(state);
    const session = getSession();
    const userId = session?.user.id;
    const userType = session?.user.type;
    const competences = competencesState.competences.data;
    const domaines = competencesState.domaines.data;

    for (const competence of competences) {
      const domaine = domaines.find(d => d.id === competence.domaineId);
      competence.name = domaine?.competences?.find(c => c.id === competence.id)?.name;
    }
    competences.sort((a, b) => (a.name && b.name && a.name > b.name ? 1 : -1));

    return {
      competences,
      domaines,
      initialLoadingState:
        competencesState.competences.isPristine || competencesState.levels.isPristine
          ? AsyncPagedLoadingState.PRISTINE
          : AsyncPagedLoadingState.DONE,
      levels: competencesState.levels.data.filter(level => level.cycleId === domaines[0]?.cycleId),
      structureId:
        userType === UserType.Student ? session?.user.structures?.[0]?.id : getChildStructureId(dashboardState.selectedChildId),
      studentId: userType === UserType.Student ? userId : dashboardState.selectedChildId,
    };
  },
  dispatch =>
    bindActionCreators<CompetencesAssessmentScreenDispatchProps>(
      {
        tryFetchCompetences: tryAction(fetchCompetencesAction),
        tryFetchDomaines: tryAction(fetchCompetencesDomainesAction),
        tryFetchLevels: tryAction(fetchCompetencesLevelsAction),
      },
      dispatch,
    ),
)(CompetencesAssessmentScreen);
