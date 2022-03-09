import I18n from 'i18n-js';
import * as React from 'react';
import { NavigationInjectedProps } from 'react-navigation';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import { getSessionInfo } from '~/App';
import { PageView } from '~/framework/components/page';
import { getUserSession } from '~/framework/util/session';
import { fetchLevelsAction } from '~/modules/viescolaire/competences/actions/competencesLevels';
import { fetchDevoirListAction } from '~/modules/viescolaire/competences/actions/devoirs';
import { fetchDevoirMoyennesListAction } from '~/modules/viescolaire/competences/actions/moyennes';
import { fetchUserChildrenAction } from '~/modules/viescolaire/competences/actions/userChildren';
import Competences from '~/modules/viescolaire/competences/components/Evaluation';
import { getLevelsListState, ILevelsList } from '~/modules/viescolaire/competences/state/competencesLevels';
import { getDevoirListState, IDevoirsMatieresState } from '~/modules/viescolaire/competences/state/devoirs';
import { getMoyenneListState, IMoyenneListState } from '~/modules/viescolaire/competences/state/moyennes';
import { getUserChildrenState } from '~/modules/viescolaire/competences/state/userChildren';
import { fetchGroupListAction } from '~/modules/viescolaire/viesco/actions/group';
import { fetchPeriodsListAction } from '~/modules/viescolaire/viesco/actions/periods';
import { getSelectedChild, getSelectedChildStructure } from '~/modules/viescolaire/viesco/state/children';
import { getGroupsListState } from '~/modules/viescolaire/viesco/state/group';
import { getPeriodsListState, IPeriodsList } from '~/modules/viescolaire/viesco/state/periods';

export type CompetencesProps = {
  devoirsList: IDevoirsMatieresState;
  devoirsMoyennesList: IMoyenneListState;
  levels: ILevelsList;
  userType: string;
  userId: string;
  periods: IPeriodsList;
  groups: string[];
  childClasses: string;
  structureId: string;
  childId: string;
  fetchChildInfos: (userId: string) => void;
  fetchChildGroups: (classes: string, student: string) => any;
  getDevoirs: (structureId: string, studentId: string, period?: string, matiere?: string) => void;
  getDevoirsMoyennes: (structureId: string, studentId: string, period?: string) => void;
  getPeriods: (structureId: string, groupId: string) => void;
  getLevels: (structureIs: string) => void;
} & NavigationInjectedProps;

export class Evaluation extends React.PureComponent<CompetencesProps, any> {
  componentDidMount = async () => {
    const { structureId, userId, childId, childClasses } = this.props;
    this.props.getDevoirs(structureId, childId);
    this.props.getLevels(structureId);
    if (getSessionInfo().type === 'Relative' && userId !== undefined) await this.props.fetchChildInfos(userId);
    this.props.getPeriods(structureId, childClasses);
    this.props.fetchChildGroups(childClasses, childId);
  };

  componentDidUpdate = async prevProps => {
    const { structureId, userId, childId, childClasses } = this.props;
    if (prevProps.childId !== childId || prevProps.childClasses !== childClasses) {
      if (getSessionInfo().type === 'Relative') await this.props.fetchChildInfos(userId);
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
            backgroundColor: '#F95303',
          },
        }}>
        <Competences {...this.props} />
      </PageView>
    );
  }
}

const mapStateToProps: (state: any) => any = state => {
  const userType = getSessionInfo().type;
  const userId = getUserSession(state).user.id;
  const childId = userType === 'Student' ? userId : getSelectedChild(state)?.id;
  const structureId =
    userType === 'Student'
      ? getSessionInfo().administrativeStructures[0].id || getSessionInfo().structures[0]
      : getSelectedChildStructure(state)?.id;

  // get groups and childClasses
  let childClasses: string = '';
  const groups = [] as string[];
  const childGroups = getGroupsListState(state).data;
  if (getSessionInfo().type === 'Student') {
    childClasses = getSessionInfo().classes[0];
  } else {
    childClasses = getUserChildrenState(state).data!.find(child => childId === child.id)?.idClasse!;
  }
  if (childGroups !== undefined && childGroups[0] !== undefined) {
    if (childGroups[0].nameClass !== undefined) groups.push(childGroups[0].nameClass);
    childGroups[0]?.nameGroups?.forEach(item => groups.push(item));
  } else if (getSessionInfo().type === 'Student') {
    groups.push(getSessionInfo().realClassesNames[0]);
  }

  return {
    devoirsList: getDevoirListState(state),
    devoirsMoyennesList: getMoyenneListState(state),
    levels: getLevelsListState(state).data,
    userType,
    userId,
    periods: getPeriodsListState(state).data,
    groups: getGroupsListState(state).data,
    structureId,
    childId,
    childClasses,
  };
};

const mapDispatchToProps: (dispatch: any) => any = dispatch => {
  return bindActionCreators(
    {
      fetchChildInfos: fetchUserChildrenAction,
      fetchChildGroups: fetchGroupListAction,
      getDevoirs: fetchDevoirListAction,
      getDevoirsMoyennes: fetchDevoirMoyennesListAction,
      getPeriods: fetchPeriodsListAction,
      getLevels: fetchLevelsAction,
    },
    dispatch,
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(Evaluation);
