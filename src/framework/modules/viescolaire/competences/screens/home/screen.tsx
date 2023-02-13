import type { NativeStackNavigationOptions, NativeStackScreenProps } from '@react-navigation/native-stack';
import I18n from 'i18n-js';
import * as React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { ThunkDispatch } from 'redux-thunk';

import { IGlobalState } from '~/app/store';
import { PageView } from '~/framework/components/page';
import { getSession } from '~/framework/modules/auth/reducer';
import { UserType } from '~/framework/modules/auth/service';
import viescoTheme from '~/framework/modules/viescolaire/common/theme';
import {
  fetchCompetencesDevoirsAction,
  fetchCompetencesLevelsAction,
  fetchCompetencesMoyennesAction,
  fetchCompetencesUserChildrenAction,
} from '~/framework/modules/viescolaire/competences/actions';
import Competences from '~/framework/modules/viescolaire/competences/components/Evaluation';
import moduleConfig from '~/framework/modules/viescolaire/competences/module-config';
import { CompetencesNavigationParams, competencesRouteNames } from '~/framework/modules/viescolaire/competences/navigation';
import { fetchGroupListAction } from '~/framework/modules/viescolaire/dashboard/actions/group';
import { fetchPeriodsListAction } from '~/framework/modules/viescolaire/dashboard/actions/periods';
import { getSelectedChild, getSelectedChildStructure } from '~/framework/modules/viescolaire/dashboard/state/children';
import { getGroupsListState } from '~/framework/modules/viescolaire/dashboard/state/group';
import { getPeriodsListState } from '~/framework/modules/viescolaire/dashboard/state/periods';
import { navBarOptions } from '~/framework/navigation/navBar';
import { tryAction } from '~/framework/util/redux/actions';

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

class CompetencesHomeScreen extends React.PureComponent<CompetencesHomeScreenPrivateProps, any> {
  componentDidMount = async () => {
    const { structureId, userId, userType, childId, childClasses } = this.props;
    this.props.getDevoirs(structureId, childId);
    this.props.getLevels(structureId);
    if (userType === UserType.Relative && userId !== undefined) await this.props.fetchChildInfos(userId);
    this.props.getPeriods(structureId, childClasses);
    this.props.fetchChildGroups(childClasses, childId);
  };

  componentDidUpdate = async prevProps => {
    const { structureId, userId, userType, childId, childClasses } = this.props;
    if (prevProps.childId !== childId || prevProps.childClasses !== childClasses) {
      if (userType === UserType.Relative) await this.props.fetchChildInfos(userId);
      this.props.getDevoirs(structureId, childId);
      this.props.getPeriods(structureId, childClasses);
      this.props.fetchChildGroups(childClasses, childId);
    }
  };

  public render() {
    return (
      <PageView>
        <Competences {...this.props} />
      </PageView>
    );
  }
}

export default connect(
  (state: IGlobalState) => () => {
    const competencesState = moduleConfig.getState(state);
    const session = getSession(state);
    const userId = session?.user.id;
    const userType = session?.user.type;
    const childId = userType === UserType.Student ? userId : getSelectedChild(state)?.id;
    const structureId = userType === UserType.Student ? session?.user.structures?.[0]?.id : getSelectedChildStructure(state)?.id;

    // get groups and childClasses
    let childClasses: string = '';
    const groups = [] as string[];
    const childGroups = getGroupsListState(state).data;
    if (userType === UserType.Student) {
      childClasses = state.user.info.classes[0];
    } else {
      childClasses = competencesState.userChildren.data.find(child => childId === child.id)?.idClasse!;
    }
    if (childGroups !== undefined && childGroups[0] !== undefined) {
      if (childGroups[0].nameClass !== undefined) groups.push(childGroups[0].nameClass);
      childGroups[0]?.nameGroups?.forEach(item => groups.push(item));
    } else if (userType === UserType.Student) {
      groups.push(state.user.info.realClassesNames[0]);
    }

    return {
      devoirsList: competencesState.devoirsMatieres,
      devoirsMoyennesList: competencesState.moyennes,
      levels: competencesState.levels.data,
      userType,
      userId,
      periods: getPeriodsListState(state).data,
      groups: getGroupsListState(state).data,
      structureId,
      childId,
      childClasses,
    };
  },
  (dispatch: ThunkDispatch<any, any, any>) =>
    bindActionCreators(
      {
        fetchChildInfos: tryAction(fetchCompetencesUserChildrenAction, undefined, true),
        fetchChildGroups: tryAction(fetchGroupListAction, undefined, true),
        getDevoirs: tryAction(fetchCompetencesDevoirsAction, undefined, true),
        getDevoirsMoyennes: tryAction(fetchCompetencesMoyennesAction, undefined, true),
        getPeriods: tryAction(fetchPeriodsListAction, undefined, true),
        getLevels: tryAction(fetchCompetencesLevelsAction, undefined, true),
      },
      dispatch,
    ),
)(CompetencesHomeScreen);
