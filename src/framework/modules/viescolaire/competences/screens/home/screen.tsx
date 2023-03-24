import type { NativeStackNavigationOptions, NativeStackScreenProps } from '@react-navigation/native-stack';
import I18n from 'i18n-js';
import * as React from 'react';
import { RefreshControl } from 'react-native';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { ThunkDispatch } from 'redux-thunk';

import { IGlobalState } from '~/app/store';
import { EmptyContentScreen } from '~/framework/components/emptyContentScreen';
import { LoadingIndicator } from '~/framework/components/loading';
import { PageView } from '~/framework/components/page';
import ScrollView from '~/framework/components/scrollView';
import { getSession } from '~/framework/modules/auth/reducer';
import { UserType } from '~/framework/modules/auth/service';
import ChildPicker from '~/framework/modules/viescolaire/common/components/ChildPicker';
import viescoTheme from '~/framework/modules/viescolaire/common/theme';
import {
  fetchCompetencesDevoirsAction,
  fetchCompetencesLevelsAction,
  fetchCompetencesMoyennesAction,
  fetchCompetencesTermsAction,
  fetchCompetencesUserChildrenAction,
} from '~/framework/modules/viescolaire/competences/actions';
import Competences from '~/framework/modules/viescolaire/competences/components/Evaluation';
import moduleConfig from '~/framework/modules/viescolaire/competences/module-config';
import { CompetencesNavigationParams, competencesRouteNames } from '~/framework/modules/viescolaire/competences/navigation';
import { getSelectedChild, getSelectedChildStructure } from '~/framework/modules/viescolaire/dashboard/state/children';
import { navBarOptions } from '~/framework/navigation/navBar';
import { tryActionLegacy } from '~/framework/util/redux/actions';
import { AsyncPagedLoadingState } from '~/framework/util/redux/asyncPaged';

import type { CompetencesHomeScreenPrivateProps } from './types';

export const computeNavBar = ({
  navigation,
  route,
}: NativeStackScreenProps<CompetencesNavigationParams, typeof competencesRouteNames.home>): NativeStackNavigationOptions => ({
  ...navBarOptions({
    navigation,
    route,
  }),
  title: I18n.t('viesco-tests'),
  headerStyle: {
    backgroundColor: viescoTheme.palette.competences,
  },
});

const CompetencesHomeScreen = (props: CompetencesHomeScreenPrivateProps) => {
  const [loadingState, setLoadingState] = React.useState(props.initialLoadingState ?? AsyncPagedLoadingState.PRISTINE);
  const loadingRef = React.useRef<AsyncPagedLoadingState>();
  loadingRef.current = loadingState;
  // /!\ Need to use Ref of the state because of hooks Closure issue. @see https://stackoverflow.com/a/56554056/6111343

  const fetchAssessments = async () => {
    try {
      const { childId, classes, structureId, userId, userType } = props;

      if (!childId || !structureId || !userId || !userType) throw new Error();
      await props.fetchDevoirs(structureId, childId);
      await props.fetchLevels(structureId);
      let childClasses = classes?.[0];
      if (userType === UserType.Relative) {
        const children = await props.fetchUserChildren(userId);
        childClasses = children.find(c => c.id === childId)?.idClasse;
      }
      await props.fetchTerms(structureId, childClasses ?? '');
    } catch {
      throw new Error();
    }
  };

  const init = () => {
    setLoadingState(AsyncPagedLoadingState.INIT);
    fetchAssessments()
      .then(() => setLoadingState(AsyncPagedLoadingState.DONE))
      .catch(() => setLoadingState(AsyncPagedLoadingState.INIT_FAILED));
  };

  const reload = () => {
    setLoadingState(AsyncPagedLoadingState.RETRY);
    fetchAssessments()
      .then(() => setLoadingState(AsyncPagedLoadingState.DONE))
      .catch(() => setLoadingState(AsyncPagedLoadingState.INIT_FAILED));
  };

  const refreshSilent = () => {
    setLoadingState(AsyncPagedLoadingState.REFRESH_SILENT);
    fetchAssessments()
      .then(() => setLoadingState(AsyncPagedLoadingState.DONE))
      .catch(() => setLoadingState(AsyncPagedLoadingState.REFRESH_FAILED));
  };

  const fetchOnNavigation = () => {
    if (loadingRef.current === AsyncPagedLoadingState.PRISTINE) init();
    else refreshSilent();
  };

  React.useEffect(() => {
    const unsubscribe = props.navigation.addListener('focus', () => {
      fetchOnNavigation();
    });
    return unsubscribe;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.navigation]);

  React.useEffect(() => {
    if (loadingRef.current === AsyncPagedLoadingState.DONE) init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.childId]);

  const renderError = () => {
    return (
      <ScrollView
        refreshControl={<RefreshControl refreshing={loadingState === AsyncPagedLoadingState.RETRY} onRefresh={() => reload()} />}>
        <EmptyContentScreen />
      </ScrollView>
    );
  };

  const renderAssessments = () => {
    return <Competences {...props} />;
  };

  const renderPage = () => {
    switch (loadingState) {
      case AsyncPagedLoadingState.DONE:
      case AsyncPagedLoadingState.REFRESH:
      case AsyncPagedLoadingState.REFRESH_FAILED:
      case AsyncPagedLoadingState.REFRESH_SILENT:
        return renderAssessments();
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
      {props.userType === UserType.Relative && <ChildPicker />}
      {renderPage()}
    </PageView>
  );
};

export default connect(
  (state: IGlobalState) => {
    const competencesState = moduleConfig.getState(state);
    const session = getSession();
    const userId = session?.user.id;
    const userType = session?.user.type;

    return {
      classes: session?.user.classes,
      childId: userType === UserType.Student ? userId : getSelectedChild(state)?.id,
      devoirsMatieres: competencesState.devoirsMatieres,
      initialLoadingState:
        competencesState.devoirsMatieres.isPristine || competencesState.moyennes.isPristine
          ? AsyncPagedLoadingState.PRISTINE
          : AsyncPagedLoadingState.DONE,
      levels: competencesState.levels.data,
      moyennes: competencesState.moyennes,
      structureId: userType === UserType.Student ? session?.user.structures?.[0]?.id : getSelectedChildStructure(state)?.id,
      terms: competencesState.terms.data,
      userId,
      userType,
    };
  },
  (dispatch: ThunkDispatch<any, any, any>) =>
    bindActionCreators(
      {
        fetchDevoirs: tryActionLegacy(
          fetchCompetencesDevoirsAction,
          undefined,
          true,
        ) as unknown as CompetencesHomeScreenPrivateProps['fetchDevoirs'],
        fetchLevels: tryActionLegacy(
          fetchCompetencesLevelsAction,
          undefined,
          true,
        ) as unknown as CompetencesHomeScreenPrivateProps['fetchLevels'],
        fetchMoyennes: tryActionLegacy(
          fetchCompetencesMoyennesAction,
          undefined,
          true,
        ) as unknown as CompetencesHomeScreenPrivateProps['fetchMoyennes'],
        fetchTerms: tryActionLegacy(
          fetchCompetencesTermsAction,
          undefined,
          true,
        ) as unknown as CompetencesHomeScreenPrivateProps['fetchTerms'],
        fetchUserChildren: tryActionLegacy(
          fetchCompetencesUserChildrenAction,
          undefined,
          true,
        ) as unknown as CompetencesHomeScreenPrivateProps['fetchUserChildren'],
      },
      dispatch,
    ),
)(CompetencesHomeScreen);
