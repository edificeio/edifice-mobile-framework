import I18n from 'i18n-js';
import * as React from 'react';
import { NavigationInjectedProps } from 'react-navigation';
import { connect } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';

import { IGlobalState } from '~/AppStore';
import { PageView } from '~/framework/components/page';
import { AsyncState } from '~/framework/util/redux/async';
import { getUserSession } from '~/framework/util/session';
import {
  fetchCompetencesDevoirsAction,
  fetchCompetencesLevelsAction,
  fetchCompetencesMoyennesAction,
  fetchCompetencesUserChildrenAction,
} from '~/modules/viescolaire/competences/actions';
import Competences from '~/modules/viescolaire/competences/components/Evaluation';
import moduleConfig from '~/modules/viescolaire/competences/moduleConfig';
import { IDevoirsMatieres, ILevel, IMoyenne } from '~/modules/viescolaire/competences/reducer';
import { fetchGroupListAction } from '~/modules/viescolaire/dashboard/actions/group';
import { fetchPeriodsListAction } from '~/modules/viescolaire/dashboard/actions/periods';
import { getSelectedChild, getSelectedChildStructure } from '~/modules/viescolaire/dashboard/state/children';
import { getGroupsListState } from '~/modules/viescolaire/dashboard/state/group';
import { IPeriodsList, getPeriodsListState } from '~/modules/viescolaire/dashboard/state/periods';
import { viescoTheme } from '~/modules/viescolaire/dashboard/utils/viescoTheme';

type CompetenceEventProps = {
  fetchChildInfos: (userId: string) => void;
  fetchChildGroups: (classes: string, student: string) => any;
  getDevoirs: (structureId: string, studentId: string, period?: string, matiere?: string) => void;
  getDevoirsMoyennes: (structureId: string, studentId: string, period?: string) => void;
  getPeriods: (structureId: string, groupId: string) => void;
  getLevels: (structureIs: string) => void;
};

export type CompetencesProps = {
  devoirsList: AsyncState<IDevoirsMatieres>;
  devoirsMoyennesList: AsyncState<IMoyenne[]>;
  levels: ILevel[];
  userType: string;
  userId: string;
  periods: IPeriodsList;
  groups: string[];
  childClasses: string;
  structureId: string;
  childId: string;
} & CompetenceEventProps &
  NavigationInjectedProps;

export class Evaluation extends React.PureComponent<CompetencesProps, any> {
  componentDidMount = async () => {
    const { structureId, userId, childId, childClasses } = this.props;
    this.props.getDevoirs(structureId, childId);
    this.props.getLevels(structureId);
    if (getUserSession().user.type === 'Relative' && userId !== undefined) await this.props.fetchChildInfos(userId);
    this.props.getPeriods(structureId, childClasses);
    this.props.fetchChildGroups(childClasses, childId);
  };

  componentDidUpdate = async prevProps => {
    const { structureId, userId, childId, childClasses } = this.props;
    if (prevProps.childId !== childId || prevProps.childClasses !== childClasses) {
      if (getUserSession().user.type === 'Relative') await this.props.fetchChildInfos(userId);
      this.props.getDevoirs(structureId, childId);
      this.props.getPeriods(structureId, childClasses);
      this.props.fetchChildGroups(childClasses, childId);
    }
  };

  public render() {
    return (
      <PageView
        navigation={this.props.navigation}
        navBarWithBack={{
          title: I18n.t('viesco-tests'),
          style: {
            backgroundColor: viescoTheme.palette.competences,
          },
        }}>
        <Competences {...this.props} />
      </PageView>
    );
  }
}

const mapStateToProps = (gs: any): any => {
  const state = moduleConfig.getState(gs);
  const userType = getUserSession().user.type;
  const userId = getUserSession().user.id;
  const childId = userType === 'Student' ? userId : getSelectedChild(gs)?.id;
  const structureId =
    userType === 'Student'
      ? gs.user.info.administrativeStructures[0].id || gs.user.info.structures[0]
      : getSelectedChildStructure(gs)?.id;

  // get groups and childClasses
  let childClasses: string = '';
  const groups = [] as string[];
  const childGroups = getGroupsListState(gs).data;
  if (getUserSession().user.type === 'Student') {
    childClasses = gs.user.info.classes[0];
  } else {
    childClasses = state.userChildren.data!.find(child => childId === child.id)?.idClasse!;
  }
  if (childGroups !== undefined && childGroups[0] !== undefined) {
    if (childGroups[0].nameClass !== undefined) groups.push(childGroups[0].nameClass);
    childGroups[0]?.nameGroups?.forEach(item => groups.push(item));
  } else if (getUserSession().user.type === 'Student') {
    groups.push(gs.user.info.realClassesNames[0]);
  }

  return {
    devoirsList: state.devoirsMatieres,
    devoirsMoyennesList: state.moyennes,
    levels: state.levels.data,
    userType,
    userId,
    periods: getPeriodsListState(gs).data,
    groups: getGroupsListState(gs).data,
    structureId,
    childId,
    childClasses,
  };
};

const mapDispatchToProps: (dispatch: ThunkDispatch<any, any, any>, getState: () => IGlobalState) => CompetenceEventProps = (
  dispatch,
  getState,
) => ({
  fetchChildInfos: async (userId: string) => {
    return dispatch(fetchCompetencesUserChildrenAction(userId));
  },
  fetchChildGroups: async (classes: string, student: string) => {
    return dispatch(fetchGroupListAction(classes, student));
  },
  getDevoirs: async (structureId: string, studentId: string, periods?: string, matiere?: string) => {
    return dispatch(fetchCompetencesDevoirsAction(structureId, studentId, periods, matiere));
  },
  getDevoirsMoyennes: async (structureId: string, studentId: string, period?: string) => {
    return dispatch(fetchCompetencesMoyennesAction(structureId, studentId, period));
  },
  getPeriods: async (structureId: string, groupId: string) => {
    return dispatch(fetchPeriodsListAction(structureId, groupId));
  },
  getLevels: async (structureId: string) => {
    return dispatch(fetchCompetencesLevelsAction(structureId));
  },
  dispatch,
});

export default connect(mapStateToProps, mapDispatchToProps)(Evaluation);
