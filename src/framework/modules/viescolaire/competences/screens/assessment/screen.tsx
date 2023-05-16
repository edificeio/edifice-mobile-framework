import type { NativeStackNavigationOptions, NativeStackScreenProps } from '@react-navigation/native-stack';
import * as React from 'react';
import { FlatList, RefreshControl, ScrollView } from 'react-native';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { ThunkDispatch } from 'redux-thunk';

import { IGlobalState } from '~/app/store';
import { EmptyContentScreen } from '~/framework/components/emptyContentScreen';
import { LoadingIndicator } from '~/framework/components/loading';
import { PageView } from '~/framework/components/page';
import { getSession } from '~/framework/modules/auth/reducer';
import { UserType } from '~/framework/modules/auth/service';
import {
  fetchCompetencesAction,
  fetchCompetencesDomainesAction,
  fetchCompetencesLevelsAction,
} from '~/framework/modules/viescolaire/competences/actions';
import { DomaineListItem } from '~/framework/modules/viescolaire/competences/components/DomaineListItem';
import moduleConfig from '~/framework/modules/viescolaire/competences/module-config';
import { CompetencesNavigationParams, competencesRouteNames } from '~/framework/modules/viescolaire/competences/navigation';
import { getSelectedChild, getSelectedChildStructure } from '~/framework/modules/viescolaire/dashboard/state/children';
import { navBarOptions } from '~/framework/navigation/navBar';
import { tryActionLegacy } from '~/framework/util/redux/actions';
import { AsyncPagedLoadingState } from '~/framework/util/redux/asyncPaged';

import type { CompetencesAssessmentScreenPrivateProps } from './types';

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
  const [loadingState, setLoadingState] = React.useState(props.initialLoadingState ?? AsyncPagedLoadingState.PRISTINE);
  const loadingRef = React.useRef<AsyncPagedLoadingState>();
  loadingRef.current = loadingState;
  // /!\ Need to use Ref of the state because of hooks Closure issue. @see https://stackoverflow.com/a/56554056/6111343

  const fetchCompetences = async () => {
    try {
      const { structureId, studentId } = props;
      const { studentClass } = props.route.params;

      if (!structureId || !studentId) throw new Error();
      await props.fetchCompetences(studentId, studentClass);
      await props.fetchDomaines(studentClass);
      await props.fetchLevels(structureId);
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
      <FlatList
        data={domaines}
        keyExtractor={item => item.id.toString()}
        renderItem={({ item }) => <DomaineListItem competences={competences} domaine={item} levels={levels} />}
      />
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
    const session = getSession();
    const userId = session?.user.id;
    const userType = session?.user.type;

    return {
      competences: competencesState.competences.data,
      domaines: competencesState.domaines.data,
      initialLoadingState:
        competencesState.competences.isPristine || competencesState.domaines.isPristine
          ? AsyncPagedLoadingState.PRISTINE
          : AsyncPagedLoadingState.DONE,
      levels: competencesState.levels.data,
      structureId: userType === UserType.Student ? session?.user.structures?.[0]?.id : getSelectedChildStructure(state)?.id,
      studentId: userType === UserType.Student ? userId : getSelectedChild(state)?.id,
    };
  },
  (dispatch: ThunkDispatch<any, any, any>) =>
    bindActionCreators(
      {
        fetchCompetences: tryActionLegacy(
          fetchCompetencesAction,
          undefined,
          true,
        ) as unknown as CompetencesAssessmentScreenPrivateProps['fetchCompetences'],
        fetchDomaines: tryActionLegacy(
          fetchCompetencesDomainesAction,
          undefined,
          true,
        ) as unknown as CompetencesAssessmentScreenPrivateProps['fetchDomaines'],
        fetchLevels: tryActionLegacy(
          fetchCompetencesLevelsAction,
          undefined,
          true,
        ) as unknown as CompetencesAssessmentScreenPrivateProps['fetchLevels'],
      },
      dispatch,
    ),
)(CompetencesAssessmentScreen);